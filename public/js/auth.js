// Show/hide category field based on user type
const userTypeSelect = document.getElementById('userType');
if (userTypeSelect) {
    userTypeSelect.addEventListener('change', (e) => {
        const categoryGroup = document.getElementById('categoryGroup');
        const categorySelect = document.getElementById('category');
        
        if (e.target.value === 'creator') {
            categoryGroup.style.display = 'block';
            categorySelect.required = true;
        } else {
            categoryGroup.style.display = 'none';
            categorySelect.required = false;
            categorySelect.value = '';
        }
    });
}

// Handle registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
        
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            userType: document.getElementById('userType').value,
            category: document.getElementById('category').value || null
        };
        
        // Validate password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            errorMessage.textContent = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
            errorMessage.classList.add('show');
            return;
        }
        
        // Validate category for creators
        if (formData.userType === 'creator' && !formData.category) {
            errorMessage.textContent = 'Please select a blogging category';
            errorMessage.classList.add('show');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Registration successful! Please login.');
                window.location.href = '/login';
            } else {
                errorMessage.textContent = data.message || 'Registration failed';
                errorMessage.classList.add('show');
            }
        } catch (error) {
            console.error('Registration error:', error);
            errorMessage.textContent = 'Server error. Please try again.';
            errorMessage.classList.add('show');
        }
    });
}

// Handle login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');
        
        const formData = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        };
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Login successful!');
                window.location.href = '/';
            } else {
                errorMessage.textContent = data.message || 'Login failed';
                errorMessage.classList.add('show');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'Server error. Please try again.';
            errorMessage.classList.add('show');
        }
    });
}