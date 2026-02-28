// Authentication helpers
function isLoggedIn() {
    return localStorage.getItem('rentmatch_user') !== null;
}

function getCurrentUser() {
    const userJson = localStorage.getItem('rentmatch_user');
    return userJson ? JSON.parse(userJson) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('rentmatch_user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('rentmatch_user');
    window.location.href = 'index.html';
}

// Check authentication for application page
if (window.location.pathname.endsWith('application.html')) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Logout button handler
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
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
            const response = await fetch('http://localhost:5000/api/submit-application', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
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
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupCard.classList.add('hidden');
        loginCard.classList.remove('hidden');
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
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('signupEmail').value;
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // Create user account (in a real app, this would be sent to a server)
        const user = {
            email: email,
            username: username,
            // In a real app, never store passwords in plain text!
            createdAt: new Date().toISOString()
        };
        
        // Store user in localStorage
        setCurrentUser(user);
        
        // Redirect to application page
        window.location.href = 'application.html';
    });
}

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // In a real app, this would validate against a server
        // For now, we'll just check if any user exists in localStorage
        const existingUser = getCurrentUser();
        
        if (!existingUser) {
            alert('No account found. Please create an account first.');
            return;
        }
        
        // Simple validation - in real app, would check password on server
        if (existingUser.email !== email) {
            alert('Invalid email or password');
            return;
        }
        
        // Login successful
        window.location.href = 'application.html';
    });
}
