// Default Mock Data for Fallback
const MOCK_DATA = [
    {
        id: "1",
        name: "DJ Snake",
        category: "Sound & Lighting",
        priceRange: "$2000 - $5000",
        rating: 4.9,
        location: "Los Angeles, CA",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Transform your event with world-class sound mixing and spectacular lighting setups. Over 10 years of experience in electrifying crowds."
    },
    {
        id: "2",
        name: "Gourmet Masters",
        category: "Catering",
        priceRange: "$1500 - $4000",
        rating: 4.8,
        location: "New York, NY",
        image: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Exquisite culinary experiences tailored for premium events, weddings, and corporate galas. Specializing in organic, farm-to-table cuisine."
    },
    {
        id: "3",
        name: "Emma Stone Hosting",
        category: "Event Hosts",
        priceRange: "$3000 - $8000",
        rating: 5.0,
        location: "London, UK",
        image: "https://images.unsplash.com/photo-1583864697784-a0efc8d1964d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Engaging and professional event host capable of commanding large audiences with wit and charm."
    },
    {
        id: "4",
        name: "Floral Heaven Decor",
        category: "Decorations",
        priceRange: "$1000 - $3500",
        rating: 4.7,
        location: "Miami, FL",
        image: "https://images.unsplash.com/photo-1519167758481-83f540f28b07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Breathtaking floral and structural decorations that turn ordinary venues into magical spaces."
    },
    {
        id: "5",
        name: "Kevin Hart Live",
        category: "Celebrities",
        priceRange: "$15000 - $30000",
        rating: 4.9,
        location: "Las Vegas, NV",
        image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Bring the ultimate comedy experience to your exclusive event with world-renowned talent."
    },
    {
        id: "6",
        name: "Echo Sound Systems",
        category: "Sound & Lighting",
        priceRange: "$800 - $2500",
        rating: 4.5,
        location: "Chicago, IL",
        image: "https://images.unsplash.com/photo-1470229722913-7c092bce8e4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Complete PA systems and atmospheric lighting design for medium to large-scale events."
    }
];

// Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api/services' 
    : 'https://eventexpo.onrender.com/api/services';
const ADMIN_PHONE = '918147131299'; // New WhatsApp number from user

// State Manager
const state = {
    allServices: [],
    displayedServices: [],
    currentFilter: 'All',
    searchQuery: '',
    page: 1,
    limit: 6,
    sortBy: 'none'
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    showLoader();
    try {
        // Try fetching from real API first
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('API down');
        const data = await response.json();
        // If API returns zero items, try falling back to LocalStorage to show user's recent local work
        if (data && data.length > 0) {
            state.allServices = data;
        } else {
            console.log('API returned empty list, checking LocalStorage fallback.');
            const localData = localStorage.getItem('eventExpoServices');
            if (localData && JSON.parse(localData).length > 0) {
                state.allServices = JSON.parse(localData);
            } else {
                state.allServices = MOCK_DATA;
                localStorage.setItem('eventExpoServices', JSON.stringify(MOCK_DATA));
            }
        }
    } catch (error) {
        console.warn('API fetch failed, falling back to LocalStorage:', error.message);
        const localData = localStorage.getItem('eventExpoServices');
        if (localData && JSON.parse(localData).length > 0) {
            state.allServices = JSON.parse(localData);
        } else {
            state.allServices = MOCK_DATA;
            localStorage.setItem('eventExpoServices', JSON.stringify(MOCK_DATA));
        }
    }

    hideLoader();
    applyFilters();
    setupRevealAnimations();
    init3DHero();
}

// Event Listeners
function setupEventListeners() {
    // Modern Mobile Menu Logic
    const menuToggle = document.getElementById('menuToggle');
    const mobileClose = document.getElementById('mobileClose');
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;

    const toggleMenu = (show) => {
        if (show) {
            menuToggle.classList.add('menu-open');
            mobileMenu.classList.add('open');
            body.style.overflow = 'hidden';
        } else {
            menuToggle.classList.remove('menu-open');
            mobileMenu.classList.remove('open');
            body.style.overflow = '';
        }
    };

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => toggleMenu(!mobileMenu.classList.contains('open')));
        if (mobileClose) mobileClose.addEventListener('click', () => toggleMenu(false));

        // Close menu on link click & switch view if needed
        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                toggleMenu(false);
                
                // If it's an internal link, ensure we are on Home view
                if (href.startsWith('#')) {
                    switchView('home');
                }
            });
        });
    }

    // View Switching Logic
    window.switchView = function(viewId) {
        const homeView = document.getElementById('homeView');
        const servicesView = document.getElementById('servicesView');
        
        if (viewId === 'home') {
            homeView.style.display = 'block';
            servicesView.style.display = 'none';
        } else {
            homeView.style.display = 'none';
            servicesView.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setupRevealAnimations();
    };

    // Navbar Scroll & Active Section Tracking
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    // Home links in navbar should ensure home view is active
    // Global Section link logic (Navbar + Footer Quick Links)
    const allInternalLinks = document.querySelectorAll('a[href^="#"]:not(#backToHomeBtn)');
    allInternalLinks.forEach(link => {
        link.addEventListener('click', () => {
            const href = link.getAttribute('href');
            if (href && href !== '#') {
                switchView('home');
            }
        });
    });

    // Back to Home Button
    const backBtn = document.getElementById('backToHomeBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => switchView('home'));
    }

    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        const scrollCoords = window.scrollY;

        // Navbar floating pill effect
        if (nav) {
            if (scrollCoords > 50) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        }

        // Active Link Highlighting
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollCoords >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').includes(current) && current !== "") {
                item.classList.add('active');
            }
        });
    });

    // Magnetic Effect for Nav Links
    const magneticLinks = document.querySelectorAll('.nav-item, .mobile-link');
    magneticLinks.forEach(link => {
        link.addEventListener('mousemove', (e) => {
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            link.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        link.addEventListener('mouseleave', () => {
            link.style.transform = `translate(0px, 0px)`;
        });
    });

    // Category Filtering
    const categoryBtns = document.querySelectorAll('.category-card');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.currentFilter = e.currentTarget.dataset.filter;
            state.page = 1;
            applyFilters();
            switchView('services');
        });
    });

    // Search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            state.searchQuery = e.target.value.toLowerCase();
            state.page = 1;
            applyFilters();
        });
        searchBtn.addEventListener('click', () => {
            state.searchQuery = searchInput.value.toLowerCase();
            state.page = 1;
            applyFilters();
        });
    }

    // Sorting
    const sortSelect = document.getElementById('sortPrice');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            applyFilters();
        });
    }

    // Load More
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            state.page++;
            renderServices(true);
        });
    }

    // Modal Close
    const modalOverlay = document.getElementById('serviceModal');
    const closeModalBtn = document.querySelector('.close-modal');
    if (modalOverlay && closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Custom Sorting Dropdown
    const customSelect = document.getElementById('sortCustomSelect');
    const selectTrigger = customSelect?.querySelector('.select-trigger');
    const selectLabel = document.getElementById('selectLabel');
    const options = customSelect?.querySelectorAll('.option');

    if (customSelect && selectTrigger) {
        selectTrigger.addEventListener('click', () => {
            customSelect.classList.toggle('active');
        });

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.dataset.value;
                const text = opt.textContent;
                
                // Update state
                state.sortBy = val;
                
                // Update UI
                selectLabel.textContent = text;
                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                customSelect.classList.remove('active');
                
                // Trigger refresh
                applyFilters();
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('active');
            }
        });
    }
}

// Data Processing
function applyFilters() {
    let filtered = [...state.allServices];

    // Filter by category
    if (state.currentFilter !== 'All') {
        filtered = filtered.filter(s => s.category.includes(state.currentFilter) || s.category === state.currentFilter);
    }

    // Filter by search
    if (state.searchQuery) {
        filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(state.searchQuery) ||
            s.location.toLowerCase().includes(state.searchQuery)
        );
    }

    // Sorting logic 
    if (state.sortBy !== 'none') {
        filtered.sort((a, b) => {
            if (state.sortBy === 'rating') {
                return (b.rating || 0) - (a.rating || 0); // High to Low
            }
            if (state.sortBy === 'location') {
                return a.location.localeCompare(b.location); // A-Z
            }
            
            const getMinPrice = (priceStr) => {
                const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
                return isNaN(num) ? 0 : num;
            };
            const valA = getMinPrice(a.priceRange);
            const valB = getMinPrice(b.priceRange);
            
            if (state.sortBy === 'price-low') return valA - valB;
            if (state.sortBy === 'price-high') return valB - valA;
            return 0;
        });
    }

    state.displayedServices = filtered;
    renderServices(false);
}

// Rendering
function renderServices(append = false) {
    const grid = document.getElementById('servicesGrid');
    const emptyState = document.getElementById('emptyState');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (!grid) return;

    if (!append) grid.innerHTML = '';

    const startIndex = append ? (state.page - 1) * state.limit : 0;
    const endIndex = state.page * state.limit;
    const servicesToRender = state.displayedServices.slice(startIndex, endIndex);

    if (state.displayedServices.length === 0) {
        emptyState.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';

    servicesToRender.forEach((service, index) => {
        const card = document.createElement('div');
        card.className = 'service-card reveal';
        // Add staggered animation delay
        if (!append) card.style.transitionDelay = `${index * 0.1}s`;

        card.innerHTML = `
            <div class="card-image">
                <div class="category-badge">${service.category}</div>
                <img src="${service.image || 'https://via.placeholder.com/800x400?text=Event+Service'}" alt="${service.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/800x400?text=Image+Not+Found'">
            </div>
            <div class="card-content">
                <h3 class="card-title">${service.name}</h3>
                <div class="card-meta">
                    <span><i class="fa-solid fa-star"></i> ${service.rating}</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${service.location}</span>
                </div>
                <div class="card-price">₹ ${service.priceRange}</div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="bookService('${service._id || service.id}')">Book Now</button>
                    <button class="btn btn-outline" onclick="openModal('${service._id || service.id}')">Know More</button>
                </div>
            </div>
        `;
        grid.appendChild(card);

        // Trigger reflow for animation
        setTimeout(() => card.classList.add('active'), 50);
    });

    if (endIndex >= state.displayedServices.length) {
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    } else {
        if (loadMoreBtn) loadMoreBtn.style.display = 'inline-block';
    }

    setupRevealAnimations();
}

// Actions
function openModal(id) {
    const service = state.allServices.find(s => s.id === id || s._id === id);
    if (!service) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <img src="${service.image}" class="modal-img" alt="${service.name}" onerror="this.src='https://via.placeholder.com/800x400?text=Image+Not+Found'">
        <div class="modal-details">
            <div class="category-badge" style="position:relative; display:inline-block; top:0; left:0; margin-bottom:10px;">${service.category}</div>
            <h2>${service.name}</h2>
            <div class="modal-meta">
                <span><i class="fa-solid fa-star"></i> ${service.rating} / 5.0</span>
                <span><i class="fa-solid fa-location-dot"></i> ${service.location}</span>
            </div>
            <p class="modal-desc">${service.moreInfo || service.description || 'No detailed description available.'}</p>
            <div class="modal-price">₹ ${service.priceRange}</div>
            <button class="primary-btn" style="width:100%" onclick="bookService('${id}')">Book Now via WhatsApp</button>
        </div>
    `;

    document.getElementById('serviceModal').classList.add('active');
}

function closeModal() {
    document.getElementById('serviceModal').classList.remove('active');
}

window.bookService = function (id) {
    const service = state.allServices.find(s => s.id === id || s._id === id);
    if (!service) return;

    const message = `Hello EventExpo Admin! I am interested in booking "${service.name}" (${service.category}) for my event. Can you provide more details?`;
    const whatsappUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Helpers
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex';
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}

function setupRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const windowHeight = window.innerHeight;

    const revealFunc = () => {
        reveals.forEach(reveal => {
            const revealTop = reveal.getBoundingClientRect().top;
            const revealPoint = 100;

            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealFunc);
    revealFunc(); // Trigger once on load
}

// Three.js Hero Scene (Audio Visualizer / Stage Layout)
function init3DHero() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    // Isometric/Stage Camera Angle
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    const heroSection = document.getElementById('home');
    renderer.setSize(window.innerWidth, heroSection.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);

    // Audio Visualizer Bars
    const barsCount = 40;
    const bars = [];
    const barGeometry = new THREE.BoxGeometry(0.8, 1, 0.8);
    const barMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x38bdf8, 
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8
    });

    const totalWidth = barsCount * 1.2;
    for(let i = 0; i < barsCount; i++) {
        const bar = new THREE.Mesh(barGeometry, barMaterial);
        bar.position.x = (i * 1.2) - (totalWidth / 2);
        // Base random wave attribute
        bar.userData.phase = i * 0.4;
        bar.userData.randomOffset = Math.random() * 2;
        group.add(bar);
        bars.push(bar);
    }

    // Floor grid or subtle stage element
    const stageGeo = new THREE.PlaneGeometry(100, 40);
    const stageMat = new THREE.MeshBasicMaterial({ 
        color: 0x38bdf8, 
        transparent: true, 
        opacity: 0.15,
        wireframe: true
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.rotation.x = -Math.PI / 2;
    stage.position.y = -0.5;
    scene.add(stage);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Spotlight effect
    const spotLight = new THREE.SpotLight(0x38bdf8, 6);
    spotLight.position.set(0, 30, 20);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.5;
    scene.add(spotLight);

    const backLight = new THREE.PointLight(0x0ea5e9, 2, 50);
    backLight.position.set(0, 5, -10);
    scene.add(backLight);

    // Pure Scroll interaction with Smooth Lerp
    let targetScroll = 0;
    let currentScroll = 0;
    
    window.addEventListener('scroll', () => {
        targetScroll = window.scrollY;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Smooth scroll interpolation
        currentScroll += (targetScroll - currentScroll) * 0.05;

        // Animate Bars
        bars.forEach((bar, index) => {
            // Idle wave + Scroll speed bump
            const wave = Math.sin(bar.userData.phase + elapsedTime * 3 + currentScroll * 0.002) * 3;
            const wave2 = Math.cos(bar.userData.phase * 0.8 - elapsedTime * 2) * 2;
            
            // Calculating height
            let h = 4 + wave + wave2 + bar.userData.randomOffset + (currentScroll * 0.005 * (index % 3));
            if (h < 0.5) h = 0.5;
            
            bar.scale.y = h;
            bar.position.y = h / 2; // Anchored to base
        });

        // Dynamic, dramatic rotation strictly bound to scroll
        // The visualizer slightly twists as you scroll down
        group.rotation.x = currentScroll * 0.0005;
        group.rotation.y = currentScroll * 0.00025;

        // Cinematic pan out
        camera.position.z = 30 + currentScroll * 0.01;
        camera.position.y = 15 + currentScroll * 0.005;
        camera.lookAt(0, currentScroll * 0.005, 0);

        renderer.render(scene, camera);
    }
    animate();

    // Responsive Canvas
    window.addEventListener('resize', () => {
        if(heroSection) {
            camera.aspect = window.innerWidth / heroSection.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, heroSection.offsetHeight);
        }
    });
}
