/**
 * Módulo de Configuração
 * 
 * Este arquivo é responsável por carregar as variáveis de ambiente
 * do arquivo .env de forma segura para uso no navegador.
 * 
 * @module config
 */

// Função para carregar variáveis de ambiente do arquivo .env
async function loadEnvVariables() {
    try {
        // Faz requisição para ler o arquivo .env
        const response = await fetch('.env');
        const text = await response.text();
        
        const env = {};
        
        // Processa cada linha do arquivo
        text.split('\n').forEach(line => {
            // Ignorar comentários e linhas vazias
            if (line.trim() && !line.trim().startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                env[key.trim()] = value;
            }
        });
        
        return env;
    } catch (error) {
        console.error('Erro ao carregar arquivo .env:', error);
        console.warn('Certifique-se de que o arquivo .env existe na raiz do projeto.');
        return null;
    }
}

// Exportar função para uso no script principal
window.loadEnvVariables = loadEnvVariables;
