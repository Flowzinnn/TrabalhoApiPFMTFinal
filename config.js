// Configuração da API
// Este arquivo carrega as variáveis de ambiente do arquivo .env

// Função para carregar variáveis de ambiente do arquivo .env
async function loadEnvVariables() {
    try {
        const response = await fetch('.env');
        const text = await response.text();
        
        const env = {};
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
        return null;
    }
}

// Exportar função para uso no script principal
window.loadEnvVariables = loadEnvVariables;
