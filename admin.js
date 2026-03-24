// Admin Logic for EventExpo
const API_URL = 'https://eventexpo.onrender.com/api/services';
let adminServices = [];
let isEditing = false;
let currentEditId = null;

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', () => {
    fetchServices();
    setupAdminListeners();
});

async function fetchServices() {
    document.getElementById('adminLoader').style.display = 'flex';
    document.getElementById('servicesList').innerHTML = '';
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('API down');
        adminServices = await response.json();
    } catch (error) {
        console.warn('API not available, falling back to LocalStorage');
        const localData = localStorage.getItem('eventExpoServices');
        if (localData) {
            adminServices = JSON.parse(localData);
        } else {
            adminServices = [];
        }
    }
    
    document.getElementById('adminLoader').style.display = 'none';
    document.getElementById('serviceCount').innerText = `${adminServices.length} Providers Found`;
    renderList();
}

function renderList() {
    const listContainer = document.getElementById('servicesList');
    listContainer.innerHTML = '';

    if(adminServices.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">No service providers found. Begin by adding one today!</div>';
        return;
    }

    adminServices.forEach(service => {
        const card = document.createElement('div');
        card.className = 'admin-service-card';
        card.innerHTML = `
            <div class="card-left">
                <img src="${service.image || 'https://via.placeholder.com/200x200?text=No+Photo'}" alt="Provider">
            </div>
            <div class="card-mid">
                <h3>${service.name}</h3>
                <div class="card-meta-admin">
                    <span><i class="fa-solid fa-tag"></i> ${service.category}</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${service.location}</span>
                    <span><i class="fa-solid fa-indian-rupee-sign"></i> ${service.priceRange}</span>
                </div>
            </div>
            <div class="card-right">
                <button class="btn-admin-sm edit" onclick="editService('${service.id || service._id}')"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                <button class="btn-admin-sm delete" onclick="deleteService('${service.id || service._id}')"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

function setupAdminListeners() {
    const form = document.getElementById('adminForm');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // Image Upload Handling
    const imageFile = document.getElementById('imageFile');
    const imageHidden = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const previewContainer = document.getElementById('imagePreviewContainer');

    imageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                imageHidden.value = base64;
                imagePreview.src = base64;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const serviceData = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            priceRange: document.getElementById('priceRange').value,
            rating: parseFloat(document.getElementById('rating').value),
            location: document.getElementById('location').value,
            moreInfo: document.getElementById('moreInfo').value, // New field Added
            image: document.getElementById('image').value
        };

        // Image is no longer mandatory, but we can set a default if needed
        // serviceData.image will be an empty string if not provided


        if (isEditing && currentEditId) {
            await updateServiceAPI(currentEditId, serviceData);
        } else {
            serviceData.id = Date.now().toString(); // Temporary ID for localStorage fallback
            await addServiceAPI(serviceData);
        }
    });

    cancelBtn.addEventListener('click', resetForm);
}

window.editService = function(id) {
    const service = adminServices.find(s => s.id === id || s._id === id);
    if (!service) return;

    isEditing = true;
    currentEditId = id;

    document.getElementById('formTitle').innerText = 'Edit Service';
    document.getElementById('submitBtn').innerText = 'Update Service';
    document.getElementById('cancelBtn').style.display = 'block';

    document.getElementById('name').value = service.name;
    document.getElementById('category').value = service.category;
    document.getElementById('priceRange').value = service.priceRange;
    document.getElementById('rating').value = service.rating;
    document.getElementById('location').value = service.location;
    document.getElementById('moreInfo').value = service.moreInfo || '';
    document.getElementById('image').value = service.image;

    // Show preview on edit
    if (service.image) {
        document.getElementById('imagePreview').src = service.image;
        document.getElementById('imagePreviewContainer').style.display = 'block';
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.deleteService = async function(id) {
    if(!confirm('Are you sure you want to delete this service provider?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if(!response.ok) throw new Error('API down');
        
        adminServices = adminServices.filter(s => s._id !== id && s.id !== id);
    } catch(error) {
        // Fallback LocalStorage Delete
        adminServices = adminServices.filter(s => s.id !== id && s._id !== id);
        localStorage.setItem('eventExpoServices', JSON.stringify(adminServices));
    }
    
    document.getElementById('serviceCount').innerText = `${adminServices.length} Providers Found`;
    renderList();
}

async function addServiceAPI(serviceData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceData)
        });
        if(!response.ok) throw new Error('API down');
        
        const newService = await response.json();
        adminServices.unshift(newService);
    } catch(error) {
        // Fallback LocalStorage Add
        adminServices.unshift(serviceData);
        localStorage.setItem('eventExpoServices', JSON.stringify(adminServices));
    }
    
    document.getElementById('serviceCount').innerText = `${adminServices.length} Providers Found`;
    renderList();
    resetForm();
    alert('Service successfully added!');
}

async function updateServiceAPI(id, serviceData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(serviceData)
        });
        if(!response.ok) throw new Error('API down');
        
        const updatedService = await response.json();
        const index = adminServices.findIndex(s => s._id === id || s.id === id);
        if(index > -1) adminServices[index] = updatedService;
    } catch(error) {
        // Fallback LocalStorage Update
        const index = adminServices.findIndex(s => s._id === id || s.id === id);
        if(index > -1) {
            adminServices[index] = { ...adminServices[index], ...serviceData };
            localStorage.setItem('eventExpoServices', JSON.stringify(adminServices));
        }
    }
    
    renderList();
    resetForm();
    alert('Service successfully updated!');
}

function resetForm() {
    isEditing = false;
    currentEditId = null;
    document.getElementById('adminForm').reset();
    document.getElementById('formTitle').innerText = 'Add New Service';
    document.getElementById('submitBtn').innerText = 'Add Service Provider';
    document.getElementById('cancelBtn').style.display = 'none';
    
    // Reset image preview
    document.getElementById('image').value = '';
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
}
