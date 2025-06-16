import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Get references to HTML elements
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
const confirmPasswordInput = document.getElementById('confirmPassword');
const authButton = document.getElementById('authButton');
const formTitle = document.getElementById('formTitle');
const switchModeLink = document.getElementById('switchModeLink');
const switchText = document.getElementById('switchText');
const errorMessage = document.getElementById('errorMessage');

let isLoginMode = true; // State to track if we are in login or register mode

// Function to toggle between Login and Register modes
switchModeLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior (jumping to top)
    errorMessage.textContent = ''; // Clear any previous error messages

    if (isLoginMode) {
        formTitle.textContent = 'Register';
        authButton.textContent = 'Register Account';
        switchText.textContent = 'Already have an account?';
        switchModeLink.textContent = 'Login here';
        confirmPasswordGroup.style.display = 'block'; // Show confirm password
        confirmPasswordInput.setAttribute('required', 'required'); // Make it required
        isLoginMode = false;
    } else {
        formTitle.textContent = 'Login';
        authButton.textContent = 'Login';
        switchText.textContent = "Don't have an account?";
        switchModeLink.textContent = 'Register here';
        confirmPasswordGroup.style.display = 'none'; // Hide confirm password
        confirmPasswordInput.removeAttribute('required'); // No longer required
        isLoginMode = true;
    }
});

// Handle form submission (Login or Register)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)

    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    errorMessage.textContent = ''; // Clear previous errors

    if (isLoginMode) {
        // Login Logic
        try {
            // Use the imported function with window.auth
            const userCredential = await signInWithEmailAndPassword(window.auth, email, password);
            const user = userCredential.user;
            console.log('User logged in:', user);
            // Redirect user after successful login
            window.location.href = 'search_fabric.html'; // Redirect to the search page
        } catch (error) {
            console.error('Login Error:', error);
            errorMessage.textContent = error.message; // Display Firebase error message
        }
    } else {
        // Register Logic
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match!';
            return;
        }

        try {
            // Use the imported function with window.auth
            const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
            const user = userCredential.user;
            console.log('User registered:', user);
            // Redirect user after successful registration
            window.location.href = 'search_fabric.html'; // Redirect to the search page
        } catch (error) {
            console.error('Registration Error:', error);
            errorMessage.textContent = error.message; // Display Firebase error message
        }
    }
});

// TODO: Implement "Register as Seller" link functionality later if needed for different user types
// For now, it will just be a link that does nothing.
