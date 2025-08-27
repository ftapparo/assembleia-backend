/**
 * @file assemblyApi.ts
 * @description Ponto de entrada principal da API de votação eletrônica para assembleias condominiais.
 * Inicializa o servidor Express, configura middlewares globais, registra rotas e integra o Swagger e WebSocket.
 *
 * Principais responsabilidades:
 * - Carregar variáveis de ambiente
 * - Configurar middlewares de segurança, CORS e JSON
 * - Registrar rotas REST
 * - Integrar documentação Swagger
 * - Inicializar servidor HTTP e Socket.io
 */
import express from 'express';
import cors from 'cors';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import healthRoutes from '../routes/healthRoutes';
import adminRoutes from '../routes/adminRoutes';
import operatorRoutes from '../routes/operatorRoutes';

import { createIO } from '../sockets/io';
import { swaggerSpec } from '../swagger';

/**
 * Inicializa o servidor backend.
 *
 * - Configura middlewares globais (CORS, JSON)
 * - Integra rotas de dispositivos, notificações e saúde
 * - Exibe documentação Swagger
 * - Endpoints de debug para o Swagger
 * - Tratamento de rota não encontrada (404)
 * - Inicia o servidor na porta definida
 */
export async function startServer() {
    const app = express();
    const port = process.env.PORT || 3000;
    const env = process.env.NODE_ENV || 'production';

    /**
     * Middleware de CORS para permitir requisições de qualquer origem e métodos principais.
     */
    app.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
    }));

    /**
     * Middleware para parsear JSON nas requisições.
     */
    app.use(express.json());

    /**
     * Registro das rotas principais da API.
     * - /api/health: Healthcheck
     * - /api/admin: Rotas administrativas
     * - /api/public: Rotas públicas (comentado)
     * - /api/ops: Rotas de operador (comentado)
     * - /api/vote: Rotas de votação (comentado)
     */
    app.use('/api', healthRoutes);
    app.use('/api', adminRoutes);
    // app.use('/api', publicRoutes);
    app.use('/api', operatorRoutes);
    // app.use('/api', voteRoutes);

    /**
     * Rota para servir a documentação Swagger UI.
     */
    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    /**
     * Endpoint para depuração: retorna o objeto swaggerSpec em JSON.
     */
    app.get('/debug-swagger', (_req, res) => {
        res.json(swaggerSpec);
    });

    /**
     * Endpoint para servir o arquivo swagger.json (OpenAPI spec).
     */
    app.get('/apispec_1.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    /**
     * Middleware para tratar rotas não encontradas (404).
     */
    app.use((_req, res) => {
        res.status(404).send();
    });

    /**
     * Cria o servidor HTTP e inicializa o Socket.io para comunicação em tempo real.
     */
    const server = http.createServer(app);
    const { io } = createIO(server);

    /**
     * Inicializa o servidor Express na porta configurada.
     */
    app.listen(port, () => {
        console.log(`[Api] Servidor rodando na porta ${port} - Ambiente: ${env}`);
    });
}

