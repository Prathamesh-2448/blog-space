let selectedImages = [];
let isEditMode = false;
let currentBlogId = null;
let hasUnsavedChanges = false;

// Check if user is authenticated and is a creator
async function checkAuthAndPermission() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.authenticated) {
            alert('Please login to create a blog');
            window.location.href = '/login';
            return;
        }
        
        if (data.user.userType !== 'creator') {
            alert('Only creators can write blogs');
            window.location.href = '/';
            return;
        }
        
        // Check if editing mode
        const urlParams = new URLSearchParams(window.location.search);
        const blogId = urlParams.get('edit');
        
        if (blogId) {
            isEditMode = true;
            currentBlogId = blogId;
            await loadBlogForEditing(blogId);
        }
        
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login';
    }
}

// Load blog data for editing
async function loadBlogForEditing(blogId) {
    try {
        const response = await fetch(`/api/blogs/${blogId}`);
        const blog = await response.json();
        
        document.getElementById('editorTitle').textContent = 'Edit Blog';
        document.getElementById('title').value = blog.title;
        document.getElementById('category').value = blog.category;
        document.getElementById('content').value = blog.content;
        
        // Load existing images
        if (blog.images && blog.images.length > 0) {
            selectedImages = blog.images;
            displayImagePreviews();
        }
        
    } catch (error) {
        console.error('Error loading blog:', error);
        alert('Error loading blog for editing');
        window.location.href = '/';
    }
}

// Handle image selection
document.getElementById('images').addEventListener('change', async (e) => {
    const files = e.target.files;
    
    for (let file of files) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert(`Image ${file.name} is too large. Maximum size is 5MB.`);
            continue;
        }
        
        const base64 = await convertToBase64(file);
        selectedImages.push(base64);
    }
    
    displayImagePreviews();
    hasUnsavedChanges = true;
});

// Convert image to base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Display image previews
function displayImagePreviews() {
    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = '';
    
    selectedImages.forEach((image, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item';
        previewItem.innerHTML = `
            <img src="${image}" alt="Preview ${index + 1}">
            <button type="button" class="btn btn-danger btn-sm" onclick="removeImage(${index})" style="position: absolute; top: 5px; right: 5px; padding: 0.3rem 0.5rem;">✕</button>
        `;
        previewContainer.appendChild(previewItem);
    });
}

// Remove image from preview
window.removeImage = function(index) {
    selectedImages.splice(index, 1);
    displayImagePreviews();
    hasUnsavedChanges = true;
};

// Handle form submission
document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    
    const formData = {
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value,
        content: document.getElementById('content').value.trim(),
        images: selectedImages
    };
    
    if (!formData.title || !formData.category || !formData.content) {
        errorMessage.textContent = 'Please fill in all required fields';
        errorMessage.classList.add('show');
        return;
    }
    
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
        const url = isEditMode ? `/api/blogs/${currentBlogId}` : '/api/blogs';
        const method = isEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            hasUnsavedChanges = false;
            alert(isEditMode ? 'Blog updated successfully!' : 'Blog created successfully!');
            window.location.href = '/';
        } else {
            errorMessage.textContent = data.message || 'Failed to save blog';
            errorMessage.classList.add('show');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Blog';
        }
    } catch (error) {
        console.error('Error saving blog:', error);
        errorMessage.textContent = 'Server error. Please try again.';
        errorMessage.classList.add('show');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Blog';
    }
});

// Track changes in form
document.getElementById('blogForm').addEventListener('input', () => {
    hasUnsavedChanges = true;
});

// Cancel button
document.getElementById('cancelBtn').addEventListener('click', () => {
    if (hasUnsavedChanges) {
        if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
            window.location.href = '/';
        }
    } else {
        window.location.href = '/';
    }
});

// Warn before leaving page with unsaved changes
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Initialize
checkAuthAndPermission();