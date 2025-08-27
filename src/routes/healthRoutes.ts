
/**
 * @file HealthRoutes.ts
 * @description Rotas de verificação de saúde da aplicação (healthcheck).
 * Permite monitorar se a API está ativa e funcional.
 *
 * Endpoint principal:
 *   - GET /api/healthcheck: Retorna status da API e ambiente atual.
 *
 * Integra o controller healthCheck para resposta padronizada.
 */
import express from 'express';
import { healthCheck } from '../controllers/healthController';


/**
 * Instância do router para rotas de healthcheck.
 */
const router = express.Router();

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Verifica se o serviço está ativo
 *     tags: [Healthcheck]
 *     description: Retorna um status de saúde da API
 *     responses:
 *       200:
 *         description: Serviço ativo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/healthcheck', healthCheck);

export default router;
