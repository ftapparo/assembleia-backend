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


## Endpoints da API

### Healthcheck
- `GET /api/healthcheck` — Verifica se a API está funcionando

### Rotas Públicas
- `GET /api/public/status` — Consulta status público da assembleia

### Rotas de Administração
- `GET /api/admin/assembly` — Consulta dados da assembleia
- `POST /api/admin/assembly/start` — Inicia assembleia
- `POST /api/admin/assembly/close` — Encerra assembleia
- `POST /api/admin/items/:orderNo/open` — Abre item da assembleia
- `POST /api/admin/items/:orderNo/close` — Fecha item da assembleia
- `POST /api/admin/items/:orderNo/void` — Anula item da assembleia

### Rotas de Operador
- `GET /api/operator/units` — Lista todas as unidades
- `GET /api/operator/units/:block/:unit` — Consulta código de uma unidade
- `GET /api/operator/roll-call` — Lista presença atual (roll call)
- `POST /api/operator/roll-call/present` — Marca presença de participante
- `POST /api/operator/roll-call/:attendeeId/link` — Vincula unidade a participante

### Rotas de Votação
- `POST /api/vote/access` — Solicita acesso à votação
- `POST /api/vote/cast` — Registra um voto

## Contribuição
Pull requests são bem-vindos! Para sugestões, abra uma issue.

## Licença
MIT


quorum_type: simples ou qualificado
quorum_value: percentual quando qualificado (ex.: 66.67)
compute: simples (1 por voto) ou fracao (m² / fração ideal)
vote_type: direto (SIM/NÃO/ABSTENÇÃO)
multiple: sempre false (POC enxuta)
permanent: true apenas no item 9 (pode virar assembleia permanente até atingir