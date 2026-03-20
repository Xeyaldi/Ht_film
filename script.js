// Geliştirici Konfiqurasiyası
const CONFIG = {
    API_KEY: 'YOUR_TMDB_API_KEY', // TMDB API Key-i bura yerləşdir
    BASE_URL: 'https://api.themoviedb.org/3',
    IMG_URL_W500: 'https://image.tmdb.org/t/p/w500',
    IMG_URL_ORIG: 'https://image.tmdb.org/t/p/original'
};

// Saytın Vəziyyəti (State Management)
const state = {
    currentLang: localStorage.getItem('lang') || 'az-AZ',
    currentPage: 1,
    currentEndpoint: '/movie/popular'
};

// Sayt açılanda bunları yüklə
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    renderHeader(); // Header komponentini yüklə
    updateActiveLangDisplay(); // Aktiv dili göstər
    fetchMovies(state.currentEndpoint); // Filmləri yüklə
    setupEventListeners(); // Düymə dinləyicilərini qur
}

// Komponentlər
// -------------------------------------------------------------------

// Header Komponenti (Dillər və Ayarlar - Sol Üst)
function renderHeader() {
    const header = document.getElementById('header-component');
    header.innerHTML = `
        <div class="dropdown">
            <button class="control-btn" id="active-lang-btn">🇦🇿 AZ</button>
            <div class="dropdown-content">
                <a href="#" data-lang="az">🇦🇿 AZ</a>
                <a href="#" data-lang="tr">🇹🇷 TR</a>
                <a href="#" data-lang="en">🇺🇸 EN</a>
            </div>
        </div>
        <button id="theme-toggle" class="control-btn"><i class="fas fa-moon"></i> Theme</button>
    `;
    
    // Dil dəyişmə dinləyicisi
    document.querySelectorAll('.dropdown-content a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const langCode = e.target.closest('a').dataset.lang;
            changeLanguage(langCode);
        });
    });

    // Mövzu dəyişmə dinləyicisi
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

// Əsas Funksiyalar (Logic)
// -------------------------------------------------------------------

async function fetchMovies(endpoint, page = 1, append = false) {
    const grid = document.getElementById('movie-grid');
    if (!append) grid.innerHTML = '<div class="skeleton"></div>'.repeat(8); // Skeleton Loading

    const url = `${CONFIG.BASE_URL}${endpoint}?api_key=${CONFIG.API_KEY}&language=${state.currentLang}&page=${page}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        renderMovieCards(data.results, append);
    } catch (err) {
        grid.innerHTML = `<p class="error">Xəta baş verdi. Bəlkə API xətası var?</p>`;
    }
}

function renderMovieCards(movies, append) {
    const grid = document.getElementById('movie-grid');
    if (!append) grid.innerHTML = '';

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.innerHTML = `
            <img src="${movie.poster_path ? CONFIG.IMG_URL_W500 + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Poster'}" alt="${movie.title}">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-rating">
                    <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)} / 10
                </div>
            </div>
        `;
        card.onclick = () => openMovieModal(movie.id);
        grid.appendChild(card);
    });
}

// Modal (Film Detalları - Glassmorphism)
async function openMovieModal(id) {
    const res = await fetch(`${CONFIG.BASE_URL}/movie/${id}?api_key=${CONFIG.API_KEY}&language=${state.currentLang}`);
    const m = await res.json();
    
    const modal = document.getElementById('movie-modal');
    const modalData = document.getElementById('modal-details');
    
    const backdrop = m.backdrop_path ? CONFIG.IMG_URL_ORIG + m.backdrop_path : '';

    modalData.innerHTML = `
        <span class="close-modal">&times;</span>
        <div style="background-image: url('${backdrop}'); background-size: cover; position:absolute; top:0; left:0; width:100%; height:100%; border-radius:25px; opacity: 0.1; z-index: -1;"></div>
        <div style="display:flex; gap:30px; flex-wrap:wrap">
            <img src="${CONFIG.IMG_URL_W500 + m.poster_path}" style="width:300px; border-radius:20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="flex:1; min-width:300px">
                <h1 style="font-size:36px; margin-top:0">${m.title}</h1>
                <p style="color:var(--text-dim); font-size:18px; line-height:1.8">${m.overview}</p>
                <div style="margin-top:30px; display:flex; gap:15px; flex-wrap:wrap">
                    <button class="control-btn" onclick="window.open('https://www.youtube.com/results?search_query=${m.title}+trailer')">
                        <i class="fab fa-youtube" style="color:#ff0000"></i> Trailer
                    </button>
                    <span class="control-btn">⭐ ${m.vote_average.toFixed(1)}</span>
                    <span class="control-btn">📅 ${m.release_date.split('-')[0]}</span>
                </div>
            </div>
        </div>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Səhifəni dondur
}

// Köməkçi Funksiyalar
// -------------------------------------------------------------------

function changeLanguage(langCode) {
    state.currentLang = (langCode === 'az') ? 'az-AZ' : (langCode === 'tr' ? 'tr-TR' : 'en-US');
    localStorage.setItem('lang', state.currentLang);
    initApp(); // Saytı yenidən yüklə (Dili dəyişmək üçün)
}

function updateActiveLangDisplay() {
    const flags = { 'az-AZ': '🇦🇿 AZ', 'tr-TR': '🇹🇷 TR', 'en-US': '🇺🇸 EN' };
    const btn = document.getElementById('active-lang-btn');
    if(btn) btn.innerText = flags[state.currentLang] || '🇦🇿 AZ';
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.querySelector('#theme-toggle i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

function setupEventListeners() {
    // Modal bağlama
    document.querySelectorAll('.close-modal').forEach(el => {
        el.onclick = () => {
            document.getElementById('movie-modal').style.display = "none";
            document.body.style.overflow = "auto";
        };
    });

    // Daha Çox Yüklə Düyməsi
    document.getElementById('load-more-btn').onclick = () => {
        state.currentPage++;
        fetchMovies(state.currentEndpoint, state.currentPage, true);
    };
}
