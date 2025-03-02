import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
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
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

// Movie Database API Key
const TMDB_API_KEY = "";

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const themeToggle = document.getElementById("theme-toggle");
const sortSelect = document.getElementById("sort-options");
let movies = [];

function sortRecommendedMovies(sortValue) {
  let sortedMovies = [...movies]; // Clone the array to avoid modifying the original
  switch (sortValue) {
    case "release_date.desc": // Newest First
      sortedMovies.sort(
        (a, b) => new Date(b.release_date) - new Date(a.release_date)
      );
      break;
    case "release_date.asc": // Newest First
      sortedMovies.sort(
        (a, b) => new Date(a.release_date) - new Date(b.release_date)
      );
      break;
    case "title.asc":
      sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "title.desc":
      sortedMovies.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "vote_average.asc":
      sortedMovies.sort((a, b) => a.vote_average - b.vote_average);
      break;
    case "vote_average.desc":
      sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
      break;
  }

  displayRecommendedMovies(sortedMovies); // Re-render the sorted movies
}

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
    fetchUserReviews(user.uid);
  } else {
    window.location.href = "index.html"; // Redirect to home if not logged in
  }
});

async function fetchUserReviews(userId) {
  const userReviewsRef = collection(db, "reviews");
  const q = query(userReviewsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const reviews = querySnapshot.docs.map((doc) => doc.data());

  if (reviews.length === 0) {
    document.getElementById("recommended-container").innerHTML =
      "<p>You need to review some movies first.</p>";
    return;
  }
  console.log("reviews", reviews);
  getMovieRecommendations(reviews);
}

let recommendationsFetched = false; // Add a flag

async function getMovieRecommendations(reviews) {
  document.getElementById("loading-text").style.display = "block";
  try {
    const userReviewData = reviews
      .map(
        (review) =>
          `Title: ${review.movieTitle}, Rating: ${review.rating}/10, Review: ${review.reviewText}`
      )
      .join("\n");
    console.log("user review data", userReviewData);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer `,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a movie recommendation assistant.",
          },
          {
            role: "user",
            content: `Based on these movie reviews, recommend exactly 16 similar movies. Only return a comma-separated list of movie titles.\n\n${userReviewData}`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (!data.choices || !data.choices[0].message) {
      throw new Error("No recommendations received.");
    }
    console.log("API response ", data);

    const movieTitles = data.choices[0].message.content
      .split(",")
      .map((title) => title.trim());
    console.log("Movie titles ", movieTitles);
    fetchMovieDetails(movieTitles);
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
  }
}

async function fetchMovieDetails(movieTitles) {
  const movieDetails = await Promise.all(
    movieTitles.map(async (title) => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          title
        )}`
      );
      const data = await res.json();
      return data.results.length > 0 ? data.results[0] : null;
    })
  );
  movies = movieDetails.filter((movie) => movie !== null);

  sortRecommendedMovies("release_date.desc");
}

function displayRecommendedMovies(movies) {
  console.log("movies ", movies);
  const container = document.getElementById("recommended-movies-container");
  container.innerHTML = "";

  document.getElementById("loading-text").style.display = "none";
  movies.forEach((movie) => {
    const movieElement = document.createElement("div");
    movieElement.classList.add("movie-card");
    movieElement.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${
      movie.title
    } poster" class="movie-poster">
      <h3>${movie.title}</h3>
      <p>Average Rating: ${movie.vote_average.toFixed(1)}</p>
    `;
    container.appendChild(movieElement);
  });
}

document.getElementById("back-btn").addEventListener("click", () => {
  window.location.href = "my-reviews.html";
});

document.getElementById("sort-options").addEventListener("change", (event) => {
  sortRecommendedMovies(event.target.value); // Trigger sorting and re-rendering
});
