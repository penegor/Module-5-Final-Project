// https://www.omdbapi.com/?apikey=341f721c&s=

const movieListEl = document.querySelector(".movies__list");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const apiKey = '341f721c';
const loadingMessages = [
  "Grabbing the popcorn...",
  "Calling the Heroes...",
  "Finding the bad guys...",
  "Waiting for the commercials to end..."
];
const minLoadingTime = 2500;
let loadingInterval = null;
let loadingIndex = 0;

searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch(event);
  }
});

function handleSearch(event) {
  event.preventDefault();
  const title = searchInput.value.trim();
  if (!title) {
    return;
  }
  searchMovies(title);
}

function startLoading() {
  loadingIndex = 0;
  movieListEl.innerHTML = `<li class="movie loading">${loadingMessages[loadingIndex]}</li>`;

  loadingInterval = setInterval(() => {
    loadingIndex = (loadingIndex + 1) % loadingMessages.length;
    movieListEl.innerHTML = `<li class="movie loading">${loadingMessages[loadingIndex]}</li>`;
  }, 800);
}

function stopLoading() {
  if (loadingInterval !== null) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
}

async function searchMovies(title) {
  startLoading();
  const loadingStartedAt = Date.now();

  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}`);
    const data = await response.json();
    const movies = Array.isArray(data.Search) ? data.Search.slice(0, 8) : [];

    const elapsed = Date.now() - loadingStartedAt;
    if (elapsed < minLoadingTime) {
      await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsed));
    }

    stopLoading();

    if (movies.length === 0) {
      movieListEl.innerHTML = `<li class="movie empty">No movies found.</li>`;
      return;
    }

    movieListEl.innerHTML = movies.map((movie) => movieHTML(movie)).join("");
  } catch (error) {
    const elapsed = Date.now() - loadingStartedAt;
    if (elapsed < minLoadingTime) {
      await new Promise((resolve) => setTimeout(resolve, minLoadingTime - elapsed));
    }

    stopLoading();
    movieListEl.innerHTML = `<li class="movie empty">Something went wrong. Please try again.</li>`;
  }
}

function movieHTML(movie) {
  const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "assets/film-logo.png";
  const title = movie.Title || "Untitled";

  return `
    <li class="movie">
      <div class="movie__img--wrapper">
        <img src="${poster}" alt="${title}" class="movie__img" />
      </div>
      <p class="movie__title">${title}</p>
    </li>`;
}