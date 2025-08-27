
/**
 * @file voteRoutes.ts
 * @description Rotas de votação eletrônica para assembleias condominiais.
 *
 * Endpoints principais:
 *   - POST /vote/access: Solicita acesso à votação
 *   - POST /vote/cast: Registra um voto
 *
 * Integra o controller voteController.
 */
import { Router } from 'express';
import { voteController } from '../controllers/voteController';


/**
 * Instância do router para rotas de votação.
 */
const router = Router();

/**
 * @swagger
 * /vote/access:
 *   post:
 *     tags: [Votação]
 *     summary: Valida o acesso do morador (bloco/unidade/código) e retorna attendeeId
 *     description: |
 *       Marca o acesso do morador no *roll_call.json* (campos `accessedAt` e `accessStatus=accessed`).
 *       Requer que a assembleia esteja com `status=started` e que a presença tenha sido registrada no credenciamento.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - block
 *               - unit
 *               - code
 *             properties:
 *               block:
 *                 type: string
 *                 example: "A"
 *               unit:
 *                 oneOf:
 *                   - type: integer
 *                   - type: string
 *                 example: 6
 *               code:
 *                 type: string
 *                 description: Código de 6 caracteres fornecido no credenciamento
 *                 example: "A5D6XA"
 *     responses:
 *       200:
 *         description: Acesso validado
 *       400:
 *         description: Erro de validação (assembleia não iniciada, dados inválidos, presença não encontrada, etc.)
 */
router.post('/vote/access', voteController.access);

/**
 * @swagger
 * /vote/cast:
 *   post:
 *     tags: [Votação]
 *     summary: Registra o voto do morador para um item
 *     description: |
 *       Grava o voto em `units_votes.json` e atualiza os resultados agregados do item em `assembly-state.json`.
 *       Requer assembleia `started` e item com `status=open`. Impede voto duplicado do mesmo `attendeeId` no mesmo item.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendeeId
 *               - itemOrder
 *               - choice
 *             properties:
 *               attendeeId:
 *                 type: string
 *                 description: Retornado por /vote/access
 *                 example: "k2h1m9x2s5nz7yq3"
 *               itemOrder:
 *                 type: integer
 *                 description: Número de ordem do item em votação
 *                 example: 5
 *               choice:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Voto registrado
 *       400:
 *         description: Erro ao votar (assembleia não iniciada, item fechado, voto duplicado, etc.)
 */
router.post('/vote/cast', voteController.cast);

export default router;
