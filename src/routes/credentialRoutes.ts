/**
 * @file credentialRoutes.ts
 * @description Rotas de credenciamento, presençae e controle de unidades.
 *
 * Endpoints:
 *   - GET  /credential/units/list        → Lista todas as unidades
 *   - GET  /credential/lookup            → Consulta fração e PIN da unidade (via query: block, unit)
 *   - GET  /credential/list              → Lista de presença (roll call) atual
 *   - POST /credential/present           → Marca presença do titular (body: { block, unit })
 *   - POST /credential/link              → Vincula outra unidade ao attendee (body: { attendeeId, block, unit, relation? })
 */
import { Router } from 'express';
import { credentialController } from '../controllers/credentialController';
import { adminAuth } from '../middlewares/adminAuth';

const router = Router();

// Se desejar autenticação, descomente
// router.use(adminAuth);

/**
 * @swagger
 * tags:
 *   - name: Credencial
 *     description: Operações de operador para credenciamento e vínculos
 */

/**
 * @swagger
 * /credential/units/list:
 *   get:
 *     tags: [Credencial]
 *     summary: Lista todas as unidades (com fração e pin)
 *     security:
 *       - bearerAdmin: []
 *     responses:
 *       200:
 *         description: Lista de unidades carregadas do arquivo base
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:        { type: integer, example: 1 }
 *                   unit:      { oneOf: [{type: integer}, {type: string}], example: 6 }
 *                   block:     { type: string, example: "A" }
 *                   fraction:  { type: number, example: 0.300133 }
 *                   pin:      { type: string, example: "D56S9C" }
 */
router.get('/credential/units/list', credentialController.listUnits);

/**
 * @swagger
 * /credential/unit:
 *   get:
 *     tags: [Credencial]
 *     summary: Consulta dados da unidade (fração, pin, presença e vinculações)
 *     security:
 *       - bearerAdmin: []
 *     parameters:
 *       - in: query
 *         name: block
 *         required: true
 *         schema: { type: string }
 *         example: A
 *       - in: query
 *         name: unit
 *         required: true
 *         schema: { oneOf: [{type: integer}, {type: string}] }
 *         example: 6
 *     responses:
 *       200:
 *         description: Dados da  unidades carregadas do arquivo base
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:        { type: integer, example: 1 }
 *                   unit:      { oneOf: [{type: integer}, {type: string}], example: 6 }
 *                   block:     { type: string, example: "A" }
 *                   fraction:  { type: number, example: 0.300133 }
 *                   pin:      { type: string, example: "D56S9C" }
 */
router.get('/credential/unit', credentialController.getUnitPIN);

/**
 * @swagger
 * /credential/lookup:
 *   get:
 *     tags: [Credencial]
 *     summary: Consulta dados da prsença registrada.
 *     security:
 *       - bearerAdmin: []
 *     parameters:
 *       - in: query
 *         name: block
 *         required: true
 *         schema: { type: string }
 *         example: A
 *       - in: query
 *         name: unit
 *         required: true
 *         schema: { oneOf: [{type: integer}, {type: string}] }
 *         example: 6
 *     responses:
 *       200:
 *         description: Dados da unidade e status atual no roll call (se houver)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendeeId: { type: string, nullable: true, example: "att_abc123" }
 *                 block:      { type: string, example: "A" }
 *                 unit:       { oneOf: [{type: integer}, {type: string}], example: 6 }
 *                 fraction:   { type: number, example: 0.300133 }
 *                 pin:       { type: string, example: "D56S9C" }
 *                 present:    { type: boolean, example: false }
 *                 accessStatus:
 *                   type: string
 *                   enum: [pending, accessed]
 *                   example: pending
 *                 linked_units:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       block:    { type: string, example: "A" }
 *                       unit:     { oneOf: [{type: integer}, {type: string}], example: 8 }
 *                       fraction: { type: number, example: 0.280000 }
 *                       pin:     { type: string, example: "7H9K3P" }
 *                       name:  { type: string, nullable: true }
 *                       notes: { type: string, nullable: true }
 *       404:
 *         description: Unidade não encontrada
 */
router.get('/credential/lookup', credentialController.getLookup);

/**
 * @swagger
 * /credential/list:
 *   get:
 *     tags: [Credencial]
 *     summary: Lista de presença atual (roll call)
 *     security:
 *       - bearerAdmin: []
 *     responses:
 *       200:
 *         description: Participantes presentes e suas unidades vinculadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 header:
 *                   type: object
 *                   properties:
 *                     assemblyId: { type: string, example: "nova-residence-2025-08-28" }
 *                     status:     { type: string, enum: [idle, started, closed], example: "started" }
 *                     openedAt:   { type: string, format: date-time, nullable: true }
 *                     closedAt:   { type: string, format: date-time, nullable: true }
 *                 attendees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attendeeId:    { type: string, example: "att_abc123" }
 *                       block:         { type: string, example: "A" }
 *                       unit:          { oneOf: [{type: integer}, {type: string}], example: 6 }
 *                       present:       { type: boolean, example: true }
 *                       pin:          { type: string, example: "D56S9C" }
 *                       fraction:      { type: number, example: 0.300133 }
 *                       accessStatus:  { type: string, enum: [pending, accessed], example: "accessed" }
 *                       accessedAt:    { type: string, format: date-time, nullable: true }
 *                       linked_units:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             block:    { type: string, example: "A" }
 *                             unit:     { oneOf: [{type: integer}, {type: string}], example: 8 }
 *                             fraction: { type: number, example: 0.280000 }
 *                             pin:     { type: string, example: "7H9K3P" }
 */
router.get('/credential/list', credentialController.listRollCall);

/**
 * @swagger
 * /credential/present:
 *   post:
 *     tags: [Credencial]
 *     summary: Marca presença do titular (gera/retorna attendeeId e pin)
 *     security:
 *       - bearerAdmin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [block, unit]
 *             properties:
 *               block: { type: string, example: "A" }
 *               unit:  { oneOf: [{type: integer}, {type: string}], example: 6 }
 *     responses:
 *       200:
 *         description: Presença registrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendeeId: { type: string, example: "att_abc123" }
 *                 block:      { type: string, example: "A" }
 *                 unit:       { oneOf: [{type: integer}, {type: string}], example: 6 }
 *                 pin:       { type: string, example: "D56S9C" }
 *                 present:    { type: boolean, example: true }
 *                 fraction:   { type: number, example: 0.300133 }
 *                 linked_units:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       block:    { type: string, example: "A" }
 *                       unit:     { oneOf: [{type: integer}, {type: string}], example: 8 }
 *                       fraction: { type: number, example: 0.280000 }
 *                       pin:     { type: string, example: "7H9K3P" }
 *       400:
 *         description: Erro ao marcar presença
 */
router.post('/credential/present', credentialController.markPresent);

/**
 * @swagger
 * /credential/link:
 *   post:
 *     tags: [Credencial]
 *     summary: Vincula outra unidade ao attendee (procuração / vaga extra)
 *     security:
 *       - bearerAdmin: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [attendeeId, block, unit]
 *             properties:
 *               attendeeId: { type: string, example: "att_abc123" }
 *               block:      { type: string, example: "A" }
 *               unit:       { oneOf: [{type: integer}, {type: string}], example: 8 }
 *               relation:
 *                 type: string
 *                 description: Tipo de vínculo
 *                 enum: [procuracao, vaga_extra, outra]
 *                 example: procuracao
 *     responses:
 *       200:
 *         description: Unidade vinculada ao attendee
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendeeId: { type: string, example: "att_abc123" }
 *                 linked_units:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       block:    { type: string, example: "A" }
 *                       unit:     { oneOf: [{type: integer}, {type: string}], example: 8 }
 *                       fraction: { type: number, example: 0.280000 }
 *                       pin:     { type: string, example: "7H9K3P" }
 *                 totalFraction:
 *                   type: number
 *                   description: Soma da fração da unidade principal + vinculadas
 *                   example: 0.861308
 *       400:
 *         description: Erro ao vincular unidade
 */
router.post('/credential/link', credentialController.linkUnit);

export default router;
