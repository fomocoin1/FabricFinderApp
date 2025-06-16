import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// --- PAGE PROTECTION & WELCOME MESSAGE ---
const auth = getAuth();
const welcomeMessage = document.getElementById('welcomeMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    welcomeMessage.textContent = `Welcome, ${user.email}!`;
  }
});

// --- LOGOUT FUNCTIONALITY with confirmation ---
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to logout?')) return;
    try {
      await signOut(auth);
      window.location.href = 'login.html';
    } catch (error) {
      alert('Logout failed: ' + error.message);
    }
  });
}

// Get references to form elements
const descriptionTags = document.getElementById('descriptionTags');
const shortDescription = document.getElementById('shortDescription');
const sellerName = document.getElementById('sellerName');
const phoneNumber = document.getElementById('phoneNumber');
const shopLocation = document.getElementById('shopLocation');
const fabricForm = document.querySelector('.container');
const submitButton = document.querySelector('.btn');

// Create a message element for feedback
let messageElem = document.createElement('p');
messageElem.style.marginTop = '10px';
fabricForm.appendChild(messageElem);

submitButton.addEventListener('click', async (e) => {
  e.preventDefault();
  messageElem.textContent = '';
  loadingSpinner.style.display = 'block';

  // Get values
  const tags = descriptionTags.value.trim();
  const description = shortDescription.value.trim();
  const name = sellerName.value.trim();
  const phone = phoneNumber.value.trim();
  const location = shopLocation.value.trim();

  // Basic validation
  if (!tags || !description || !name || !phone || !location) {
    loadingSpinner.style.display = 'none';
    messageElem.textContent = 'Please fill in all required fields.';
    messageElem.style.color = 'red';
    return;
  }
  // Phone number validation (Nigerian format: 080xxxxxxxx or +234xxxxxxxxxx)
  if (!/^((\+234)|0)[789][01]\d{8}$/.test(phone)) {
    loadingSpinner.style.display = 'none';
    messageElem.textContent = 'Please enter a valid Nigerian phone number.';
    messageElem.style.color = 'red';
    return;
  }

  try {
    // Save to Firestore (images skipped for now)
    await addDoc(collection(window.db, 'fabrics'), {
      tags,
      description,
      name,
      phone,
      location,
      createdAt: new Date().toISOString(),
      owner: auth.currentUser ? auth.currentUser.uid : null
    });
    loadingSpinner.style.display = 'none';
    messageElem.textContent = 'Fabric listed successfully!';
    messageElem.style.color = 'green';
    // Optionally, clear the form
    descriptionTags.value = '';
    shortDescription.value = '';
    sellerName.value = '';
    phoneNumber.value = '';
    shopLocation.value = '';
  } catch (error) {
    loadingSpinner.style.display = 'none';
    messageElem.textContent = 'Error listing fabric: ' + error.message;
    messageElem.style.color = 'red';
  }
});
