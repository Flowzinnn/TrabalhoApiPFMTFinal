// Configuração da API do OMDB
// A API Key é carregada do arquivo .env
let API_KEY = '';
const API_URL = '';

// Carregar API Key do arquivo .env
async function initializeApp() {
    const env = await loadEnvVariables();
    if (env && env.OMDB_API_KEY) {
        API_KEY = env.OMDB_API_KEY;
        console.log('API Key carregada com sucesso!');
    } else {
        showError('Erro ao carregar a API Key. Verifique o arquivo .env');
        console.error('Não foi possível carregar a API Key do arquivo .env');
    }
}

// Inicializar o app ao carregar a página
initializeApp();

// Elementos do DOM
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const movieModal = document.getElementById('movieModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');

// Event Listeners
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

// Event Listeners do Modal
closeModalBtn.addEventListener('click', closeModal);
movieModal.querySelector('.modal-overlay').addEventListener('click', closeModal);

// Fechar modal com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !movieModal.classList.contains('hidden')) {
        closeModal();
    }
});

// Função principal para buscar filmes
async function searchMovies() {
    const searchTerm = searchInput.value.trim();
    
    // Validação do campo de busca
    if (!searchTerm) {
        showError('Por favor, digite o nome de um filme.');
        return;
    }

    // Validação de tamanho mínimo
    if (searchTerm.length < 2) {
        showError('Digite pelo menos 2 caracteres para buscar.');
        return;
    }

    // Validação da API Key
    if (!API_KEY) {
        showError('API Key não configurada. Verifique o arquivo .env');
        return;
    }

    // Limpar resultados anteriores
    clearResults();
    showLoading();

    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();

        hideLoading();

        if (data.Response === 'True') {
            displayMovies(data.Search);
        } else {
            showError(data.Error || 'Nenhum filme encontrado. Tente outra busca.');
        }
    } catch (error) {
        hideLoading();
        showError('Erro ao buscar filmes. Verifique sua conexão e tente novamente.');
        console.error('Erro:', error);
    }
}

// Função para exibir os filmes
function displayMovies(movies) {
    resultsDiv.innerHTML = '';

    // Verifica se há resultados
    if (!movies || movies.length === 0) {
        showError('Nenhum filme encontrado. Tente outra busca.');
        return;
    }

    // Adiciona cada filme à grade
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        resultsDiv.appendChild(movieCard);
    });

    // Rola suavemente até os resultados
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Função para criar um card de filme
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => showMovieDetails(movie.imdbID);

    const poster = movie.Poster !== 'N/A' 
        ? `<img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster">`
        : `<div class="movie-poster no-poster">🎬</div>`;

    card.innerHTML = `
        ${poster}
        <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <p class="movie-year">${movie.Year}</p>
            <span class="movie-type">${movie.Type}</span>
        </div>
    `;

    return card;
}

// Função para mostrar detalhes do filme
async function showMovieDetails(imdbID) {
    try {
        showLoading();
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
        const movie = await response.json();
        hideLoading();

        if (movie.Response === 'True') {
            openModal(movie);
        } else {
            showError('Erro ao carregar detalhes do filme.');
        }
    } catch (error) {
        hideLoading();
        showError('Erro ao buscar detalhes do filme.');
        console.error('Erro:', error);
    }
}

// Função para abrir o modal com os detalhes
function openModal(movie) {
    const posterHTML = movie.Poster !== 'N/A'
        ? `<img src="${movie.Poster}" alt="${movie.Title}" class="modal-poster">`
        : `<div class="modal-poster no-poster-modal">🎬</div>`;

    // Gerar estrelas baseado no rating
    const rating = parseFloat(movie.imdbRating);
    const stars = generateStars(rating);

    // Processar ratings de outras fontes
    const ratingsHTML = movie.Ratings && movie.Ratings.length > 0
        ? `<div class="all-ratings">
            ${movie.Ratings.map(r => `
                <div class="rating-item">
                    <div class="rating-item-source">${r.Source}</div>
                    <div class="rating-item-value">${r.Value}</div>
                </div>
            `).join('')}
           </div>`
        : '';

    modalBody.innerHTML = `
        <div class="modal-header-section">
            <h2 class="modal-movie-title">${movie.Title}</h2>
            <div class="modal-meta">
                <span class="modal-meta-item">📅 ${movie.Year}</span>
                <span class="modal-meta-item">⏱️ ${movie.Runtime}</span>
                <span class="modal-meta-item">🎭 ${movie.Rated}</span>
                <span class="modal-meta-item">🎬 ${movie.Type}</span>
            </div>
        </div>
        
        <div class="modal-content-section">
            <div class="modal-poster-container">
                ${posterHTML}
            </div>
            
            <div class="modal-details">
                ${movie.imdbRating !== 'N/A' ? `
                <div class="rating-section">
                    <div class="rating-stars">${stars}</div>
                    <div class="rating-value">${movie.imdbRating}/10</div>
                    <div class="rating-source">IMDb (${movie.imdbVotes} votos)</div>
                    ${ratingsHTML}
                </div>
                ` : ''}
                
                <div class="plot-section">
                    <div class="detail-label">📖 Sinopse</div>
                    <div class="detail-value">${movie.Plot}</div>
                </div>
                
                ${movie.Genre !== 'N/A' ? `
                <div class="detail-item">
                    <div class="detail-label">🎭 Gênero</div>
                    <div class="detail-value">${movie.Genre}</div>
                </div>
                ` : ''}
                
                ${movie.Director !== 'N/A' ? `
                <div class="detail-item">
                    <div class="detail-label">🎬 Diretor</div>
                    <div class="detail-value">${movie.Director}</div>
                </div>
                ` : ''}
                
                ${movie.Writer !== 'N/A' ? `
                <div class="detail-item">
                    <div class="detail-label">✍️ Roteirista</div>
                    <div class="detail-value">${movie.Writer}</div>
                </div>
                ` : ''}
                
                ${movie.Actors !== 'N/A' ? `
                <div class="detail-item">
                    <div class="detail-label">🌟 Elenco</div>
                    <div class="detail-value">${movie.Actors}</div>
                </div>
                ` : ''}
                
                ${movie.Language !== 'N/A' ? `
                <div class="detail-item">
                    <div class="detail-label">🗣️ Idioma</div>
                    <div class="detail-value">${movie.Language}</div>
                </div>
                ` : ''}
                
                ${movie.Country !== 'N/A' ? `
                <div class="detail-item">
                    <div class="detail-label">🌍 País</div>
                    <div class="detail-value">${movie.Country}</div>
                </div>
                ` : ''}
                
                ${movie.Awards !== 'N/A' ? `
                <div class="awards-section">
                    <div class="detail-label">🏆 Prêmios</div>
                    <div class="detail-value">${movie.Awards}</div>
                </div>
                ` : ''}
                
                ${movie.BoxOffice !== 'N/A' ? `
                <div class="detail-item">
                    <div class="detail-label">💰 Bilheteria</div>
                    <div class="detail-value">${movie.BoxOffice}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    movieModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevenir scroll do body
}

// Função para gerar estrelas baseado no rating
function generateStars(rating) {
    const maxStars = 5;
    const normalizedRating = rating / 2; // Converter de 10 para 5
    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    stars += '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '✨';
    stars += '☆'.repeat(emptyStars);

    return stars;
}

// Função para fechar o modal
function closeModal() {
    movieModal.classList.add('hidden');
    document.body.style.overflow = ''; // Restaurar scroll do body
    modalBody.innerHTML = ''; // Limpar conteúdo do modal
}

// Funções auxiliares
function showLoading() {
    loadingDiv.classList.remove('hidden');
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    // Auto-ocultar após 5 segundos
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

function clearResults() {
    resultsDiv.innerHTML = '';
    errorDiv.classList.add('hidden');
}
