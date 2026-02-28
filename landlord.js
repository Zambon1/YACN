// Landlord-specific JavaScript for signup and dashboard

// ============ Authentication Helpers ============
function isLoggedIn() {
    return localStorage.getItem('session_token') !== null;
}

function getCurrentUser() {
    const userJson = localStorage.getItem('rentmatch_user');
    return userJson ? JSON.parse(userJson) : null;
}

function setCurrentUser(user, token) {
    localStorage.setItem('rentmatch_user', JSON.stringify(user));
    localStorage.setItem('session_token', token);
}

function logout() {
    const token = localStorage.getItem('session_token');
    
    if (token) {
        fetch('http://localhost:5000/api/logout', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }).catch(err => console.error('Error logging out:', err));
    }
    
    localStorage.removeItem('rentmatch_user');
    localStorage.removeItem('session_token');
    window.location.href = 'landlord-signup.html';
}

// ============ Format Phone Number ============
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    if (value.length > 6) {
        value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
    } else if (value.length > 3) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    }
    
    input.value = value;
}

// ============ Dashboard Functions ============
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked menu item
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
    
    // Load section-specific data
    if (sectionId === 'complexes') {
        loadComplexes();
    } else if (sectionId === 'requirements') {
        loadRequirements();
    }
}

async function loadProfile() {
    try {
        const token = localStorage.getItem('session_token');
        if (!token) {
            window.location.href = 'landlord-signup.html';
            return;
        }
        
        const response = await fetch('http://localhost:5000/api/landlord/profile', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        if (!response.ok) {
            console.error('Failed to load profile');
            return;
        }
        
        const result = await response.json();
        const user = result.user;
        const leaser = result.leaser;
        
        // Populate profile fields
        document.getElementById('profileUsername').textContent = `@${user.username}`;
        document.getElementById('profileFirstName').textContent = user.first_name;
        document.getElementById('profileLastName').textContent = user.last_name;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profilePhone').textContent = user.phone;
        document.getElementById('profileUsername2').textContent = user.username;
        document.getElementById('profileCompany').textContent = leaser.company;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadComplexes() {
    try {
        const token = localStorage.getItem('session_token');
        const response = await fetch('http://localhost:5000/api/landlord/profile', {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        if (!response.ok) return;
        
        const result = await response.json();
        const complexes = result.complexes || [];
        
        const container = document.getElementById('complexesList');
        
        if (complexes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏢</div>
                    <h3>No Properties Yet</h3>
                    <p>Add your first property to get started</p>
                    <button class="btn-primary" onclick="showSection('add-complex')">Add Property</button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="complexes-grid">
                ${complexes.map(complex => `
                    <div class="complex-card">
                        <h3>${complex.property_name || 'Untitled Property'}</h3>
                        <div class="complex-address">
                            <span>📍</span>
                            <div>
                                <div>${complex.street}</div>
                                <div>${complex.city}, ${complex.us_state}</div>
                            </div>
                        </div>
                        <div class="complex-info">
                            ${complex.area_code ? `<div>Area Code: ${complex.area_code}</div>` : ''}
                        </div>
                        <div class="complex-actions">
                            <button class="btn-sm" onclick="editComplex('${complex.id}')">📝 Edit</button>
                            <button class="btn-sm btn-danger" onclick="deleteComplex('${complex.id}')">🗑️ Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading complexes:', error);
    }
}

async function loadRequirements() {
    const container = document.getElementById('requirementsList');
    container.innerHTML = '<p>Requirements management coming soon...</p>';
}

async function createComplex(formData) {
    try {
        const token = localStorage.getItem('session_token');
        const errorDiv = document.getElementById('complexError');
        
        const response = await fetch('http://localhost:5000/api/landlord/complex', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                propertyName: formData.get('propertyName'),
                street: formData.get('propertyStreet'),
                city: formData.get('propertyCity'),
                state: formData.get('propertyState'),
                areaCode: formData.get('propertyAreaCode')
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            alert('Property created successfully!');
            document.getElementById('addComplexForm').reset();
            loadComplexes();
            showSection('complexes');
        } else {
            errorDiv.textContent = result.error || 'Failed to create property';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error creating complex:', error);
        document.getElementById('complexError').textContent = 'Error creating property: ' + error.message;
        document.getElementById('complexError').style.display = 'block';
    }
}

async function deleteComplex(complexId) {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
        const token = localStorage.getItem('session_token');
        const response = await fetch(`http://localhost:5000/api/landlord/complex/${complexId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            alert('Property deleted successfully');
            loadComplexes();
        } else {
            alert('Failed to delete property: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting complex:', error);
        alert('Error deleting property');
    }
}

function editComplex(complexId) {
    alert('Edit functionality coming soon...');
}

// ============ Landlord Signup Page ============
document.addEventListener('DOMContentLoaded', function() {
    // If on signup page
    const landlordSignupForm = document.getElementById('landlordSignupForm');
    if (landlordSignupForm) {
        // Phone number formatting
        const phoneInput = document.getElementById('landlordPhone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                formatPhoneNumber(this);
            });
        }
        
        // Real-time email availability check
        const emailInput = document.getElementById('landlordEmail');
        const emailStatusDiv = document.getElementById('emailStatus');
        let emailCheckTimeout;
        
        if (emailInput && emailStatusDiv) {
            emailInput.addEventListener('input', async function() {
                clearTimeout(emailCheckTimeout);
                const email = this.value.trim();
                
                if (!email || !email.includes('@')) {
                    emailStatusDiv.textContent = '';
                    emailStatusDiv.style.display = 'none';
                    this.style.borderColor = '';
                    return;
                }
                
                emailCheckTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch(`http://localhost:5000/api/check-email?email=${encodeURIComponent(email)}`);
                        const result = await response.json();
                        
                        if (!result.available) {
                            emailStatusDiv.textContent = '✗ Email already in use';
                            emailStatusDiv.style.color = '#ef4444';
                            emailStatusDiv.style.display = 'block';
                            emailInput.style.borderColor = '#ef4444';
                        } else {
                            emailStatusDiv.textContent = '✓ Email available';
                            emailStatusDiv.style.color = '#10b981';
                            emailStatusDiv.style.display = 'block';
                            emailInput.style.borderColor = '#10b981';
                        }
                    } catch (error) {
                        emailStatusDiv.textContent = '';
                        emailStatusDiv.style.display = 'none';
                    }
                }, 500);
            });
        }
        
        // Real-time username availability check
        const usernameInput = document.getElementById('landlordUsername');
        const usernameStatusDiv = document.getElementById('usernameStatus');
        let usernameCheckTimeout;
        
        if (usernameInput && usernameStatusDiv) {
            usernameInput.addEventListener('input', async function() {
                clearTimeout(usernameCheckTimeout);
                const username = this.value.trim();
                
                if (!username || username.length < 3) {
                    usernameStatusDiv.textContent = '';
                    usernameStatusDiv.style.display = 'none';
                    this.style.borderColor = '';
                    return;
                }
                
                usernameCheckTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch(`http://localhost:5000/api/check-username?username=${encodeURIComponent(username)}`);
                        const result = await response.json();
                        
                        if (!result.available) {
                            usernameStatusDiv.textContent = '✗ Username already taken';
                            usernameStatusDiv.style.color = '#ef4444';
                            usernameStatusDiv.style.display = 'block';
                            usernameInput.style.borderColor = '#ef4444';
                        } else {
                            usernameStatusDiv.textContent = '✓ Username available';
                            usernameStatusDiv.style.color = '#10b981';
                            usernameStatusDiv.style.display = 'block';
                            usernameInput.style.borderColor = '#10b981';
                        }
                    } catch (error) {
                        usernameStatusDiv.textContent = '';
                        usernameStatusDiv.style.display = 'none';
                    }
                }, 500);
            });
        }
        
        // Password validation
        const passwordInput = document.getElementById('landlordPassword');
        const confirmPasswordInput = document.getElementById('landlordConfirmPassword');
        
        if (passwordInput && confirmPasswordInput) {
            const validatePasswords = () => {
                if (confirmPasswordInput.value === '') {
                    confirmPasswordInput.setCustomValidity('');
                    return;
                }
                
                if (passwordInput.value !== confirmPasswordInput.value) {
                    confirmPasswordInput.setCustomValidity('Passwords do not match');
                    confirmPasswordInput.style.borderColor = '#ef4444';
                } else {
                    confirmPasswordInput.setCustomValidity('');
                    confirmPasswordInput.style.borderColor = '#10b981';
                }
            };
            
            passwordInput.addEventListener('input', validatePasswords);
            confirmPasswordInput.addEventListener('input', validatePasswords);
        }
        
        // Handle signup form submission
        landlordSignupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const errorDiv = document.getElementById('signupError');
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            
            try {
                const formData = new FormData(this);
                const response = await fetch('http://localhost:5000/api/landlord/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        firstName: formData.get('firstName'),
                        lastName: formData.get('lastName'),
                        username: formData.get('landlordUsername'),
                        email: formData.get('landlordEmail'),
                        phone: formData.get('landlordPhone').replace(/\D/g, ''),
                        password: formData.get('landlordPassword'),
                        confirmPassword: formData.get('landlordConfirmPassword'),
                        companyName: formData.get('companyName'),
                        licenseNumber: formData.get('licenseNumber')
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    setCurrentUser(result.user, result.token);
                    window.location.href = 'landlord-dashboard.html';
                } else {
                    let errorMessage = result.error || 'Signup failed';
                    
                    if (result.errorType === 'EMAIL_EXISTS') {
                        document.getElementById('landlordEmail').style.borderColor = '#ef4444';
                    } else if (result.errorType === 'USERNAME_EXISTS') {
                        document.getElementById('landlordUsername').style.borderColor = '#ef4444';
                    }
                    
                    errorDiv.textContent = errorMessage;
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Signup error:', error);
                errorDiv.textContent = 'Unable to create account. Please try again.';
                errorDiv.style.display = 'block';
            }
        });
    }
    
    // If on dashboard page
    const dashboardContent = document.querySelector('.dashboard-container');
    if (dashboardContent) {
        // Check if logged in
        if (!isLoggedIn()) {
            window.location.href = 'landlord-signup.html';
            return;
        }
        
        // Load profile data
        loadProfile();
        
        // Handle add complex form
        const addComplexForm = document.getElementById('addComplexForm');
        if (addComplexForm) {
            addComplexForm.addEventListener('submit', function(e) {
                e.preventDefault();
                createComplex(new FormData(this));
            });
        }
    }
});
