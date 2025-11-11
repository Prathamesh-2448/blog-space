// Global state
let currentUser = null;
let currentCategory = null;
let allBlogs = [];

// Check authentication status on page load
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
            updateUIForAuthenticatedUser();
        } else {
            updateUIForGuest();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        updateUIForGuest();
    }
}

// Update UI for authenticated users
function updateUIForAuthenticatedUser() {
    document.getElementById('loginLink').style.display = 'none';
    document.getElementById('registerLink').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('userGreeting').style.display = 'inline-block';
    document.getElementById('userGreeting').textContent = `Hi, ${currentUser.firstName}!`;
    
    if (currentUser.userType === 'creator') {
        document.getElementById('createBlogLink').style.display = 'inline-block';
        document.getElementById('myBlogsLink').style.display = 'inline-block';
    }
    
    if (currentUser.userType === 'user') {
        document.getElementById('favoritesLink').style.display = 'inline-block';
    }
}

// Update UI for guest users
function updateUIForGuest() {
    document.getElementById('loginLink').style.display = 'inline-block';
    document.getElementById('registerLink').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('createBlogLink').style.display = 'none';
    document.getElementById('myBlogsLink').style.display = 'none';
    document.getElementById('favoritesLink').style.display = 'none';
    document.getElementById('userGreeting').style.display = 'none';
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        updateUIForGuest();
        loadBlogs();
        document.getElementById('logout-alert-bar').style.display = "block";
        // alert('Logged out successfully!');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out');
    }
});

// Load all blogs
async function loadBlogs(category = null, search = null, authorId = null) {
    const blogsGrid = document.getElementById('blogsGrid');
    const noBlogsMessage = document.getElementById('noBlogsMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    
    // Show loading
    loadingSpinner.style.display = 'block';
    blogsGrid.innerHTML = '';
    noBlogsMessage.style.display = 'none';
    
    // Build query string
    let queryParams = [];
    if (category) queryParams.push(`category=${category}`);
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (authorId) queryParams.push(`authorId=${authorId}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    
    try {
        const response = await fetch(`/api/blogs${queryString}`);
        allBlogs = await response.json();
        
        loadingSpinner.style.display = 'none';
        
        if (allBlogs.length === 0) {
            noBlogsMessage.style.display = 'block';
            return;
        }
        
        // Update hero section based on filter
        if (category) {
            heroTitle.textContent = `${category} Blogs`;
            heroSubtitle.textContent = `Explore the latest blogs about ${category}`;
        } else if (search) {
            heroTitle.textContent = 'Search Results';
            heroSubtitle.textContent = `Results for "${search}"`;
        } else if (authorId) {
            heroTitle.textContent = 'My Blogs';
            heroSubtitle.textContent = 'Manage your blog posts';
        } else {
            heroTitle.textContent = 'Welcome to Blog Space';
            heroSubtitle.textContent = 'Explore blogs about Technology, Travel, and Environment';
        }
        
        // Render blogs
        allBlogs.forEach(blog => {
            const blogCard = createBlogCard(blog);
            blogsGrid.appendChild(blogCard);
        });
        
    } catch (error) {
        console.error('Error loading blogs:', error);
        loadingSpinner.style.display = 'none';
        noBlogsMessage.style.display = 'block';
        noBlogsMessage.querySelector('p').textContent = 'Error loading blogs. Please try again.';
    }
}

// Create blog card element
function createBlogCard(blog) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.onclick = () => window.location.href = `/blog/${blog.blog_id}`;
    
    const excerpt = blog.content.substring(0, 150) + (blog.content.length > 150 ? '...' : '');
    const categoryClass = blog.category.toLowerCase();

    card.innerHTML = `
        ${blog.image_url ? `<img src="${blog.image_url}" alt="${blog.title}" class="blog-card-image">` : '<div class="blog-card-image"></div>'}
        <div class="blog-card-content">
            <span class="blog-category ${categoryClass}">${blog.category}</span>
            <h3>${escapeHtml(blog.title)}</h3>
            <p class="blog-excerpt">${escapeHtml(excerpt)}</p>
            <div class="blog-meta">
                <span class="blog-author">By ${escapeHtml(blog.first_name)} ${escapeHtml(blog.last_name)}</span>
                <div class="blog-stats">
                    <span>❤️ ${blog.favorite_count || 0}</span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Category filtering
document.querySelectorAll('.nav-link[data-category]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.getAttribute('data-category');
        currentCategory = category;
        
        // Update active state
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        
        loadBlogs(category);
    });
});

// Home link - show all blogs
document.querySelector('.nav-link[href="/"]').addEventListener('click', (e) => {
    e.preventDefault();
    currentCategory = null;
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    e.target.classList.add('active');
    
    loadBlogs();
});

// My Blogs link
document.getElementById('myBlogsLink').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        loadBlogs(null, null, currentUser.userId);
    }
});

// Favorites link
document.getElementById('favoritesLink').addEventListener('click', async (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    e.target.classList.add('active');
    
    const blogsGrid = document.getElementById('blogsGrid');
    const noBlogsMessage = document.getElementById('noBlogsMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const heroTitle = document.getElementById('heroTitle');
    const heroSubtitle = document.getElementById('heroSubtitle');
    
    loadingSpinner.style.display = 'block';
    blogsGrid.innerHTML = '';
    noBlogsMessage.style.display = 'none';
    
    try {
        const response = await fetch('/api/favorites');
        const favorites = await response.json();
        
        loadingSpinner.style.display = 'none';
        
        heroTitle.textContent = 'My Favorites';
        heroSubtitle.textContent = 'Your saved blog posts';
        
        if (favorites.length === 0) {
            noBlogsMessage.style.display = 'block';
            noBlogsMessage.querySelector('p').textContent = 'No favorites yet. Start adding blogs to your favorites!';
            return;
        }
        
        favorites.forEach(blog => {
            const blogCard = createBlogCard(blog);
            blogsGrid.appendChild(blogCard);
        });
        
    } catch (error) {
        console.error('Error loading favorites:', error);
        loadingSpinner.style.display = 'none';
        alert('Please login to view favorites');
    }
});

// Search functionality
document.getElementById('searchBtn').addEventListener('click', () => {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        loadBlogs(null, searchTerm);
    }
});

// Search on Enter key
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// Initialize page
checkAuth();
loadBlogs();