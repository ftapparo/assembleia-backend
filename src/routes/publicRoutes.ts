
/**
 * @file publicRoutes.ts
 * @description Rotas públicas para consulta de status da assembleia.
 *
 * Endpoint principal:
 *   - GET /public/status: Consulta status público da assembleia
 *
 * Integra o controller publicController.
 */
import { Router } from 'express';
import { publicController } from '../controllers/publicController';


/**
 * Instância do router para rotas públicas.
 */
const router = Router();

/**
 * @swagger
 * /public/status:
 *   get:
 *     tags: [Público]
 *     summary: Status da assembleia e (se houver) o item em votação com resultado parcial
 *     description: Pode ser consultado pelo front com polling (ex. TanStack Query a cada 5s).
 *     responses:
 *       200:
 *         description: Estado atual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order_no:
 *                   type: integer
 *                   example: 5
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                   example: "open"
 *                 vote_type:
 *                   type: string
 *                   example: "direto"
 *                 compute:
 *                   type: string
 *                   example: "fracao"
 *                 votingStartedAt:
 *                   type: string
 *                   format: date-time
 *                 results:
 *                   type: object
 *                   properties:
 *                     totals:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           count:
 *                             type: integer
 *                             example: 42
 *                           weight:
 *                             type: number
 *                             example: 12.345
 *                     totalCount:
 *                       type: integer
 *                       example: 100
 *                     totalWeight:
 *                       type: number
 *                       example: 35.789
 */
router.get('/public/status', publicController.status);

export default router;
