import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration and initialization (same as before)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const reviewsContainer = document.getElementById("reviews-container");
const deleteAllBtn = document.createElement("button");
const sortOptions = document.getElementById("sort-options");

deleteAllBtn.id = "delete-all-reviews-btn";
deleteAllBtn.innerHTML = `Delete All Reviews <i class="material-icons">delete_forever</i>`;
deleteAllBtn.style.display = "none";
document.getElementById("my-reviews-heading").append(deleteAllBtn);
const themeToggle = document.getElementById("theme-toggle");

const modal = document.getElementById("review-modal");
const modalMovieTitle = document.getElementById("modal-movie-title");
const modalMoviePoster = document.getElementById("modal-movie-poster");
const avgRatingValue = document.getElementById("avg-rating-value");
const reviewScoreInput = document.getElementById("review-score");
const reviewTextInput = document.getElementById("review-text");
const submitReviewBtn = document.getElementById("submit-review");
const closeModalBtns = document.querySelectorAll(
  ".close-btn, #close-modal-actions"
);

let currentReviewId = null;
let reviews = [];

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const themeToggle = document.getElementById("theme-toggle");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️"; // Set correct icon
  } else {
    themeToggle.textContent = "🌙"; // Set correct icon
  }

  themeToggle.addEventListener("click", () => {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    themeToggle.textContent = isDarkMode ? "☀️" : "🌙"; // Update icon instantly
  });
});
// Wait for the user to be authenticated
onAuthStateChanged(auth, async (user) => {
  if (user) {
    showLoading();
    // If the user is logged in, get their reviews
    const userReviewsRef = collection(db, "reviews");
    const q = query(userReviewsRef, where("userId", "==", user.uid));

    const querySnapshot = await getDocs(q);
    reviews = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id, // Store Firestore document ID
      ...docSnap.data(), // Spread the review data
    }));

    hideLoading();
    console.log("Reviews", reviews);

    displayReviews(reviews);
    const generateMoviesBtn = document.getElementById("recommended-movies-btn");
    if (reviews.length < 3) {
      generateMoviesBtn.style.display = "none";
    } else {
      generateMoviesBtn.style.display = "block";
    }
  } else {
    // Redirect to login page if not logged in
    window.location.href = "index.html";
  }
});

function showLoading() {
  const reviewsContainer = document.getElementById("reviews-container");
  reviewsContainer.innerHTML = "<p>Loading your reviews...</p>";
}

// Hide loading message and display reviews
function hideLoading() {
  const reviewsContainer = document.getElementById("reviews-container");
  reviewsContainer.innerHTML = ""; // Clear the loading message
}

// Display reviews in the DOM
function displayReviews(reviews) {
  reviewsContainer.innerHTML = ""; // Clear previous reviews

  if (reviews.length === 0) {
    reviewsContainer.innerHTML =
      "<p>You have not submitted any reviews yet.</p>";
    deleteAllBtn.style.display = "none";
    return;
  }

  deleteAllBtn.style.display = "block";

  reviews.forEach((review) => {
    const reviewElement = document.createElement("div");
    reviewElement.classList.add("review-card");
    reviewElement.innerHTML = `
      <div class="review-header">
        <img src="https://image.tmdb.org/t/p/w500${review.posterPath}" alt="${
      review.movieTitle
    } poster" class="movie-poster">
        <div class="review-details">
          <h3>${review.movieTitle}</h3>
          <p>Average Rating: ${review.movieVote.toFixed(1)}</p>
        </div>
      </div>
      <div class="review-content">
        <p>My Rating: ${review.rating}/10</p>
        <p>${review.reviewText}</p>
      </div>
      <button class="edit-btn" data-id="${review.id}">Edit</button>
      <button class="delete-btn" data-id="${review.id}">Delete</button>
    `;

    // Add event listeners for edit and delete buttons
    reviewElement
      .querySelector(".edit-btn")
      .addEventListener("click", (event) => {
        console.log("edit button clicked");
        const reviewId = event.target.dataset.id;
        openReviewModal(reviewId);
      });

    reviewElement
      .querySelector(".delete-btn")
      .addEventListener("click", async (event) => {
        const reviewId = event.target.dataset.id;
        if (confirm("Are you sure you want to delete this review?")) {
          try {
            await deleteDoc(doc(db, "reviews", reviewId)); // Delete from Firebase
            reviews = reviews.filter((review) => review.id !== reviewId);
            reviewElement.remove();

            console.log("Review deleted from Firebase:", reviewId);

            // Check if there are no reviews left after deletion
            if (reviews.length === 0) {
              deleteAllBtn.style.display = "none";
            }

            // Update generate button visibility
            const generateMoviesBtn = document.getElementById(
              "recommended-movies-btn"
            );
            if (reviews.length < 3) {
              generateMoviesBtn.style.display = "none";
            }
          } catch (error) {
            console.error("Error deleting review:", error);
          }
        }
      });

    reviewsContainer.appendChild(reviewElement);
  });
}

deleteAllBtn.addEventListener("click", async () => {
  if (confirm("Are you sure you want to delete all reviews?")) {
    const user = auth.currentUser;
    if (!user) return;
    const userReviewsRef = collection(db, "reviews");
    const q = query(userReviewsRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, "reviews", docSnap.id));
    });
    displayReviews([]);
    document.getElementById("recommended-movies-btn").style.display = "none";
  }
});

document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "index.html";
});

document
  .getElementById("recommended-movies-btn")
  .addEventListener("click", () => {
    window.location.href = "recommended-movies.html";
  });

function openReviewModal(reviewId) {
  console.log("Opening modal for review ID:", reviewId);
  const review = reviews.find((r) => r.id === reviewId);
  if (!review) return;

  // Fill modal with existing review data
  modalMovieTitle.textContent = review.movieTitle;
  modalMoviePoster.src = `https://image.tmdb.org/t/p/w500${review.posterPath}`;
  avgRatingValue.textContent = review.movieVote.toFixed(1);
  reviewScoreInput.value = review.rating;
  reviewTextInput.value = review.reviewText;

  // Store the review ID for updating later
  currentReviewId = reviewId;

  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
  reviewScoreInput.value = "";
  reviewTextInput.value = "";
  currentReviewId = null;
}

closeModalBtns.forEach((btn) => {
  btn.addEventListener("click", closeModal);
});

// Handle submit review update
submitReviewBtn.addEventListener("click", async () => {
  if (!currentReviewId) return;

  const newRating = reviewScoreInput.value;
  const newReviewText = reviewTextInput.value;

  try {
    await updateDoc(doc(db, "reviews", currentReviewId), {
      rating: newRating,
      reviewText: newReviewText,
    });

    console.log("Review updated successfully");
    closeModal();
    location.reload();
  } catch (error) {
    console.error("Error updating review:", error);
  }
});
// Function to sort reviews
function sortReviews(sortBy) {
  console.log("reviews array ", reviews);
  let sortedReviews = [...reviews]; // Clone the reviews array to avoid mutation
  console.log("sorted array", sortedReviews);

  switch (sortBy) {
    case "date.desc":
      sortedReviews.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      break;
    case "date.asc":
      sortedReviews.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
      break;
    case "title.asc":
      sortedReviews.sort((a, b) => a.movieTitle.localeCompare(b.movieTitle)); // A-Z
      break;
    case "title.desc":
      sortedReviews.sort((a, b) => b.movieTitle.localeCompare(a.movieTitle)); // Z-A
      break;
    case "user_vote.desc":
      sortedReviews.sort((a, b) => b.rating - a.rating); // Rating High to Low
      break;
    case "user_vote.asc":
      sortedReviews.sort((a, b) => a.rating - b.rating); // Rating Low to High
      break;
  }

  displayReviews(sortedReviews); // Re-render the reviews with sorted data
}

// Event listener for the sort dropdown
sortOptions.addEventListener("change", (event) => {
  sortReviews(event.target.value); // Trigger sorting when dropdown value changes
});

// Initial render (default sorting)
sortReviews("date.desc"); //
