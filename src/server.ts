
/**
 * @file server.ts
 * @description Ponto de entrada principal da aplicação backend de votação eletrônica para assembleias condominiais.
 *
 * Responsabilidades:
 * - Carregar variáveis de ambiente (.env)
 * - Exibir informações de debug e inicialização
 * - Delegar a inicialização do servidor para assemblyApi/startServer
 *
 * Variáveis de ambiente relevantes:
 * - DEBUG: Ativa/desativa modo de depuração
 */
import dotenv from 'dotenv';
dotenv.config();


/**
 * Importa a função principal de inicialização do servidor.
 */
import { startServer } from './api/assemblyApi';


/**
 * Exibe informações de debug e status de inicialização no console.
 */
const DEBUG = process.env.DEBUG === 'true';
console.log(`[Api] Modo de depuração: ${DEBUG ? 'Ativado' : 'Desativado'}`);
console.log(`[Api] Iniciando a aplicação...`);


/**
 * Inicializa o servidor da aplicação.
 */
startServer();