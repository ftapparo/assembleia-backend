
/**
 * @file AdminRoutes.ts
 * @description Rotas administrativas para controle de assembleias e itens.
 *
 * Endpoints principais:
 *   - GET /api/admin/assembly: Consulta dados da assembleia
 *   - POST /api/admin/assembly/start: Inicia assembleia
 *   - POST /api/admin/assembly/close: Encerra assembleia
 *   - POST /api/admin/items/:orderNo/open: Abre item
 *   - POST /api/admin/items/:orderNo/close: Fecha item
 *   - POST /api/admin/items/:orderNo/void: Anula item
 *
 * Integra o controller admin e pode usar autenticação adminAuth.
 */
import { Router } from 'express';
import { adminAuth } from '../middlewares/adminAuth';
import { createAdminController } from '../controllers/adminController';

/**
 * Instancia o controller administrativo.
 */
const ctrl = createAdminController();

/**
 * Instância do router para rotas administrativas.
 * (Descomente adminAuth para proteger as rotas)
 */
const router = Router();
//router.use(adminAuth);

/**
 * @swagger
 * /admin/assembly:
 *   get:
 *     summary: Consulta dados da assembleia atual
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dados da assembleia retornados com sucesso
 */
router.get('/admin/assembly', ctrl.getAssembly);

/**
 * @swagger
 * /admin/assembly/start:
 *   post:
 *     summary: Inicia a assembleia
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Assembleia iniciada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 * 
 */
router.post('/admin/assembly/start', ctrl.startAssembly);

/**
 * @swagger
 * /admin/assembly/close:
 *   post:
 *     tags: [Admin]
 *     summary: Encerra a assembleia
 *     responses:
 *       200:
 *         description: Assembleia encerrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.post('/admin/assembly/close', ctrl.closeAssembly);

/**
 * @swagger
 * /admin/items/{orderNo}/open:
 *   post:
 *     summary: Abre um item da assembleia
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: orderNo
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de ordem do item
 *     responses:
 *       200:
 *         description: Item aberto com sucesso
 */
router.post('/admin/items/:orderNo/open', ctrl.openItem);

/**
 * @swagger
 * /admin/items/{orderNo}/close:
 *   post:
 *     summary: Fecha um item da assembleia
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: orderNo
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de ordem do item
 *     responses:
 *       200:
 *         description: Item fechado com sucesso
 */
router.post('/admin/items/:orderNo/close', ctrl.closeItem);

/**
 * @swagger
 * /admin/items/{orderNo}/void:
 *   post:
 *     summary: Anula um item da assembleia
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: orderNo
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de ordem do item
 *     responses:
 *       200:
 *         description: Item anulado com sucesso
 */
router.post('/admin/items/:orderNo/void', ctrl.voidItem);

export default router;
