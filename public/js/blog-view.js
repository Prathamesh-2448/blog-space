let currentUser = null;
let currentBlog = null;
let isFavorited = false;

// Get blog ID from URL
const blogId = window.location.pathname.split('/').pop();

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.user;
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Load blog data
async function loadBlog() {
    try {
        const response = await fetch(`/api/blogs/${blogId}`);
        
        if (!response.ok) {
            throw new Error('Blog not found');
        }
        
        currentBlog = await response.json();
        displayBlog();
        
        // Check if favorited by current user
        if (currentUser && currentUser.userType === 'user') {
            await checkIfFavorited();
        }
        
    } catch (error) {
        console.error('Error loading blog:', error);
        document.getElementById('blogDetail').innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <h2>Blog not found</h2>
                <p>The blog you're looking for doesn't exist or has been removed.</p>
                <a href="/" class="btn btn-primary">Back to Home</a>
            </div>
        `;
    }
}

// Display blog content
function displayBlog() {
    const blogDetail = document.getElementById('blogDetail');
    const isAuthor = currentUser && currentUser.userId === currentBlog.author_id;
    const isReader = currentUser && currentUser.userType === 'user';
    
    const categoryClass = currentBlog.category.toLowerCase();
    
    let actionsHTML = '';
    
    if (isAuthor) {
        actionsHTML = `
            <div class="blog-actions">
                <button onclick="editBlog()" class="btn btn-primary">Edit</button>
                <button onclick="deleteBlog()" class="btn btn-danger">Delete</button>
            </div>
        `;
    } else if (isReader) {
        actionsHTML = `
            <div class="blog-actions">
                <button onclick="toggleFavorite()" class="btn btn-primary" id="favoriteBtn">
                    ${isFavorited ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                </button>
            </div>
        `;
    }
    
    let imagesHTML = '';
    if (currentBlog.images && currentBlog.images.length > 0) {
        imagesHTML = `
            <div class="blog-images">
                ${currentBlog.images.map((image, index) => `
                    <img src="${image}" alt="Blog image ${index + 1}" class="blog-image">
                `).join('')}
            </div>
        `;
    }
    
    blogDetail.innerHTML = `
        <div class="blog-header">
            <span class="blog-category ${categoryClass}">${currentBlog.category}</span>
            <h1>${escapeHtml(currentBlog.title)}</h1>
            <div class="blog-info">
                <div class="blog-author-info">
                    <span>By ${escapeHtml(currentBlog.first_name)} ${escapeHtml(currentBlog.last_name)}</span>
                    <span>•</span>
                    <span>${formatDate(currentBlog.created_at)}</span>
                    ${isAuthor ? `<span>•</span><span>❤️ ${currentBlog.favorite_count} favorites</span>` : ''}
                </div>
                ${actionsHTML}
            </div>
        </div>
        ${imagesHTML}
        <div class="blog-content">
            ${escapeHtml(currentBlog.content)}
        </div>
    `;
    
    // Update page title
    document.title = `${currentBlog.title} - Blog Space`;
}

// Check if blog is favorited
async function checkIfFavorited() {
    try {
        const response = await fetch(`/api/favorites/check/${blogId}`);
        const data = await response.json();
        isFavorited = data.isFavorited;
    } catch (error) {
        console.error('Error checking favorite status:', error);
    }
}

// Toggle favorite
window.toggleFavorite = async function() {
    if (!currentUser) {
        alert('Please login to add favorites');
        window.location.href = '/login';
        return;
    }
    
    try {
        if (isFavorited) {
            // Remove from favorites
            const response = await fetch(`/api/favorites/${blogId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                isFavorited = false;
                document.getElementById('favoriteBtn').innerHTML = '🤍 Add to Favorites';
                alert('Removed from favorites');
            }
        } else {
            // Add to favorites
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ blogId: parseInt(blogId) })
            });
            
            if (response.ok) {
                isFavorited = true;
                document.getElementById('favoriteBtn').innerHTML = '❤️ Remove from Favorites';
                alert('Added to favorites');
            }
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        alert('Error updating favorites');
    }
};

// Edit blog
window.editBlog = function() {
    window.location.href = `/create-blog?edit=${blogId}`;
};

// Delete blog
window.deleteBlog = async function() {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/blogs/${blogId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Blog deleted successfully');
            window.location.href = '/';
        } else {
            alert('Error deleting blog');
        }
    } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Error deleting blog');
    }
};

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Initialize
async function init() {
    await checkAuth();
    await loadBlog();
}

init();