
/**
 * @file operatorRoutes.ts
 * @description Rotas de operador para controle de unidades, credenciais e presença.
 *
 * Endpoints principais:
 *   - GET /ops/units: Lista todas as unidades
 *   - GET /ops/units/:block/:unit: Consulta código de uma unidade
 *   - GET /ops/credential: Lista chamada (roll call)
 *   - POST /ops/credential/present: Marca presença
 *   - POST /ops/credential/:attendeeId/link: Vincula unidade a um participante
 *
 * Integra o controller opsController e utiliza autenticação adminAuth.
 */
import { Router } from 'express';
import { opsController } from '../controllers/operatorController';
import { adminAuth } from '../middlewares/adminAuth';


/**
 * Instância do router para rotas de operador.
 */
const router = Router();


/**
 * Middleware de autenticação para todas as rotas de operador.
 */
//router.use(adminAuth);


/**
 * @swagger
 * /operator/units:
 *   get:
 *     tags: [Operador]
 *     summary: Lista todas as unidades (fração e code)
 *     security:
 *       - bearerAdmin: []
 *     responses:
 *       200:
 *         description: Lista de unidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/operator/units', opsController.listUnits);

/**
 * @swagger
 * /operator/units/{block}/{unit}:
 *   get:
 *     tags: [Operador]
 *     summary: Consulta fração e code da unidade
 *     security:
 *       - bearerAdmin: []
 *     parameters:
 *       - in: path
 *         name: block
 *         required: true
 *         schema: { type: string }
 *         example: A
 *       - in: path
 *         name: unit
 *         required: true
 *         schema: { oneOf: [{type: integer}, {type: string}] }
 *         example: 6
 *     responses:
 *       200:
 *         description: Dados da unidade
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 block: { type: string }
 *                 unit: { type: string }
 *                 code: { type: string }
 *                 fraction: { type: number }
 *       404:
 *         description: Unidade não encontrada
 */
router.get('/operator/units/:block/:unit', opsController.getUnitCode);

/**
 * @swagger
 * /operator/roll-call:
 *   get:
 *     tags: [Operador]
 *     summary: Lista de presença atual
 *     security:
 *       - bearerAdmin: []
 *     responses:
 *       200:
 *         description: Lista de attendees (presentes)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/operator/roll-call', opsController.listRollCall);

/**
 * @swagger
 * /operator/roll-call/present:
 *   post:
 *     tags: [Operador]
 *     summary: Marca presença do titular (retorna attendee)
 *     security:
 *       - bearerAdmin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendeeId:
 *                 type: number
 *                 description: ID da unidade
 *     responses:
 *       200:
 *         description: Presença registrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       400:
 *         description: Erro ao marcar presença
 */
router.post('/operator/roll-call/present', opsController.markPresent);

/**
 * @swagger
 * /operator/roll-call/{attendeeId}/link:
 *   post:
 *     tags: [Operador]
 *     summary: Vincula outra unidade ao attendee (procuração/vaga extra)
 *     security:
 *       - bearerAdmin: []
 *     parameters:
 *       - in: path
 *         name: attendeeId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [block, unit, relation]
 *             properties:
 *               block: { type: string, example: "A" }
 *               unit: { oneOf: [{type: integer}, {type: string}], example: 8 }
 *               relation: { type: string, enum: ["procuracao", "vaga_extra", "outra"] }
 *     responses:
 *       200:
 *         description: Unidade vinculada ao attendee
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean }
 *                 totalFraction: { type: number, example: 0.861308 }
 *       400:
 *         description: Erro ao vincular unidade
 */
router.post('/operator/roll-call/:attendeeId/link', opsController.linkUnit);

export default router;
