// Admin Logic for EventExpo
const API_URL = 'http://localhost:5000/api/services';
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
    document.getElementById('servicesTable').style.display = 'none';
    
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
            // Setup some initial data if completely empty
            adminServices = [];
        }
    }
    
    document.getElementById('adminLoader').style.display = 'none';
    document.getElementById('servicesTable').style.display = 'table';
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if(adminServices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No services found. Add one above.</td></tr>';
        return;
    }

    adminServices.forEach(service => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${service.name}</strong></td>
            <td><span class="category-badge" style="position:relative;top:0;left:0">${service.category}</span></td>
            <td>${service.location}</td>
            <td>${service.priceRange}</td>
            <td>
                <button class="btn-sm btn-edit" onclick="editService('${service.id || service._id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-sm btn-delete" onclick="deleteService('${service.id || service._id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
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
            image: document.getElementById('image').value
        };

        if (!serviceData.image) {
            alert('Please upload a photo for the service provider.');
            return;
        }

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
    
    renderTable();
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
    
    renderTable();
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
    
    renderTable();
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
