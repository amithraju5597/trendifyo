import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile,
    signOut,
    sendPasswordResetEmail // Added for forgot password functionality
} from 'https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: 'AIzaSyAVrh388rvzzK7BPyqAg5MeX-ig3wSkhl8',
    authDomain: 'trendifyo.firebaseapp.com',
    projectId: 'trendifyo',
    storageBucket: 'trendifyo.firebasestorage.app',
    messagingSenderId: '376013749859',
    appId: '1:376013749859:web:07fb016d367e6686254256',
    measurementId: 'G-7S6G83K667'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export function showAuthMessage(message, type = 'error') { // Exported
    const messageElement = document.getElementById('auth-message');
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.classList.remove('error', 'success');
    messageElement.classList.add(type === 'success' ? 'success' : 'error');
    messageElement.style.display = 'block';
}

export function clearAuthMessage() { // Exported
    const messageElement = document.getElementById('auth-message');
    if (!messageElement) return;
    messageElement.textContent = '';
    messageElement.style.display = 'none';
}

export function showLoadingSpinner(button, spinner) {
    if (button) {
        button.disabled = true;
        button.style.opacity = '0.7'; // Dim the button
    }
    if (spinner) spinner.style.display = 'inline-block';
}

export function hideLoadingSpinner(button, spinner) {
    if (button) {
        button.disabled = false;
        button.style.opacity = '1'; // Restore button opacity
    }
    if (spinner) spinner.style.display = 'none';
}

function redirectToAccount() {
    window.location.href = 'my-account.html';
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

export function handleLogin() { // Exported for use in login.html
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const loginSpinner = loginSubmitBtn ? loginSubmitBtn.querySelector('.loading-spinner') : null;

    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;

    console.debug('handleLogin:', { email, passwordProvided: Boolean(password) });

    if (!email || !password) {
        showAuthMessage('Enter a valid email and password.', 'error');
        return;
    }

    clearAuthMessage();
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            hideLoadingSpinner(loginSubmitBtn, loginSpinner);
            showAuthMessage('Login successful. Redirecting...', 'success');
            setTimeout(redirectToAccount, 1200);
        })
        .catch(error => {
            // Log the full error to the console for debugging purposes
            console.error('Firebase Login Error:', error);

            let errorMessage = 'Invalid email or password. Please try again.'; // Secure, generic message for most cases.

            if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Access to this account is temporarily disabled due to many failed attempts. Please try again later.';
            }
            hideLoadingSpinner(loginSubmitBtn, loginSpinner);
            showAuthMessage(errorMessage, 'error');
        });
}

export function handleRegister() { // Exported for use in register.html
    const registerSubmitBtn = document.getElementById('register-submit-btn');
    const registerSpinner = registerSubmitBtn ? registerSubmitBtn.querySelector('.loading-spinner') : null;

    const fullName = document.getElementById('register-name')?.value.trim();
    const email = document.getElementById('register-email')?.value.trim();
    const password = document.getElementById('register-password')?.value;

    if (!fullName || !email || !password) {
        showAuthMessage('Complete all fields before registering.', 'error');
        return;
    }

    clearAuthMessage();
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            return updateProfile(userCredential.user, { displayName: fullName });
        })
        .then(() => {
            return signOut(auth); // Log out the user immediately so they have to log in manually
        })
        .then(() => {
            hideLoadingSpinner(registerSubmitBtn, registerSpinner);
            showAuthMessage('Registration complete. Redirecting to login...', 'success');
            setTimeout(redirectToLogin, 1200);
        })
        .catch(error => {
            hideLoadingSpinner(registerSubmitBtn, registerSpinner);
            // Log the full error to the console for debugging
            console.error('Firebase Registration Error:', error);

            let errorMessage = 'Registration failed. An unexpected error occurred.'; // Default message

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered. Please try to login.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. It should be at least 6 characters long.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'The email address is not valid. Please enter a valid email.';
                    break;
            }
            
            showAuthMessage(errorMessage, 'error');
        });
}

export function handleForgotPassword() {
    const resetPasswordSubmitBtn = document.getElementById('reset-password-submit-btn');
    const resetSpinner = resetPasswordSubmitBtn ? resetPasswordSubmitBtn.querySelector('.loading-spinner') : null;

    const email = document.getElementById('reset-email')?.value.trim();

    if (!email) {
        showAuthMessage('Please enter your email address.', 'error');
        hideLoadingSpinner(resetPasswordSubmitBtn, resetSpinner); // Hide spinner if validation fails
        return;
    }

    clearAuthMessage();
    sendPasswordResetEmail(auth, email)
        .then(() => {
            hideLoadingSpinner(resetPasswordSubmitBtn, resetSpinner);
            showAuthMessage('Password reset email sent! Check your inbox. Redirecting to login...', 'success');
            setTimeout(redirectToLogin, 3000); // Redirect to login after 3 seconds
        })
        .catch(error => {
            console.error('Firebase Forgot Password Error:', error);
            let errorMessage = 'Failed to send password reset email. Please try again.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No user found with that email address.';
            hideLoadingSpinner(resetPasswordSubmitBtn, resetSpinner);
            }
            showAuthMessage(errorMessage, 'error');
        });
}

function handleLogout() {
    signOut(auth)
        .then(() => {
            // Clear local storage items tied to the user
            const keysToRemove = ['trendifyo_profile', 'trendifyo_addresses', 'trendifyo_payments', 'trendifyo_wishlist', 'trendifyo_orders'];
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Logout failed:', error);
        });
}

function loadAccountData(user) {
    const nameElement = document.getElementById('user-name');
    const nameFieldElement = document.getElementById('user-name-field');
    const emailElement = document.getElementById('user-email');
    const accountMessage = document.getElementById('account-message');
    const profileFirstName = document.getElementById('firstName');
    const profileLastName = document.getElementById('lastName');
    const profileEmail = document.getElementById('email');

    const displayName = user.displayName || 'User';
    const firstName = displayName.split(' ')[0] || 'User';

    if (nameElement) {
        nameElement.textContent = firstName;
    }
    if (nameFieldElement) {
        nameFieldElement.textContent = firstName;
    }
    if (emailElement) {
        emailElement.textContent = user.email || 'Not available';
    }
    if (accountMessage) {
        accountMessage.textContent = 'You are logged in to your Trendifyo account.';
    }
    if (profileFirstName && profileLastName && profileEmail) {
        const nameParts = displayName.split(' ');
        profileFirstName.value = nameParts[0] || '';
        profileLastName.value = nameParts.slice(1).join(' ') || '';
        profileEmail.value = user.email || '';
    }
}

function setupAuthForms() {
    const logoutButton = document.getElementById('logout-button');

    if (logoutButton) {
        logoutButton.addEventListener('click', event => {
            event.preventDefault();
            handleLogout();
        });
    }
}

function redirectIfAuthenticated() {
    onAuthStateChanged(auth, user => {
        const pathname = window.location.pathname.toLowerCase();
        console.debug('onAuthStateChanged:', { pathname, user: !!user });

        if (user) { // User is logged in
            if (pathname.endsWith('login.html') || pathname.endsWith('register.html')) {
                redirectToAccount();
            } else if (pathname.endsWith('my-account.html')) {
                loadAccountData(user);
            } else {
                // Update 'Login' button to 'My Account' across all pages if logged in
                const navLoginLinks = document.querySelectorAll('a[href$="login.html"], a[href$="/trendifyo/login.html"]');
                navLoginLinks.forEach(link => {
                    if (link.textContent.trim().toLowerCase() === 'login') {
                        link.textContent = 'My Account';
                        link.href = 'my-account.html';
                    }
                });
            }
        } else { // User is not logged in
            if (pathname.endsWith('my-account.html')) {
                redirectToLogin();
            }
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupAuthForms();
        redirectIfAuthenticated();
    });
} else {
    setupAuthForms();
    redirectIfAuthenticated();
}
