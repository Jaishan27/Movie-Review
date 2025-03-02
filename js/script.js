// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// API Configuration
const API_KEY = "";
const BASE_URL = "https://api.themoviedb.org/3";

// DOM elements
const movieContainer = document.getElementById("movie-container");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const myReviewsBtn = document.getElementById("my-reviews-btn");
const themeToggle = document.getElementById("theme-toggle");
const searchInput = document.getElementById("search");
const sortOptions = document.getElementById("sort-options");
const submitReviewBtn = document.getElementById("submit-review");
const reviewModal = document.getElementById("review-modal");
const closeModalContentBtn = document.getElementById("close-modal-content");
const closeModalActionsBtn = document.getElementById("close-modal-actions");

let currentPage = 1;
let isLoading = false;
let user = null;
let currentMovieId = null;
let currentMovieTitle = null;
let currentMovieVote = null;
let currentMoviePosterPath = null;

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
// Fetch movies from API
async function fetchMovies(
  query = "",
  page = 1,
  sortOrder = "popularity.desc"
) {
  let url = `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}&sort_by=${sortOrder}`; // This gets the latest movies with pagination
  if (query) {
    url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}&page=${page}&sort_by=${sortOrder}`; // This keeps the search functionality with pagination
  }

  console.log("Fetching URL: ", url);

  isLoading = true;
  const res = await fetch(url);
  const data = await res.json();

  console.log("API response: ", data);

  if (data.results && data.results.length > 0) {
    // Manually sort the movies based on the sortOrder
    if (sortOrder === "popularity.desc") {
      data.results.sort((a, b) => b.popularity - a.popularity);
    } else if (sortOrder === "popularity.asc") {
      data.results.sort((a, b) => a.popularity - b.popularity);
    } else if (sortOrder === "release_date.desc") {
      data.results.sort(
        (a, b) => new Date(b.release_date) - new Date(a.release_date)
      );
    } else if (sortOrder === "release_date.asc") {
      data.results.sort(
        (a, b) => new Date(a.release_date) - new Date(b.release_date)
      );
    } else if (sortOrder === "vote_average.desc") {
      data.results.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sortOrder === "vote_average.asc") {
      data.results.sort((a, b) => a.vote_average - b.vote_average);
    } else if (sortOrder === "title.asc") {
      data.results.sort((a, b) => a.title.localeCompare(b.title)); // A-Z sorting by title
    } else if (sortOrder === "title.desc") {
      data.results.sort((a, b) => b.title.localeCompare(a.title)); // Z-A sorting by title
    }
    displayMovies(data.results, query);
  } else {
    movieContainer.innerHTML = "<p>No movies found.</p>";
  }
  isLoading = false;
}

async function addReview(
  movieId,
  movieTitle,
  moviePosterPath,
  movieVote,
  rating,
  reviewText
) {
  if (!user) {
    alert("You must be logged in to submit a review.");
    return;
  }

  try {
    const reviewsRef = collection(db, "reviews");
    await addDoc(reviewsRef, {
      userId: user.uid, // Logged-in user ID
      movieId: movieId, // Movie ID from TMDB API
      movieTitle: movieTitle, // Movie title
      posterPath: moviePosterPath, //Movie poster path
      movieVote: movieVote, //Movie average vote
      rating: rating, // User rating (1-10)
      reviewText: reviewText, // Review text
      timestamp: serverTimestamp(), // Auto-generate timestamp
    });

    alert("Review added successfully!");
    closeReviewModal();
  } catch (error) {
    console.error("Error adding review:", error);
    alert("Failed to add review.");
  }
}

// Display movies dynamically
function displayMovies(movies, query) {
  const latestMoviesTitle = document.getElementById("latest-movies-title");

  // Show or hide the "Latest Movies" subtitle
  if (query) {
    latestMoviesTitle.style.display = "none"; // Hide subtitle when searching
  } else {
    latestMoviesTitle.style.display = "block"; // Show subtitle when viewing latest movies
  }

  console.log("Displaying movies: ", movies);

  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${
      movie.title
    }">
      <h3>${movie.title}</h3>
      <p>Rating: ${movie.vote_average.toFixed(1)}</p>
    `;

    // Add click event listener to the movie card
    movieCard.addEventListener("click", () => {
      currentMovieId = movie.id;
      currentMovieTitle = movie.title;
      currentMoviePosterPath = movie.poster_path;
      currentMovieVote = movie.vote_average;

      if (!user) {
        alert("You must be logged in to submit a review.");
      } else {
        openReviewModal(movie);
      }
    });

    movieContainer.appendChild(movieCard);
  });
}

// Open the review modal
function openReviewModal(movie) {
  // Get a reference to the Firestore collection where reviews are stored
  const reviewsRef = collection(db, "reviews");

  // Query Firestore to check if the user has already rated the movie
  const userRatingRef = query(
    reviewsRef,
    where("userId", "==", user.uid), // Check for the current user's ratings
    where("movieId", "==", movie.id) // Check if the movieId already exists for the user
  );

  // Run the query
  getDocs(userRatingRef).then((querySnapshot) => {
    if (querySnapshot.empty) {
      // If no review is found, allow the user to rate
      // Set the modal content with movie details
      const modalTitle = document.getElementById("modal-movie-title");
      const modalPoster = document.getElementById("modal-movie-poster");
      const modalRating = document.getElementById("avg-rating-value");

      // Set the movie title and poster in the modal
      modalTitle.textContent = movie.title;
      modalPoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
      modalRating.textContent = movie.vote_average.toFixed(1);

      reviewModal.style.display = "block";
    } else {
      // If the user has already rated this movie, show an alert
      alert(
        "You have already rated this movie! Go to 'My Reviews' to see all your reviews!"
      );
    }
  });
}

// Close the review modal
function closeReviewModal() {
  reviewModal.style.display = "none";
  document.getElementById("review-score").value = ""; // Reset rating input
  document.getElementById("review-text").value = "";
}

// Live search movies
searchInput.addEventListener("input", () => {
  movieContainer.innerHTML = ""; // Clear the container
  currentPage = 1; // Reset to first page for new search
  fetchMovies(searchInput.value, currentPage, sortOptions.value);
});

// Listen for changes in the authentication state
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    user = firebaseUser; // Set the user to the signed-in user
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    myReviewsBtn.style.display = "inline-block";
  } else {
    user = null; // Set user to null if signed out
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    myReviewsBtn.style.display = "none";
  }
});

// Login function (sign in with Google)
loginBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("User logged in: ", user);
    })
    .catch((error) => {
      console.log("Error during login: ", error);
    });
});

// Logout function
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("User logged out");
    })
    .catch((error) => {
      console.log("Error during logout: ", error);
    });
});

// Submit review
submitReviewBtn.addEventListener("click", () => {
  const rating = parseInt(document.getElementById("review-score").value);
  const reviewText = document.getElementById("review-text").value;

  if (!rating || rating < 1 || rating > 10) {
    alert("Please enter a valid rating between 1 and 10.");
    return;
  }

  if (!reviewText.trim()) {
    alert("Review text cannot be empty.");
    return;
  }

  // Call the function to add the review (assuming `currentMovieId` and `currentMovieTitle` are set)
  addReview(
    currentMovieId,
    currentMovieTitle,
    currentMoviePosterPath,
    currentMovieVote,
    rating,
    reviewText
  );
});

// Scroll event to load more movies
window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    !isLoading
  ) {
    currentPage++;
    fetchMovies(searchInput.value, currentPage, sortOptions.value);
  }
});

// Event to sort movies based on user choice
sortOptions.addEventListener("change", () => {
  const selectedSort = sortOptions.value;
  movieContainer.innerHTML = "";
  currentPage = 1;
  console.log("Selected sort option: ", selectedSort);
  fetchMovies(searchInput.value, currentPage, selectedSort);
});

// Events to exit out of the review page
closeModalContentBtn.addEventListener("click", closeReviewModal);
closeModalActionsBtn.addEventListener("click", closeReviewModal);

// Initial movie load
fetchMovies();
