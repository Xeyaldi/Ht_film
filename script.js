const API_KEY = 'SƏNİN_API_AÇARIN';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

let currentLang = 'az-AZ';

// Sayt açılanda bunları yüklə
document.addEventListener('DOMContentLoaded', () => {
    getMovies('/movie/popular');
    getGenres();
});

async function getMovies(path, query = '') {
    const url = `${BASE_URL}${path}?api_key=${API_KEY}&language=${currentLang}${query}`;
    const res = await fetch(url);
    const data = await res.json();
    showMovies(data.results);
}

function showMovies(movies) {
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = '';

    movies.forEach(movie => {
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card');
        movieEl.innerHTML = `
            <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/500x750'}" alt="${movie.title}">
            <h3>${movie.title}</h3>
        `;
        movieEl.onclick = () => showMovieDetails(movie.id);
        grid.appendChild(movieEl);
    });
}

// Axtarış funksiyası
async function searchMovies() {
    const searchTerm = document.getElementById('search-input').value;
    if(searchTerm) {
        getMovies('/search/movie', `&query=${searchTerm}`);
        document.getElementById('section-title').innerText = `"${searchTerm}" üzrə nəticələr`;
    }
}

// Film detallarını göstərən Modal
async function showMovieDetails(id) {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=${currentLang}`);
    const m = await res.json();
    
    const modal = document.getElementById('movie-modal');
    const modalData = document.getElementById('modal-data');
    
    modalData.innerHTML = `
        <img src="${IMG_URL + m.poster_path}" style="width: 300px; border-radius: 10px;">
        <div class="info">
            <h1>${m.title}</h1>
            <p style="color: #f5c518; font-weight: bold;">⭐ ${m.vote_average} / 10</p>
            <p style="font-size: 18px; line-height: 1.6;">${m.overview}</p>
            <p><strong>Tarix:</strong> ${m.release_date}</p>
            <button class="genre-tag" onclick="window.open('https://www.youtube.com/results?search_query=${m.title}+trailer')">YouTube Trailer</button>
        </div>
    `;
    modal.style.display = "block";
}

// Janrları çək
async function getGenres() {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=${currentLang}`);
    const data = await res.json();
    const genreContainer = document.getElementById('genre-tags');
    data.genres.forEach(genre => {
        const tag = document.createElement('div');
        tag.classList.add('genre-tag');
        tag.innerText = genre.name;
        tag.onclick = () => getMovies('/discover/movie', `&with_genres=${genre.id}`);
        genreContainer.appendChild(tag);
    });
}

// Modal bağlama
document.querySelector('.close').onclick = () => document.getElementById('movie-modal').style.display = "none";
window.onclick = (event) => { if(event.target == document.getElementById('movie-modal')) document.getElementById('movie-modal').style.display = "none"; }
