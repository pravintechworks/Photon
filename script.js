// 1. DATABASE STRUCTURE
const defaultData = {
    admin: { name: 'Master Admin', email: 'admin@photon.com', pass: 'admin123', siteName: 'PHOTON' },
    users: [],
    categories: [
        { id: 'nature', name: 'Nature', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05' },
        { id: 'wildlife', name: 'Wildlife', img: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f' },
        { id: 'landscape', name: 'Landscape', img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e' },
        { id: 'village', name: 'Village', img: 'https://images.unsplash.com/photo-1596708684279-3e334ab9c19b' }
    ],
    photos: []
};

let siteData = JSON.parse(localStorage.getItem('photonMasterData')) || defaultData;
if(!siteData.users) siteData.users = [];
if(!siteData.admin.name) siteData.admin.name = 'Master Admin';
if(!siteData.admin.siteName) siteData.admin.siteName = 'PHOTON';

let currentUser = localStorage.getItem('photonUser');
let currentViewingCat = 'all';
let currentImage = null; 

// Apply Site Name dynamically
document.getElementById('siteMainLogo').innerText = siteData.admin.siteName;
document.getElementById('mainDocTitle').innerText = siteData.admin.siteName + " Photography";

// 2. SCROLL LOGIC
const scrollContainer = document.querySelector('.slider-wrapper');
scrollContainer.addEventListener('wheel', (evt) => {
    evt.preventDefault();
    scrollContainer.scrollLeft += evt.deltaY;
});

// 3. ADMIN SHORTCUT: Ctrl + B + G
let keysPressed = {};
window.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
    if (e.ctrlKey && keysPressed['b'] && keysPressed['g']) {
        e.preventDefault();
        openModal('adminAuthModal');
        keysPressed = {};
    }
});
window.addEventListener('keyup', (e) => {
    delete keysPressed[e.key.toLowerCase()];
});

// 4. ADMIN DASHBOARD LOGIC
function verifyAdmin() {
    const enteredPass = document.getElementById('adminSecretKey').value;
    if (enteredPass === siteData.admin.pass) {
        closeModal('adminAuthModal');
        document.getElementById('adminSecretKey').value = '';
        openModal('masterAdminModal');
        initAdminPanel();
    } else {
        alert("Incorrect Admin Password!");
    }
}

function initAdminPanel() {
    // Populate Admin Profile Data
    document.getElementById('adminDispName').innerText = siteData.admin.name;
    document.getElementById('adminDispEmail').innerText = siteData.admin.email;
    document.getElementById('adminWelcomeMsg').innerText = `Welcome back, ${siteData.admin.name}. Here's your website overview.`;
    
    // Populate Settings Inputs
    document.getElementById('editAdminName').value = siteData.admin.name;
    document.getElementById('editAdminEmail').value = siteData.admin.email;
    document.getElementById('editSiteTitle').value = siteData.admin.siteName;
    
    // Upload Select
    const upCat = document.getElementById('upCat');
    upCat.innerHTML = siteData.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    // Stats
    document.getElementById('statTotalUsers').innerText = siteData.users.length;
    document.getElementById('statTotalPhotos').innerText = siteData.photos.length;
    document.getElementById('statTotalCategories').innerText = siteData.categories.length;

    renderAdminCategories();
}

function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    
    document.querySelectorAll('.zenith-nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Upload Media (Supports Both File and URL)
function adminAddPhoto() {
    const fileInput = document.getElementById('upFile').files[0];
    const urlInput = document.getElementById('upUrl').value;
    const cat = document.getElementById('upCat').value;
    const desc = document.getElementById('upDesc').value;

    if (!desc) return alert('Please provide an image description.');

    if (fileInput) {
        // Read local file as Base64 Data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            savePhotoToDB(e.target.result, cat, desc);
        };
        reader.readAsDataURL(fileInput);
    } else if (urlInput) {
        // Use standard URL
        savePhotoToDB(urlInput, cat, desc);
    } else {
        alert('Please either select a file from your device OR paste an Image URL.');
    }
}

function savePhotoToDB(imgSrc, cat, desc) {
    siteData.photos.push({ id: Date.now().toString(), url: imgSrc, cat, desc });
    saveData();
    initAdminPanel(); 
    alert('Media successfully uploaded and published!');
    
    // Clear fields
    document.getElementById('upFile').value = '';
    document.getElementById('upUrl').value = '';
    document.getElementById('upDesc').value = '';
}

// Category Management
function addNewCategory() {
    const name = document.getElementById('newCatName').value;
    const img = document.getElementById('newCatImg').value;
    if(name && img) {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        siteData.categories.push({ id, name, img });
        saveData(); renderHomePage(); initAdminPanel(); updateGalleryFilters();
        document.getElementById('newCatName').value = ''; document.getElementById('newCatImg').value = '';
        alert("New Category Added Successfully!");
    } else { alert('Please provide Category Name and Cover Image URL.'); }
}

function deleteCategory(id) {
    if(confirm("Are you sure you want to delete this category? (Its photos won't be deleted)")) {
        siteData.categories = siteData.categories.filter(c => c.id !== id);
        saveData(); renderHomePage(); initAdminPanel(); updateGalleryFilters();
    }
}

function renderAdminCategories() {
    const list = document.getElementById('categoryList');
    list.innerHTML = siteData.categories.map(cat => `
        <div class="category-item-admin">
            <strong>${cat.name}</strong> 
            <button class="del-btn" onclick="deleteCategory('${cat.id}')"><i class="fas fa-trash"></i> Delete</button>
        </div>
    `).join('');
}

// Settings Update
function saveAdminSettings() {
    const newName = document.getElementById('editAdminName').value;
    const newEmail = document.getElementById('editAdminEmail').value;
    const newPass = document.getElementById('editAdminPass').value;
    const newSiteTitle = document.getElementById('editSiteTitle').value;
    
    if(newName) siteData.admin.name = newName;
    if(newEmail) siteData.admin.email = newEmail;
    if(newPass) siteData.admin.pass = newPass;
    if(newSiteTitle) {
        siteData.admin.siteName = newSiteTitle;
        document.getElementById('siteMainLogo').innerText = newSiteTitle;
        document.getElementById('mainDocTitle').innerText = newSiteTitle + " Photography";
    }

    saveData();
    initAdminPanel();
    alert("Website & Profile Settings Updated Successfully!");
}

function saveData() { localStorage.setItem('photonMasterData', JSON.stringify(siteData)); }

function renderHomePage() {
    const container = document.getElementById('categoryContainer');
    container.innerHTML = siteData.categories.map(cat => `
        <section class="card" style="background-image: url('${cat.img}?auto=format&fit=crop&w=800&q=80')">
            <div class="overlay">
                <h2>${cat.name}</h2>
                <button onclick="checkAccess('${cat.id}')" class="btn">MORE PHOTOS</button>
            </div>
        </section>
    `).join('');
}

// 6. MODALS & DROPDOWNS
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function toggleDropdown() { document.getElementById('profileDropdown').classList.toggle('show'); }
function toggleDotMenu() { document.getElementById('dotMenu').classList.toggle('show'); }

window.onclick = function(event) {
    if (!event.target.closest('.user-profile')) {
        const pd = document.getElementById('profileDropdown');
        if(pd) pd.classList.remove('show');
    }
    if (!event.target.closest('.menu-3dots')) {
        const dm = document.getElementById('dotMenu');
        if(dm) dm.classList.remove('show');
    }
}

// 7. USER AUTH LOGIC
function handleAuth(type) {
    if (type === 'signup') {
        const user = document.getElementById('regUser').value;
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPass').value;

        if(!user || !email || !pass) return alert("Please fill all details.");
        
        const userExists = siteData.users.find(u => u.username === user || u.email === email);
        if(userExists) return alert("Username or Email already registered! Please Login.");

        siteData.users.push({ username: user, email: email, password: pass });
        saveData();
        
        localStorage.setItem('photonUser', user);
        currentUser = user;
        updateUI();
        closeModal('signupModal');
        
        // Welcome by Username
        document.getElementById('welcomeText').innerText = `Welcome, ${user}!`;
        openModal('welcomeModal');

    } else if (type === 'login') {
        const user = document.getElementById('loginUser').value;
        const pass = document.getElementById('loginPass').value;

        if(!user || !pass) return alert("Please enter Username and Password.");

        const validUser = siteData.users.find(u => u.username === user && u.password === pass);
        
        if(validUser) {
            localStorage.setItem('photonUser', user);
            currentUser = user;
            updateUI();
            closeModal('loginModal');
            document.getElementById('loginUser').value = '';
            document.getElementById('loginPass').value = '';
            
            // Login Welcome by Username
            document.getElementById('welcomeText').innerText = `Welcome back, ${validUser.username}!`;
            openModal('welcomeModal');
        } else {
            alert("Invalid Username or Password!");
        }
    }
}

// ==========================================
// FORGOT PASSWORD FLOW
// ==========================================
function startForgotPasswordFlow() { closeModal('loginModal'); openModal('forgotModalStep1'); }

function sendResetEmailMock() {
    const email = document.getElementById('forgotEmailInput').value;
    if(!email) return alert("Please enter your email.");
    const userObj = siteData.users.find(u => u.email === email);
    if(userObj) {
        closeModal('forgotModalStep1');
        document.getElementById('displayMockEmail').innerText = email;
        document.getElementById('resetTargetEmail').value = email; 
        openModal('mockEmailInboxModal');
    } else { alert("This email is not registered in our system."); }
}

function openNewPasswordTab() {
    closeModal('mockEmailInboxModal');
    openModal('newPasswordModal');
}

function finalizePasswordReset() {
    const email = document.getElementById('resetTargetEmail').value;
    const newPass = document.getElementById('newSecurePass').value;
    const confirmPass = document.getElementById('confirmSecurePass').value;

    if(!newPass || !confirmPass) return alert("Please fill in both password fields.");
    if(newPass !== confirmPass) return alert("Passwords do not match!");

    let userObj = siteData.users.find(u => u.email === email);
    if(userObj) {
        userObj.password = newPass;
        saveData();
        alert("Password updated successfully! You can now login.");
        closeModal('newPasswordModal');
        document.getElementById('forgotEmailInput').value = '';
        document.getElementById('newSecurePass').value = '';
        document.getElementById('confirmSecurePass').value = '';
        openModal('loginModal'); 
    }
}
// ==========================================

function logout() {
    localStorage.removeItem('photonUser');
    currentUser = null;
    updateUI();
    location.reload();
}

function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const userProfile = document.getElementById('userProfile');
    const profileName = document.getElementById('profileName');

    if(currentUser) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        userProfile.style.display = 'inline-block';
        profileName.innerText = currentUser;
    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        userProfile.style.display = 'none';
    }
}

// 8. GALLERY & FILTER LOGIC
function updateGalleryFilters() {
    const catFilter = document.getElementById('categoryFilter');
    catFilter.innerHTML = '<option value="all">All Categories</option>' + 
        siteData.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function checkAccess(cat) {
    if(currentUser) {
        currentViewingCat = cat;
        document.getElementById('categoryFilter').value = cat;
        document.getElementById('searchInput').value = ''; 
        renderGallery();
        openModal('galleryModal');
    } else { openModal('loginModal'); }
}

function renderGallery(customPhotos = null) {
    const grid = document.getElementById('photoGrid');
    const title = document.getElementById('galleryTitle');
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const catVal = document.getElementById('categoryFilter').value;
    
    grid.innerHTML = '';
    title.innerText = (customPhotos ? "YOUR COLLECTION" : (catVal === 'all' ? 'ALL PHOTOS' : catVal.toUpperCase() + " COLLECTION"));

    let photosToShow = customPhotos || siteData.photos;

    if(!customPhotos) {
        if(catVal !== 'all') { photosToShow = photosToShow.filter(p => p.cat === catVal); }
        if(searchVal) { photosToShow = photosToShow.filter(p => p.desc.toLowerCase().includes(searchVal)); }
    }

    if(photosToShow.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#999;">No images found.</p>';
        return;
    }

    photosToShow.forEach(photo => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        div.onclick = () => openLightbox(photo);
        div.innerHTML = `
            <img src="${photo.url}" alt="photo" style="object-fit: cover;">
            <div class="photo-desc">${photo.desc}</div>
        `;
        grid.appendChild(div);
    });
}

function openLightbox(photo) {
    currentImage = photo;
    document.getElementById('lightboxImg').src = photo.url;
    document.getElementById('lightboxDesc').innerText = photo.desc;
    document.getElementById('downloadLink').href = photo.url;
    openModal('lightboxModal');
}

function saveImage() {
    if(!currentImage) return;
    let saved = JSON.parse(localStorage.getItem(`photon_${currentUser}_saved`)) || [];
    if(!saved.find(p => p.id === currentImage.id)) {
        saved.push(currentImage);
        localStorage.setItem(`photon_${currentUser}_saved`, JSON.stringify(saved));
        alert('Image Saved to your Profile!');
    } else { alert('Already in Saved!'); }
    document.getElementById('dotMenu').classList.remove('show');
}

function favoriteImage() {
    if(!currentImage) return;
    let favs = JSON.parse(localStorage.getItem(`photon_${currentUser}_favs`)) || [];
    if(!favs.find(p => p.id === currentImage.id)) {
        favs.push(currentImage);
        localStorage.setItem(`photon_${currentUser}_favs`, JSON.stringify(favs));
        alert('Added to Favorites ❤️');
    } else { alert('Already in Favorites!'); }
    document.getElementById('dotMenu').classList.remove('show');
}

function showSavedFavorites(type) {
    const data = JSON.parse(localStorage.getItem(`photon_${currentUser}_${type === 'saved' ? 'saved' : 'favs'}`)) || [];
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    renderGallery(data);
    openModal('galleryModal');
}

window.onload = () => {
    updateUI();
    renderHomePage();
    updateGalleryFilters();
};