# assembleia-backend

Backend para sistema de votação eletrônica em assembleias condominiais.

## Descrição
Este projeto é a API backend responsável por gerenciar assembleias, votações, autenticação e operações administrativas para condomínios. Desenvolvido em Node.js com TypeScript, utiliza Express, Prisma (ORM) e PostgreSQL.

## Funcionalidades
- Cadastro e gerenciamento de assembleias
- Registro e autenticação de operadores e administradores
- Votação eletrônica segura
- Controle de quórum
- Logs e auditoria
- Rota de healthcheck (`/health`)

## Tecnologias Utilizadas
- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT, HMAC, criptografia

## Estrutura de Pastas
```
src/
  db/                # Conexão com banco de dados
  middlewares/       # Middlewares de autenticação e segurança
  routes/            # Rotas da API (admin, operador, público, votação, health)
  schemas/           # Schemas de validação
  services/          # Lógica de negócio
  sockets/           # Comunicação em tempo real (WebSocket)
  utils/             # Utilitários diversos
```

## Como rodar o projeto
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` com as variáveis necessárias (exemplo no repositório).
3. Execute as migrations do Prisma:
   ```bash
   npx prisma migrate dev
   ```
4. Inicie o servidor:
   ```bash
   npm run dev
   ```

A API estará disponível em `http://localhost:4000` (ou porta definida no `.env`).

## Endpoints principais
- `GET /health` — Verifica se a API está funcionando
- `POST /api/admin/login` — Login de administrador
- `POST /api/ops/login` — Login de operador
- `GET /api/assembleias` — Listagem de assembleias
- `POST /api/votar` — Realiza uma votação

## Contribuição
Pull requests são bem-vindos! Para sugestões, abra uma issue.

## Licença
MIT
