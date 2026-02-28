// Authentication helpers - now using backend sessions
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
    
    // Call logout endpoint to destroy session on backend
    if (token) {
        fetch('http://localhost:5000/api/logout', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }).catch(err => console.error('Error logging out from server:', err));
    }
    
    // Clear local storage
    localStorage.removeItem('rentmatch_user');
    localStorage.removeItem('session_token');
    window.location.href = 'index.html';
}

// Check if user has submitted an application
function hasSubmittedApplication() {
    const user = getCurrentUser();
    if (!user) return false;
    
    const applicationKey = `application_${user.id || user.email}`;
    return localStorage.getItem(applicationKey) !== null;
}

function getSettingsStorageKey() {
    const user = getCurrentUser();
    if (!user) return null;
    return `settings_${user.id || user.email}`;
}

function getUserSettings() {
    const key = getSettingsStorageKey();
    if (!key) return null;

    const raw = localStorage.getItem(key);
    if (!raw) {
        return {
            emailUpdates: true,
            applicationReminders: true
        };
    }

    try {
        return JSON.parse(raw);
    } catch {
        return {
            emailUpdates: true,
            applicationReminders: true
        };
    }
}

function saveUserSettings(settings) {
    const key = getSettingsStorageKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(settings));
}

function setPostLoginRedirect(path) {
    localStorage.setItem('post_login_redirect', path);
}

function consumePostLoginRedirect() {
    const path = localStorage.getItem('post_login_redirect');
    localStorage.removeItem('post_login_redirect');
    return path || 'index.html';
}

// Check application status and redirect
function checkApplicationStatus() {
    if (hasSubmittedApplication()) {
        // User has submitted an application, show results page
        window.location.href = 'results.html';
    } else {
        // No application submitted, redirect to application page with message flag
        localStorage.setItem('show_no_application_message', 'true');
        window.location.href = 'application.html';
    }
}

// Update user profile display on page load
function updateUserDisplay() {
    const userProfile = document.querySelector('.user-profile');
    if (!userProfile) return;
    
    const user = getCurrentUser();
    if (user) {
        userProfile.innerHTML = `
            <div class="user-profile-trigger">
                <span class="user-icon">👤</span>
                <span class="user-display">${user.username}</span>
                <span class="dropdown-arrow">▼</span>
            </div>
            <div class="user-dropdown">
                <a href="#" class="dropdown-item" id="applicationStatusBtn">Application Status</a>
                <a href="#" class="dropdown-item" id="settingsBtn">Settings</a>
                <hr class="dropdown-divider">
                <a href="#" class="dropdown-item logout-item" id="logoutDropdown">Logout</a>
            </div>
        `;
        
        // Add application status handler
        const applicationStatusBtn = document.getElementById('applicationStatusBtn');
        if (applicationStatusBtn) {
            applicationStatusBtn.addEventListener('click', function(e) {
                e.preventDefault();
                checkApplicationStatus();
            });
        }

        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'settings.html';
            });
        }
        
        // Add dropdown logout handler
        const logoutDropdown = document.getElementById('logoutDropdown');
        if (logoutDropdown) {
            logoutDropdown.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    } else {
        userProfile.innerHTML = '<a href="login.html" class="login-btn">Login</a>';
    }
}

// Update user display on page load
document.addEventListener('DOMContentLoaded', updateUserDisplay);

// Check authentication for application page
if (window.location.pathname.endsWith('application.html')) {
    if (!isLoggedIn()) {
        setPostLoginRedirect('application.html');
        window.location.href = 'login.html';
    }
    
    // Check if we should show "no application" message
    if (localStorage.getItem('show_no_application_message') === 'true') {
        localStorage.removeItem('show_no_application_message');
        
        // Wait for DOM to load, then show message
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('applicationForm');
            if (form) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'info-message';
                messageDiv.innerHTML = '<strong>No Application Found</strong><br>You haven\'t submitted an application yet. Fill out the form below to get started!';
                form.parentElement.insertBefore(messageDiv, form);
                
                // Scroll to message
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

if (window.location.pathname.endsWith('settings.html')) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }

    document.addEventListener('DOMContentLoaded', function() {
        const user = getCurrentUser();
        if (!user) return;

        const usernameEl = document.getElementById('settingsUsername');
        const emailEl = document.getElementById('settingsEmail');
        if (usernameEl) usernameEl.textContent = user.username || '-';
        if (emailEl) emailEl.textContent = user.email || '-';

        const settings = getUserSettings();
        const emailUpdates = document.getElementById('emailUpdates');
        const applicationReminders = document.getElementById('applicationReminders');

        if (emailUpdates) emailUpdates.checked = !!settings.emailUpdates;
        if (applicationReminders) applicationReminders.checked = !!settings.applicationReminders;

        const settingsForm = document.getElementById('settingsForm');
        const settingsMessage = document.getElementById('settingsMessage');

        if (settingsForm) {
            settingsForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const updatedSettings = {
                    emailUpdates: !!(emailUpdates && emailUpdates.checked),
                    applicationReminders: !!(applicationReminders && applicationReminders.checked)
                };

                saveUserSettings(updatedSettings);

                if (settingsMessage) {
                    settingsMessage.style.display = 'block';
                    settingsMessage.innerHTML = '<strong>Saved</strong>Your settings were updated successfully.';
                }
            });
        }

        const logoutFromSettings = document.getElementById('logoutFromSettings');
        if (logoutFromSettings) {
            logoutFromSettings.addEventListener('click', function() {
                logout();
            });
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Protect links that go to application page
document.querySelectorAll('a[href="application.html"]').forEach(link => {
    link.addEventListener('click', function(e) {
        if (!isLoggedIn()) {
            e.preventDefault();
            setPostLoginRedirect('application.html');
            window.location.href = 'login.html';
        }
    });
});

// Silhouette click handler - navigate to login/application page
const silhouette = document.querySelector('.person-silhouette');
if (silhouette) {
    silhouette.addEventListener('click', function() {
        if (isLoggedIn()) {
            window.location.href = 'application.html';
        } else {
            setPostLoginRedirect('application.html');
            window.location.href = 'login.html';
        }
    });
}

// Update SVG line endpoints to follow apartment node centers
function updateBranchLines() {
    const svg = document.querySelector('.branch-lines');
    const container = document.querySelector('.branch-visualization');
    
    if (!svg || !container) return;
    
    const svgRect = svg.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const viewBox = svg.getAttribute('viewBox').split(' ');
    const viewBoxWidth = parseFloat(viewBox[2]);
    const viewBoxHeight = parseFloat(viewBox[3]);
    
    // Get silhouette center for line start point
    const silhouette = document.querySelector('.person-silhouette');
    const silhouetteRect = silhouette.getBoundingClientRect();
    const silhouetteX = (silhouetteRect.left - containerRect.left + silhouetteRect.width / 2) / containerRect.width * viewBoxWidth;
    const silhouetteY = (silhouetteRect.top - containerRect.top + silhouetteRect.height / 2) / containerRect.height * viewBoxHeight;
    
    // Update each line to point to the center of its corresponding apartment node image
    const lines = document.querySelectorAll('.branch-line');
    
    lines.forEach((line) => {
        const nodeIndex = line.getAttribute('data-node');
        const nodes = document.querySelectorAll('.apartment-node');
        
        if (nodeIndex !== null && nodeIndex < nodes.length) {
            const node = nodes[nodeIndex];
            const nodeImage = node.querySelector('.node-image');
            const imageRect = nodeImage.getBoundingClientRect();
            
            // Calculate center of the image in SVG coordinates
            const imageCenterX = (imageRect.left - containerRect.left + imageRect.width / 2) / containerRect.width * viewBoxWidth;
            const imageCenterY = (imageRect.top - containerRect.top + imageRect.height / 2) / containerRect.height * viewBoxHeight;
            
            // Update line start and endpoint
            line.setAttribute('x1', silhouetteX);
            line.setAttribute('y1', silhouetteY);
            line.setAttribute('x2', imageCenterX);
            line.setAttribute('y2', imageCenterY);
        }
    });
}

// Call on page load and on resize
window.addEventListener('load', () => {
    updateUserDisplay();
    setTimeout(updateBranchLines, 100);
});

window.addEventListener('resize', updateBranchLines);

// Also update when animations complete
setTimeout(updateBranchLines, 2500);

// Form submission handler
const applicationForm = document.getElementById('applicationForm');
if (applicationForm) {
    applicationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // Show loading state
        const submitButton = this.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Finding Matches...';
        submitButton.disabled = true;
        
        try {
            // Submit to backend
            const sessionToken = localStorage.getItem('session_token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (sessionToken) {
                headers.Authorization = 'Bearer ' + sessionToken;
            }

            const response = await fetch('http://localhost:5000/api/submit-application', {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Mark that user has submitted an application
                const user = getCurrentUser();
                if (user) {
                    const applicationKey = `application_${user.id || user.email}`;
                    localStorage.setItem(applicationKey, JSON.stringify({
                        submittedAt: new Date().toISOString(),
                        data: data
                    }));
                }
                
                // Store results in sessionStorage
                sessionStorage.setItem('matchResults', JSON.stringify(result));
                
                // Redirect to results page
                window.location.href = 'results.html';
            } else {
                alert('Error: ' + (result.error || 'Failed to process application'));
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting application. Make sure the backend server is running (python app.py)');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Phone number formatting
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
        } else if (value.length >= 3) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        }
        e.target.value = value;
    });
});

// Get saved application data from localStorage
function getSavedApplication() {
    const user = getCurrentUser();
    if (!user) return null;
    
    const applicationKey = `application_${user.id || user.email}`;
    const saved = localStorage.getItem(applicationKey);
    return saved ? JSON.parse(saved) : null;
}

// Populate form with saved application data
function populateFormFromSavedApplication() {
    const saved = getSavedApplication();
    if (!saved || !saved.data) return false;
    
    const data = saved.data;
    
    // Populate all form fields with data from saved application
    Object.keys(data).forEach(key => {
        const field = document.getElementById(key);
        if (field) {
            field.value = data[key];
        }
    });
    
    return true;
}

// Handle editing an application
if (window.location.pathname.endsWith('application.html') && sessionStorage.getItem('editingApplication') === 'true') {
    sessionStorage.removeItem('editingApplication');
    
    document.addEventListener('DOMContentLoaded', function() {
        // Update button text to reflect editing
        const form = document.getElementById('applicationForm');
        if (form) {
            const submitButton = form.querySelector('.submit-button');
            if (submitButton) {
                submitButton.textContent = 'Update and Find Matches';
            }
            
            // Populate form with saved application data
            setTimeout(() => {
                if (populateFormFromSavedApplication()) {
                    // Show edit notice
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'info-message';
                    messageDiv.style.backgroundColor = '#e3f2fd';
                    messageDiv.style.borderColor = '#1976d2';
                    messageDiv.innerHTML = '<strong>📝 Editing Application</strong><br>Update your information below and submit to find new matches based on your updated criteria.';
                    form.parentElement.insertBefore(messageDiv, form);
                    
                    // Scroll to notice
                    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    });
}

// Show/hide pet number field based on pets selection
const petsField = document.getElementById('pets');
if (petsField) {
    petsField.addEventListener('change', function(e) {
        const numberOfPetsField = document.getElementById('numberOfPets');
        if (!numberOfPetsField) {
            return;
        }

        if (e.target.value === 'no') {
            numberOfPetsField.value = 0;
            numberOfPetsField.parentElement.style.opacity = '0.5';
        } else {
            numberOfPetsField.parentElement.style.opacity = '1';
            if (numberOfPetsField.value === '0') {
                numberOfPetsField.value = 1;
            }
        }
    });
}

// Form validation feedback
document.querySelectorAll('input[required], select[required]').forEach(field => {
    field.addEventListener('blur', function() {
        if (!this.validity.valid) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '#e5e7eb';
        }
    });
    
    field.addEventListener('input', function() {
        if (this.validity.valid) {
            this.style.borderColor = '#10b981';
        }
    });
});

// Login/Signup page functionality
const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Toggle between login and signup
if (showSignupLink) {
    showSignupLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginCard.classList.add('hidden');
        signupCard.classList.remove('hidden');
        // Clear error messages
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.textContent = '';
            loginError.style.display = 'none';
        }
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
        // Clear error messages
        const signupError = document.getElementById('signupError');
        if (signupError) {
            signupError.textContent = '';
            signupError.style.display = 'none';
        }
    });
}

// Signup form password validation
const signupPassword = document.getElementById('signupPassword');
const signupConfirmPassword = document.getElementById('signupConfirmPassword');

if (signupPassword && signupConfirmPassword) {
    const validateSignupPasswords = () => {
        if (signupConfirmPassword.value === '') {
            signupConfirmPassword.setCustomValidity('');
            return;
        }
        
        if (signupPassword.value !== signupConfirmPassword.value) {
            signupConfirmPassword.setCustomValidity('Passwords do not match');
            signupConfirmPassword.style.borderColor = '#ef4444';
        } else {
            signupConfirmPassword.setCustomValidity('');
            signupConfirmPassword.style.borderColor = '#10b981';
        }
    };

    signupPassword.addEventListener('input', validateSignupPasswords);
    signupConfirmPassword.addEventListener('input', validateSignupPasswords);
}

// Handle signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const errorDiv = document.getElementById('signupError');
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        
        const email = document.getElementById('signupEmail').value;
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
            return;
        }
        
        try {
            // Send signup request to backend
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    username: username,
                    password: password,
                    confirmPassword: confirmPassword
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store user and session token
                setCurrentUser(result.user, result.token);
                
                // Redirect to intended page or default home
                window.location.href = consumePostLoginRedirect();
            } else {
                errorDiv.textContent = result.error;
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Signup error:', error);
            errorDiv.textContent = 'Error signing up. Make sure the backend server is running.';
            errorDiv.style.display = 'block';
        }
    });
}

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
        
        const emailOrUsername = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            // Send login request to backend
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    emailOrUsername: emailOrUsername,
                    password: password
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store user and session token
                setCurrentUser(result.user, result.token);
                
                // Redirect to intended page or default home
                window.location.href = consumePostLoginRedirect();
            } else {
                errorDiv.textContent = result.error;
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Error logging in. Make sure the backend server is running.';
            errorDiv.style.display = 'block';
        }
    });
}
