import { collection, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
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
      <div class="listing-view">
        <h4>${fabric.tags}</h4>
        <p>${fabric.description}</p>
        <div class="seller-info">
          <strong>Seller:</strong> ${fabric.name}<br>
          <strong>Phone:</strong> ${fabric.phone}<br>
          <strong>Location:</strong> ${fabric.location}<br>
          <button class="edit-btn btn" style="margin-top:5px;">Edit</button>
          <button class="delete-btn btn" style="margin-top:5px;">Delete</button>
        </div>
      </div>
    </div>
  `;
}

function renderEditForm(id, fabric) {
  return `
    <div class="listing-edit">
      <input type="text" class="edit-tags" value="${fabric.tags}" placeholder="Tags" />
      <textarea class="edit-description" rows="2">${fabric.description}</textarea>
      <input type="text" class="edit-name" value="${fabric.name}" placeholder="Seller Name" />
      <input type="text" class="edit-phone" value="${fabric.phone}" placeholder="Phone" />
      <input type="text" class="edit-location" value="${fabric.location}" placeholder="Location" />
      <button class="save-edit-btn btn" style="margin-top:5px;">Save</button>
      <button class="cancel-edit-btn btn" style="margin-top:5px;">Cancel</button>
    </div>
  `;
}

document.addEventListener('click', async (e) => {
  // Delete
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
  // Edit
  if (e.target && e.target.classList.contains('edit-btn')) {
    const card = e.target.closest('.fabric-card');
    const id = card.getAttribute('data-id');
    const viewDiv = card.querySelector('.listing-view');
    const tags = viewDiv.querySelector('h4').textContent;
    const description = viewDiv.querySelector('p').textContent;
    const name = viewDiv.querySelector('.seller-info strong:nth-child(1)').nextSibling.textContent.trim();
    const phone = viewDiv.querySelector('.seller-info strong:nth-child(2)').nextSibling.textContent.trim();
    const location = viewDiv.querySelector('.seller-info strong:nth-child(3)').nextSibling.textContent.trim();
    viewDiv.style.display = 'none';
    card.insertAdjacentHTML('beforeend', renderEditForm(id, { tags, description, name, phone, location }));
  }
  // Cancel Edit
  if (e.target && e.target.classList.contains('cancel-edit-btn')) {
    const card = e.target.closest('.fabric-card');
    card.querySelector('.listing-edit').remove();
    card.querySelector('.listing-view').style.display = '';
  }
  // Save Edit
  if (e.target && e.target.classList.contains('save-edit-btn')) {
    const card = e.target.closest('.fabric-card');
    const id = card.getAttribute('data-id');
    const tags = card.querySelector('.edit-tags').value.trim();
    const description = card.querySelector('.edit-description').value.trim();
    const name = card.querySelector('.edit-name').value.trim();
    const phone = card.querySelector('.edit-phone').value.trim();
    const location = card.querySelector('.edit-location').value.trim();
    if (!tags || !description || !name || !phone || !location) {
      alert('All fields are required.');
      return;
    }
    try {
      await updateDoc(doc(window.db, 'fabrics', id), { tags, description, name, phone, location });
      card.querySelector('.listing-edit').remove();
      card.querySelector('.listing-view').remove();
      card.innerHTML = renderListing(id, { tags, description, name, phone, location });
    } catch (error) {
      alert('Update failed: ' + error.message);
    }
  }
});
