import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  // Firebase configuration details...
  apiKey: "AIzaSyA8PnC9IQuxZhPGmGangupf1DabIjfH3oM",
  authDomain: "user-collection-ab948.firebaseapp.com",
  databaseURL: "https://user-collection-ab948-default-rtdb.firebaseio.com",
  projectId: "user-collection-ab948",
  storageBucket: "user-collection-ab948.appspot.com",
  messagingSenderId: "860773486001",
  appId: "1:860773486001:web:fed08e61e30dbdc0d24190",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get the Firebase database instance
const database = getDatabase(app);

// Get DOM elements
const addUserButton = document.querySelector(".add-user");
const addUserPopup = document.querySelector(".popup.add");
const updatePopup = document.querySelector(".popup.update");
const addUserForm = addUserPopup.querySelector("form");
const updateForm = updatePopup.querySelector("form");
const crudTable = document.getElementById("crud").querySelector("tbody");

// Show add user popup
addUserButton.addEventListener("click", () => {
  addUserPopup.classList.add("active");
});

// Hide add user popup
addUserForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addUserPopup.classList.remove("active");
});

// Close popups when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === addUserPopup) {
    addUserPopup.classList.remove("active");
  }
  if (e.target === updatePopup) {
    updatePopup.classList.remove("active");
  }
});

// Create user
addUserForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = addUserForm.name.value;
  const email = addUserForm.email.value;
  const message = addUserForm.message.value;

  const newUser = {
    name: name,
    email: email,
    message: message,
  };

  // Push new user data to Firebase
  push(ref(database, "users"), newUser);
  addUserForm.reset();
});

// Read users
onValue(ref(database, "users"), (snapshot) => {
  crudTable.innerHTML = ""; // Clear existing table rows

  snapshot.forEach((childSnapshot) => {
    const userKey = childSnapshot.key;
    const userData = childSnapshot.val();

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${userData.name}</td>
      <td>${userData.email}</td>
      <td>${userData.message}</td>
      <td>
        <button class="edit" data-key="${userKey}">Edit</button>
        <button class="delete" data-key="${userKey}">Delete</button>
      </td>
    `;

    crudTable.appendChild(row);
  });

  // Edit user button click event
  const editButtons = crudTable.querySelectorAll(".edit");
  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const userKey = button.getAttribute("data-key");
      const userRef = ref(database, `users/${userKey}`);

      // Read the current user data from Firebase
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();

        // Fill update form with user data
        updateForm.name.value = userData.name;
        updateForm.email.value = userData.email;
        updateForm.message.value = userData.message;

        // Show update popup
        updatePopup.classList.add("active");

        // Save the user key in a data attribute
        updateForm.setAttribute("data-key", userKey);
      });
    });
  });

  // Update user form submission event listener
  updateForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const userKey = updateForm.getAttribute("data-key");
    const userRef = ref(database, `users/${userKey}`);

    const updatedUser = {
      name: updateForm.name.value,
      email: updateForm.email.value,
      message: updateForm.message.value,
    };

    // Update user data in Firebase
    set(userRef, updatedUser)
      .then(() => {
        updatePopup.classList.remove("active");
        updateForm.reset();
      })
      .catch((error) => {
        console.log(error);
      });
  });

  // Delete user button click event
  const deleteButtons = crudTable.querySelectorAll(".delete");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const userKey = button.getAttribute("data-key");
      const userRef = ref(database, `users/${userKey}`);

      // Remove user data from Firebase
      remove(userRef);
    });
  });
});
