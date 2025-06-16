import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const myListingsDiv = document.getElementById('myListings');
const welcomeMessage = document.getElementById('welcomeMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const logoutButton = document.getElementById('logoutButton');

const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
  } else {
    welcomeMessage.textContent = `Welcome, ${user.email}!`;
    await loadMyListings(user.uid);
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

async function loadMyListings(uid) {
  loadingSpinner.style.display = 'block';
  myListingsDiv.innerHTML = '';
  try {
    const snapshot = await getDocs(collection(window.db, 'fabrics'));
    let found = false;
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.owner === uid) {
        found = true;
        myListingsDiv.innerHTML += renderListing(docSnap.id, data);
      }
    });
    if (!found) {
      myListingsDiv.innerHTML = '<p>You have no fabric listings yet.</p>';
    }
  } catch (error) {
    myListingsDiv.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
  }
  loadingSpinner.style.display = 'none';
}

function renderListing(id, fabric) {
  return `
    <div class="fabric-card" data-id="${id}">
      <h4>${fabric.tags}</h4>
      <p>${fabric.description}</p>
      <div class="seller-info">
        <strong>Seller:</strong> ${fabric.name}<br>
        <strong>Phone:</strong> ${fabric.phone}<br>
        <strong>Location:</strong> ${fabric.location}<br>
        <button class="delete-btn btn" style="margin-top:5px;">Delete</button>
      </div>
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
