import { collection, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const searchForm = document.getElementById('searchForm');
const searchQueryInput = document.getElementById('searchQuery');
const searchResultsDiv = document.getElementById('searchResults');
const logoutButton = document.getElementById('logoutButton');
const welcomeMessage = document.getElementById('welcomeMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const favoritesSection = document.getElementById('favoritesSection');

let currentUser = null;
let userFavorites = [];

// --- PAGE PROTECTION & WELCOME MESSAGE ---
const auth = getAuth();
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    welcomeMessage.textContent = `Welcome, ${user.email}!`;
    currentUser = user;
    await loadFavorites();
    updateFavoritesSection();
  }
});

// --- LOGOUT FUNCTIONALITY with confirmation ---
logoutButton.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to logout?')) return;
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    alert('Logout failed: ' + error.message);
  }
});

// --- FAVORITES HANDLING ---
async function loadFavorites() {
  if (!currentUser) return;
  const favDoc = await getDoc(doc(window.db, 'favorites', currentUser.uid));
  userFavorites = favDoc.exists() ? favDoc.data().items || [] : [];
}

async function saveFavorites() {
  if (!currentUser) return;
  await setDoc(doc(window.db, 'favorites', currentUser.uid), { items: userFavorites });
}

function isFavorite(fabric) {
  return userFavorites.some(f => f.tags === fabric.tags && f.name === fabric.name && f.phone === fabric.phone);
}

function renderFabric(fabric) {
  const isFav = isFavorite(fabric);
  return `
    <div class="fabric-card">
      <h4>${fabric.tags}</h4>
      <p>${fabric.description}</p>
      <div class="seller-info">
        <strong>Seller:</strong> ${fabric.name}<br>
        <span class="phone-number" style="display:none;"><strong>Phone:</strong> ${fabric.phone}<br></span>
        <button class="show-contact-btn" style="margin:5px 0;">Show Contact</button>
        <strong>Location:</strong> ${fabric.location}<br>
        <button class="fav-btn btn" data-tags="${fabric.tags}" data-name="${fabric.name}" data-phone="${fabric.phone}" style="margin-top:5px; background:${isFav ? '#f39c12' : '#eee'};">${isFav ? '★ Favorited' : '☆ Favorite'}</button>
      </div>
    </div>
  `;
}

// Show/hide phone number on button click
document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('show-contact-btn')) {
    const sellerInfo = e.target.closest('.seller-info');
    const phoneSpan = sellerInfo.querySelector('.phone-number');
    if (phoneSpan) {
      phoneSpan.style.display = 'inline';
      e.target.style.display = 'none';
    }
  }
});

// Favorite/unfavorite logic
document.addEventListener('click', async function(e) {
  if (e.target && e.target.classList.contains('fav-btn')) {
    if (!currentUser) return;
    const tags = e.target.getAttribute('data-tags');
    const name = e.target.getAttribute('data-name');
    const phone = e.target.getAttribute('data-phone');
    const idx = userFavorites.findIndex(f => f.tags === tags && f.name === name && f.phone === phone);
    if (idx !== -1) {
      userFavorites.splice(idx, 1);
      e.target.textContent = '☆ Favorite';
      e.target.style.background = '#eee';
    } else {
      userFavorites.push({ tags, name, phone });
      e.target.textContent = '★ Favorited';
      e.target.style.background = '#f39c12';
    }
    await saveFavorites();
    updateFavoritesSection();
  }
});

function updateFavoritesSection() {
  if (!favoritesSection) return;
  if (userFavorites.length === 0) {
    favoritesSection.innerHTML = '<h3>Your Favorites</h3><p>No favorites yet.</p>';
  } else {
    favoritesSection.innerHTML = '<h3>Your Favorites</h3>' + userFavorites.map(f => `<div class="fabric-card"><h4>${f.tags}</h4><div class="seller-info"><strong>Seller:</strong> ${f.name}<br><strong>Phone:</strong> ${f.phone}</div></div>`).join('');
  }
}

// --- SEARCH FUNCTIONALITY ---
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  searchResultsDiv.innerHTML = '';
  loadingSpinner.style.display = 'block';
  const searchValue = searchQueryInput.value.trim().toLowerCase();
  if (!searchValue) {
    loadingSpinner.style.display = 'none';
    searchResultsDiv.innerHTML = '<p style="color:red">Please enter a search term.</p>';
    return;
  }

  try {
    // Fetch all fabrics (for simple search)
    const snapshot = await getDocs(collection(window.db, 'fabrics'));
    const results = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Simple search: check if tags or description include the search term
      if (
        (data.tags && data.tags.toLowerCase().includes(searchValue)) ||
        (data.description && data.description.toLowerCase().includes(searchValue))
      ) {
        results.push(data);
      }
    });
    loadingSpinner.style.display = 'none';
    if (results.length === 0) {
      searchResultsDiv.innerHTML = '<p>No fabrics found matching your search.</p>';
    } else {
      searchResultsDiv.innerHTML = results.map(renderFabric).join('');
    }
  } catch (error) {
    loadingSpinner.style.display = 'none';
    searchResultsDiv.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
  }
});
