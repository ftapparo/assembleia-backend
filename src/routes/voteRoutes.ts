
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
 *     summary: Valida o acesso do morador (bloco/unidade/PIN) e retorna o attendeeId
 *     description: |
 *       Marca o acesso do morador no *roll_call.json* (`accessedAt` e `accessStatus=accessed`).
 *       Requer que a assembleia esteja com `status=started` e que a presença já tenha sido registrada no credenciamento.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [block, unit, pin]
 *             properties:
 *               block:
 *                 type: string
 *                 example: "A"
 *               unit:
 *                 oneOf:
 *                   - type: integer
 *                   - type: string
 *                 example: 124
 *               pin:
 *                 type: string
 *                 description: Código (PIN) de 6 caracteres fornecido no credenciamento
 *                 example: "A5D6XA"
 *     responses:
 *       200:
 *         description: Acesso validado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendeeId:
 *                   type: string
 *                   example: "att_48sy0fe32vf2kxk0un84v"
 *                 block:
 *                   type: string
 *                   example: "A"
 *                 unit:
 *                   oneOf:
 *                     - type: integer
 *                     - type: string
 *                   example: 124
 *                 accessStatus:
 *                   type: string
 *                   enum: [accessed]
 *                   example: "accessed"
 *                 fraction:
 *                   type: number
 *                   description: Fração da unidade principal usada para votos por fração ideal
 *                   example: 0.212253
 *                 linked_units:
 *                   type: array
 *                   description: Unidades vinculadas (procuração/vaga extra) já associadas a este attendee
 *                   items:
 *                     type: object
 *                     properties:
 *                       block:
 *                         type: string
 *                         example: "A"
 *                       unit:
 *                         oneOf:
 *                           - type: integer
 *                           - type: string
 *                         example: 126
 *                       fraction:
 *                         type: number
 *                         example: 0.198745
 *       400:
 *         description: Erro de validação (assembleia não iniciada, dados inválidos, presença não encontrada, PIN incorreto, etc.)
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
 *         description: Erro ao votar (assembleia encerrada, item fechado, voto duplicado, etc.)
 */
router.post('/vote/cast', voteController.cast);

export default router;
