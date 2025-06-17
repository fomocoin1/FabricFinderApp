import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// --- PAGE PROTECTION ---
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
  }
});

// --- LOGOUT FUNCTIONALITY (optional, if you add a logout button) ---
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = 'login.html';
    } catch (error) {
      alert('Logout failed: ' + error.message);
    }
  });
}

// --- DISPLAY FABRIC LISTINGS ---
const resultsGrid = document.getElementById('resultsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');

async function loadResults() {
  loadingSpinner.style.display = 'block';
  resultsGrid.innerHTML = '';
  try {
    const snapshot = await getDocs(collection(window.db, 'fabrics'));
    let found = false;
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      found = true;
      resultsGrid.innerHTML += renderResult(data);
    });
    if (!found) {
      resultsGrid.innerHTML = '<p>No fabric listings found.</p>';
    }
  } catch (error) {
    resultsGrid.innerHTML = `<p style=\"color:red\">Error: ${error.message}</p>`;
  }
  loadingSpinner.style.display = 'none';
}

function renderResult(fabric) {
  return `
    <div class=\"fabric-card\">
      <h4>${fabric.tags}</h4>
      <p>${fabric.description}</p>
      <div class=\"seller-info\">
        <strong>Seller:</strong> ${fabric.name}<br>
        <strong>Phone:</strong> ${fabric.phone}<br>
        <strong>Location:</strong> ${fabric.location}
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadResults);
