/**
 * @file server.ts
 * @description Ponto de entrada principal da API de votação eletrônica para assembleias condominiais.
 * Inicializa o servidor Express, configura middlewares globais, registra rotas e integra o WebSocket.
 *
 * Principais responsabilidades:
 * - Carregar variáveis de ambiente
 * - Configurar middlewares de segurança, logging e CORS
 * - Registrar rotas REST
 * - Inicializar servidor HTTP e Socket.io
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import healthRoutes from './routes/healthRoute';
import adminRoutes from './routes/adminRoutes';
import publicRoutes from './routes/publicRoutes';
import opsRoutes from './routes/operatorRoutes';
import voteRoutes from './routes/voteRoutes';

import { createIO } from './sockets/io';

/**
 * Instância principal do Express.
 * Responsável por receber e encaminhar todas as requisições HTTP.
 */
const app = express();

/**
 * Utiliza CORS com as seguintes configurações:
 * - Permite requisições de qualquer origem
 * - Permite os métodos: GET, POST, PUT, DELETE, OPTIONS
 * - Permite cookies e cabeçalhos personalizados
 * - Permite o uso de credenciais
 * - Permite o envio de cookies
 */
/**
 * Middleware de CORS para permitir requisições de qualquer origem e métodos principais.
 */
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));


/**
 * Middleware de segurança HTTP (Helmet).
 * Middleware para parsear JSON.
 * Middleware de logging estruturado (Pino).
 */
app.use(helmet());
app.use(express.json());
app.use(pinoHttp({ logger }));


/**
 * Registro das rotas principais da API.
 * - /api: Rotas públicas
 * - /api/health: Healthcheck
 * - /api/admin: Rotas administrativas
 * - /api/ops: Rotas de operador
 * - /api/vote: Rotas de votação
 */
app.use('/api', publicRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ops', opsRoutes);
app.use('/api/vote', voteRoutes);


/**
 * Cria o servidor HTTP e inicializa o Socket.io para comunicação em tempo real.
 */
const server = http.createServer(app);
const { io } = createIO(server);

/**
 * Porta de escuta definida por variável de ambiente ou padrão 4000.
 * Inicializa o servidor e exibe log informativo ao subir.
 */
const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => {
    logger.info({ PORT }, 'API listening');
});
