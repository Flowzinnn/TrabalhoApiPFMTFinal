# 🎬 Buscador de Filmes - OMDB API

Um aplicativo web simples e elegante para buscar informações sobre filmes usando a API do OMDB.

## 📋 Descrição

Este projeto permite que os usuários pesquisem filmes, séries e episódios através da API do OMDB (Open Movie Database). A interface é responsiva e moderna, exibindo os resultados em cards visuais com informações básicas dos filmes.

## ✨ Funcionalidades

- 🔍 Busca de filmes por nome
- 🎨 Interface moderna e responsiva
- 📱 Design adaptável para mobile
- 🖼️ Exibição de pôsteres dos filmes
- ℹ️ Visualização de detalhes ao clicar no filme
- ⚡ Feedback visual durante o carregamento
- ❌ Tratamento de erros amigável

## 🚀 Como Usar

### 1. Obter uma API Key

Antes de usar o aplicativo, você precisa de uma chave de API gratuita do OMDB:

1. Acesse: http://www.omdbapi.com/apikey.aspx
2. Escolha a opção "FREE" (1,000 requisições por dia)
3. Preencha seu email
4. Verifique seu email e ative a chave

### 2. Configurar o Projeto

1. Clone este repositório:
   ```bash
   git clone https://github.com/Flowzinnn/TrabalhoApiPFMTFinal.git
   cd TrabalhoApiPFMTFinal
   ```

2. Crie um arquivo `.env` na raiz do projeto (use o `.env.example` como base):
   ```bash
   cp .env.example .env
   ```

3. Abra o arquivo `.env` e adicione sua API Key:
   ```
   OMDB_API_KEY=sua_chave_aqui
   ```

### 3. Executar o Projeto

Simplesmente abra o arquivo `index.html` no seu navegador preferido.

**Ou use um servidor local:**

Com Python:
```bash
python -m http.server 8000
```

Com Node.js (http-server):
```bash
npx http-server
```

Depois acesse: `http://localhost:8000`

**⚠️ Importante:** Por questões de segurança com CORS, é recomendado usar um servidor local para desenvolvimento.

## 📁 Estrutura de Arquivos

```
TrabalhoApiPFMTFinal/
│
├── index.html       # Estrutura HTML da aplicação
├── styles.css       # Estilos e design responsivo
├── script.js        # Lógica JavaScript e consumo da API
├── config.js        # Carregamento de variáveis de ambiente
├── .env             # Variáveis de ambiente (NÃO commitado no Git)
├── .env.example     # Exemplo de arquivo .env
├── .gitignore       # Arquivos ignorados pelo Git
└── README.md        # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura da página
- **CSS3** - Estilização e layout responsivo
- **JavaScript (ES6+)** - Lógica e consumo da API
- **OMDB API** - Base de dados de filmes
- **Variáveis de Ambiente (.env)** - Gerenciamento seguro de credenciais

## 📝 Exemplo de Uso

1. Digite o nome de um filme na caixa de busca (ex: "Matrix")
2. Clique no botão "Buscar" ou pressione Enter
3. Veja os resultados exibidos em cards
4. Clique em qualquer card para ver mais detalhes do filme

## 🎯 Melhorias Futuras

- [ ] Adicionar paginação para mais resultados
- [ ] Criar sistema de favoritos com localStorage
- [ ] Implementar filtros por ano e tipo
- [ ] Adicionar histórico de buscas
- [ ] Melhorar a visualização de detalhes
- [ ] Adicionar modo escuro/claro

## 📄 Licença

Este projeto é livre para uso educacional e pessoal.

---

**⚠️ Segurança:** 
- Nunca compartilhe seu arquivo `.env` ou sua API Key publicamente
- O arquivo `.env` está incluído no `.gitignore` para não ser enviado ao GitHub
- Use sempre o arquivo `.env.example` como referência para outros desenvolvedores

---

**👨‍💻 Autor**

Projeto desenvolvido para fins acadêmicos - IFMS/TEIXEIRA
