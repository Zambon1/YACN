// Authentication helpers - now using backend sessions
function isLoggedIn() {
    const hasToken = localStorage.getItem('session_token') !== null;
    console.log('isLoggedIn check:', hasToken);
    return hasToken;
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
async function hasSubmittedApplication() {
    const user = getCurrentUser();
    
    // Always check localStorage first - this is the source of truth for unlogged-in users
    if (user) {
        const submittedKey = `application_submitted_${user.id || user.email}`;
        const submitted = localStorage.getItem(submittedKey);
        if (submitted) {
            try {
                const app = JSON.parse(submitted);
                if (app.submitted === true) {
                    return true;
                }
            } catch (e) {
                console.error('Error parsing submitted application:', e);
            }
        }
    }
    
    // If no localStorage record, check backend
    try {
        const sessionToken = localStorage.getItem('session_token');
        const userEmail = user?.email ? `&email=${encodeURIComponent(user.email)}` : '';
        const url = `http://localhost:5000/api/user-application?${userEmail}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + sessionToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.hasApplication === true && user) {
                // Cache this in localStorage for offline access
                const submittedKey = `application_submitted_${user.id || user.email}`;
                localStorage.setItem(submittedKey, JSON.stringify({
                    submitted: true,
                    submittedAt: new Date().toISOString(),
                    data: data.application
                }));
                return true;
            }
            return data.hasApplication === true;
        }
    } catch (err) {
        console.error('Error checking application status:', err);
    }
    
    return false;
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

async function routeToApplicationOrStatus() {
    if (!isLoggedIn()) {
        setPostLoginRedirect('application.html');
        window.location.href = 'login.html';
        return;
    }

    if (await hasSubmittedApplication()) {
        window.location.href = 'results.html';
        return;
    }

    window.location.href = 'application.html';
}

// Check application status and redirect
async function checkApplicationStatus() {
    if (await hasSubmittedApplication()) {
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
    if (!userProfile) {
        console.warn('User profile element not found');
        return;
    }
    
    const user = getCurrentUser();
    console.log('Updating user display, logged in:', !!user);
    
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
        console.log('No user found, showing login button');
        userProfile.innerHTML = '<a href="login.html" class="login-btn">Login</a>';
    }
}

// Update user display on page load
document.addEventListener('DOMContentLoaded', updateUserDisplay);

// Check authentication for application page
function checkApplicationPageAuth() {
    const pathname = window.location.pathname;
    console.log('Checking auth for pathname:', pathname);
    
    if (pathname.endsWith('application.html') || pathname.endsWith('/application')) {
        console.log('On application page, checking login status...');
        if (!isLoggedIn()) {
            console.log('Not logged in, redirecting to login page');
            setPostLoginRedirect('application.html');
            window.location.href = 'login.html';
            return;
        }

        console.log('User is logged in, checking for existing application...');
        const isEditingApplication = sessionStorage.getItem('editingApplication') === 'true';
        const shouldShowNoApplicationMessage = localStorage.getItem('show_no_application_message') === 'true';

        if (!isEditingApplication && !shouldShowNoApplicationMessage) {
            hasSubmittedApplication().then(hasApplication => {
                if (hasApplication) {
                    console.log('User has existing application, redirecting to results');
                    window.location.href = 'results.html';
                }
            });
        }
    }
}

// Run auth check immediately and on DOM ready
checkApplicationPageAuth();
document.addEventListener('DOMContentLoaded', checkApplicationPageAuth);

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

if (window.location.pathname.endsWith('results.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        if (!isLoggedIn()) return;

        const applyNowLink = document.querySelector('.navbar .nav-links a[href="application.html"]');
        if (applyNowLink) {
            const applyNowItem = applyNowLink.closest('li');
            if (applyNowItem) {
                applyNowItem.remove();
            }
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
    link.addEventListener('click', async function(e) {
        e.preventDefault();
        await routeToApplicationOrStatus();
    });
});

// Silhouette click handler - navigate to login/application page
const silhouette = document.querySelector('.person-silhouette');
if (silhouette) {
    silhouette.addEventListener('click', async function() {
        await routeToApplicationOrStatus();
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
        
        //TODO: convert this to use SQL 
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
                    const submittedKey = `application_submitted_${user.id || user.email}`;
                    localStorage.setItem(submittedKey, JSON.stringify({
                        submitted: true,
                        submittedAt: new Date().toISOString(),
                        data: data
                    }));
                    // Clear draft
                    const draftKey = `application_draft_${user.id || user.email}`;
                    localStorage.removeItem(draftKey);
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

// Get saved application data from localStorage (draft only)
function getSavedApplication() {
    const user = getCurrentUser();
    if (!user) return null;
    
    const draftKey = `application_draft_${user.id || user.email}`;
    const saved = localStorage.getItem(draftKey);
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

// Auto-save form data to localStorage as user types
function setupAutoSave() {
    const form = document.getElementById('applicationForm');
    if (!form) return;
    
    const user = getCurrentUser();
    if (!user) return;
    
    const draftKey = `application_draft_${user.id || user.email}`;
    
    // Save form data function
    function saveFormData() {
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        localStorage.setItem(draftKey, JSON.stringify({
            savedAt: new Date().toISOString(),
            data: data
        }));
    }
    
    // Auto-save on inputs and selects
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('change', saveFormData);
        input.addEventListener('blur', saveFormData);
    });
}

// Load saved form on page load
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('applicationForm');
    if (form && getCurrentUser()) {
        // Populate with saved data if available
        populateFormFromSavedApplication();
        
        // Setup autosave
        setupAutoSave();
    }
});

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
            
            // Populate form with submitted application data
            setTimeout(() => {
                const user = getCurrentUser();
                let applicationLoaded = false;
                
                if (user) {
                    const submittedKey = `application_submitted_${user.id || user.email}`;
                    const submitted = localStorage.getItem(submittedKey);
                    if (submitted) {
                        const app = JSON.parse(submitted);
                        const data = app.data;
                        Object.keys(data).forEach(key => {
                            const field = document.getElementById(key);
                            if (field) {
                                field.value = data[key];
                            }
                        });
                        applicationLoaded = true;
                    }
                }
                
                if (applicationLoaded) {
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

// Login/Signup page functionality - wrapped in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login/Signup page script loaded');
    
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    console.log('Login form found:', !!loginForm);
    console.log('Signup form found:', !!signupForm);

    // Toggle between login and signup
    if (showSignupLink) {
        console.log('Attaching showSignup listener');
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Show signup clicked');
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
        console.log('Attaching showLogin listener');
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Show login clicked');
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

    // Real-time email availability check
    const signupEmail = document.getElementById('signupEmail');
    const emailStatusDiv = document.getElementById('emailStatus');
    let emailCheckTimeout;
    
    if (signupEmail && emailStatusDiv) {
        signupEmail.addEventListener('input', async function() {
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
                        signupEmail.style.borderColor = '#ef4444';
                    } else {
                        emailStatusDiv.textContent = '✓ Email available';
                        emailStatusDiv.style.color = '#10b981';
                        emailStatusDiv.style.display = 'block';
                        signupEmail.style.borderColor = '#10b981';
                    }
                } catch (error) {
                    emailStatusDiv.textContent = '';
                    emailStatusDiv.style.display = 'none';
                }
            }, 500);
        });
    }

    // Real-time username availability check
    const signupUsername = document.getElementById('signupUsername');
    const usernameStatusDiv = document.getElementById('usernameStatus');
    let usernameCheckTimeout;
    
    if (signupUsername && usernameStatusDiv) {
        signupUsername.addEventListener('input', async function() {
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
                        signupUsername.style.borderColor = '#ef4444';
                    } else {
                        usernameStatusDiv.textContent = '✓ Username available';
                        usernameStatusDiv.style.color = '#10b981';
                        usernameStatusDiv.style.display = 'block';
                        signupUsername.style.borderColor = '#10b981';
                    }
                } catch (error) {
                    usernameStatusDiv.textContent = '';
                    usernameStatusDiv.style.display = 'none';
                }
            }, 500);
        });
    }

    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const errorDiv = document.getElementById('signupError');
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            
            const firstName = document.getElementById('signupFirstName').value;
            const lastName = document.getElementById('signupLastName').value;
            const email = document.getElementById('signupEmail').value;
            const phone = document.getElementById('signupPhone').value.replace(/\D/g, ''); // Strip dashes
            const username = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            
            if (password !== confirmPassword) {
                errorDiv.textContent = 'Passwords do not match';
                errorDiv.style.display = 'block';
                return;
            }
            
            try {
                console.log('Attempting signup...');
                // Send signup request to backend
                const response = await fetch('http://localhost:5000/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        firstName: firstName,
                        lastName: lastName,
                        email: email,
                        phone: phone,
                        username: username,
                        password: password,
                        confirmPassword: confirmPassword
                    })
                });
                
                const result = await response.json();
                console.log('Signup response:', result);
                
                if (response.ok && result.success) {
                    // Store user and session token
                    setCurrentUser(result.user, result.token);
                    console.log('Signup successful, redirecting...');
                    window.location.href = consumePostLoginRedirect();
                } else {
                    // Handle specific error types with field highlighting
                    const emailInput = document.getElementById('signupEmail');
                    const usernameInput = document.getElementById('signupUsername');
                    
                    // Clear previous field styling
                    emailInput.style.borderColor = '';
                    usernameInput.style.borderColor = '';
                    
                    let errorMessage = result.error || 'Signup failed. Please try again.';
                    
                    // Handle error type from backend
                    if (result.errorType === 'EMAIL_EXISTS') {
                        emailInput.style.borderColor = '#ef4444';
                        errorMessage = `❌ Email already in use: ${email}\n💡 Try a different email address or log in`;
                    } else if (result.errorType === 'USERNAME_EXISTS') {
                        usernameInput.style.borderColor = '#ef4444';
                        errorMessage = `❌ Username already taken: ${username}\n💡 Try a different username`;
                    } else if (result.error && result.error.toLowerCase().includes('email')) {
                        emailInput.style.borderColor = '#ef4444';
                        errorMessage = '❌ ' + result.error + '\n💡 Try a different email address';
                    } else if (result.error && result.error.toLowerCase().includes('username')) {
                        usernameInput.style.borderColor = '#ef4444';
                        errorMessage = '❌ ' + result.error + '\n💡 Try a different username';
                    }
                    
                    errorDiv.textContent = errorMessage;
                    errorDiv.style.display = 'block';
                    errorDiv.style.whiteSpace = 'pre-line';
                }
            } catch (error) {
                console.error('Signup error:', error);
                errorDiv.textContent = 'Unable to connect to server. Please ensure the server is running and PostgreSQL database is set up.';
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
                console.log('Attempting login...');
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
                console.log('Login response:', result);
                
                if (response.ok && result.success) {
                    // Store user and session token
                    setCurrentUser(result.user, result.token);
                    console.log('Login successful, redirecting...');
                    window.location.href = consumePostLoginRedirect();
                } else {
                    // Show error message from backend
                    errorDiv.textContent = result.error || 'Login failed. Please check your credentials.';
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = 'Unable to connect to server. Please ensure the server is running and PostgreSQL database is set up.';
                errorDiv.style.display = 'block';
            }
        });
    }
}); // End of DOMContentLoaded for login/signup
