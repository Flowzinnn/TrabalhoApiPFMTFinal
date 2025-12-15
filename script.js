/**
 * Buscador de Filmes - OMDB API
 * 
 * Este projeto utiliza conceitos modernos de JavaScript, incluindo:
 * 
 * STREAMS API:
 * - ReadableStream: Para ler dados de forma assíncrona e eficiente
 * - WritableStream: Para processar dados em chunks
 * - TransformStream: Para transformar dados enquanto fluem
 * 
 * Benefícios dos Streams:
 * - Processamento de dados em tempo real sem esperar o download completo
 * - Melhor gerenciamento de memória para grandes volumes de dados
 * - Possibilidade de cancelar operações em andamento
 * - Interface fluida e reativa para o usuário
 * 
 * @author IFMS/TEIXEIRA
 * @version 2.0
 */

// Configuração da API do OMDB
// A API Key é carregada do arquivo .env
let API_KEY = '';
const API_URL = 'https://www.omdbapi.com/';

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

// Função principal para buscar filmes (usando Streams)
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
        // Fazendo requisição com suporte a streaming
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}`);
        
        // Verificar se a resposta tem body com stream
        if (!response.body) {
            throw new Error('ReadableStream não suportado neste navegador');
        }

        // Processar resposta usando Stream API
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let receivedData = '';

        // Ler dados do stream progressivamente
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            // Decodificar chunk recebido
            receivedData += decoder.decode(value, { stream: true });
        }

        // Parsear JSON completo
        const data = JSON.parse(receivedData);
        
        hideLoading();

        if (data.Response === 'True') {
            // Usar stream para processar filmes de forma assíncrona
            await displayMoviesWithStream(data.Search);
        } else {
            showError(data.Error || 'Nenhum filme encontrado. Tente outra busca.');
        }
    } catch (error) {
        hideLoading();
        showError('Erro ao buscar filmes. Verifique sua conexão e tente novamente.');
        console.error('Erro:', error);
    }
}

// Função para exibir os filmes usando Stream API
async function displayMoviesWithStream(movies) {
    resultsDiv.innerHTML = '';

    // Verifica se há resultados
    if (!movies || movies.length === 0) {
        showError('Nenhum filme encontrado. Tente outra busca.');
        return;
    }

    // Criar um ReadableStream customizado para processar filmes
    const movieStream = new ReadableStream({
        start(controller) {
            movies.forEach(movie => controller.enqueue(movie));
            controller.close();
        }
    });

    // Processar stream de filmes
    const reader = movieStream.getReader();
    
    while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // Criar e adicionar card com pequeno delay para efeito visual
        const movieCard = createMovieCard(value);
        resultsDiv.appendChild(movieCard);
        
        // Pequeno delay para animação suave (opcional)
        await new Promise(resolve => setTimeout(resolve, 50));
    }

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

// Função para mostrar detalhes do filme (com Stream)
async function showMovieDetails(imdbID) {
    try {
        showLoading();
        
        // Usar fetch com streaming
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
        
        if (!response.body) {
            // Fallback para navegadores sem suporte a streams
            const movie = await response.json();
            hideLoading();
            if (movie.Response === 'True') {
                openModal(movie);
            } else {
                showError('Erro ao carregar detalhes do filme.');
            }
            return;
        }

        // Processar resposta usando Stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let receivedData = '';

        // Ler stream de dados
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            receivedData += decoder.decode(value, { stream: true });
        }

        const movie = JSON.parse(receivedData);
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

/**
 * TransformStream customizado para processar dados de filmes
 * Adiciona metadados e validações aos dados recebidos
 */
class MovieDataTransformer {
    constructor() {
        this.transformStream = new TransformStream({
            transform(chunk, controller) {
                try {
                    // Validar e enriquecer dados do filme
                    const enrichedMovie = {
                        ...chunk,
                        processedAt: new Date().toISOString(),
                        hasValidPoster: chunk.Poster && chunk.Poster !== 'N/A',
                        searchRelevance: Math.random() // Exemplo de score
                    };
                    controller.enqueue(enrichedMovie);
                } catch (error) {
                    console.error('Erro ao processar filme:', error);
                }
            }
        });
    }

    getStream() {
        return this.transformStream;
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
