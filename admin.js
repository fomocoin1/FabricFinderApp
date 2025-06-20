import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const adminStatsDiv = document.getElementById('adminStats');
const allListingsDiv = document.getElementById('allListings');
const welcomeMessage = document.getElementById('welcomeMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const logoutButton = document.getElementById('logoutButton');
const userStatsDiv = document.getElementById('userStats');
const allUsersDiv = document.getElementById('allUsers');

const ADMIN_EMAIL = 'contactofficialmoses@gmail.com'; // Change to your admin email
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else if (user.email !== ADMIN_EMAIL) {
    alert('You are not authorized to view this page.');
    window.location.href = 'search_fabric.html';
  } else {
    welcomeMessage.textContent = `Welcome, Admin (${user.email})!`;
    await loadStatsAndListings();
    await loadUsers();
  }
});

logoutButton.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to logout?')) return;
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    alert('Logout failed: ' + error.message);
  }
});

async function loadStatsAndListings() {
  loadingSpinner.style.display = 'block';
  adminStatsDiv.innerHTML = '';
  allListingsDiv.innerHTML = '';
  try {
    const snapshot = await getDocs(collection(window.db, 'fabrics'));
    let count = 0;
    let sellers = new Set();
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      count++;
      if (data.owner) sellers.add(data.owner);
      allListingsDiv.innerHTML += renderListing(docSnap.id, data);
    });
    adminStatsDiv.innerHTML = `<h3>Stats</h3><p>Total Listings: ${count}</p><p>Unique Sellers: ${sellers.size}</p>`;
    if (count === 0) {
      allListingsDiv.innerHTML = '<p>No fabric listings found.</p>';
    }
  } catch (error) {
    adminStatsDiv.innerHTML = `<p style=\"color:red\">Error: ${error.message}</p>`;
  }
  loadingSpinner.style.display = 'none';
}

async function loadUsers() {
  userStatsDiv.innerHTML = '';
  allUsersDiv.innerHTML = '';
  try {
    const snapshot = await getDocs(collection(window.db, 'users'));
    let count = 0;
    let recent = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      count++;
      recent.push(data);
      allUsersDiv.innerHTML += renderUser(data);
    });
    // Sort recent by createdAt descending
    recent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    userStatsDiv.innerHTML = `<h3>User Stats</h3><p>Total Users: ${count}</p><p>Most Recent Signup: ${recent[0] ? recent[0].email + ' (' + recent[0].createdAt + ')' : 'N/A'}</p>`;
    if (count === 0) {
      allUsersDiv.innerHTML = '<p>No users found.</p>';
    }
  } catch (error) {
    userStatsDiv.innerHTML = `<p style=\"color:red\">Error: ${error.message}</p>`;
  }
}

function renderListing(id, fabric) {
  return `
    <div class=\"fabric-card\" data-id=\"${id}\">
      <h4>${fabric.tags}</h4>
      <p>${fabric.description}</p>
      <div class=\"seller-info\">
        <strong>Seller:</strong> ${fabric.name}<br>
        <strong>Phone:</strong> ${fabric.phone}<br>
        <strong>Location:</strong> ${fabric.location}<br>
        <button class=\"delete-btn btn\" style=\"margin-top:5px;\">Delete</button>
      </div>
    </div>
  `;
}

function renderUser(user) {
  return `
    <div class=\"fabric-card\">
      <strong>Email:</strong> ${user.email}<br>
      <strong>UID:</strong> ${user.uid}<br>
      <strong>Joined:</strong> ${user.createdAt}
    </div>
  `;
}

document.addEventListener('click', async (e) => {
  if (e.target && e.target.classList.contains('delete-btn')) {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    const card = e.target.closest('.fabric-card');
    const id = card.getAttribute('data-id');
    try {
      await deleteDoc(doc(window.db, 'fabrics', id));
      card.remove();
    } catch (error) {
      alert('Delete failed: ' + error.message);
    }
  }
});
