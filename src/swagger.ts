
/**
 * @file swagger.ts
 * @description Configuração do Swagger/OpenAPI para documentação automática da API.
 *
 * Este arquivo define o objeto swaggerSpec, que é utilizado para gerar a documentação interativa
 * da API (Swagger UI) e o arquivo OpenAPI JSON. Inclui tags, descrição, servidores e paths das rotas/controllers.
 *
 * - Usa swagger-jsdoc para gerar o spec a partir de comentários JSDoc nas rotas/controllers.
 * - O fileExtension é ajustado conforme ambiente para suportar .ts em dev e .js em produção.
 * - As rotas e controllers devem conter comentários JSDoc compatíveis com Swagger para aparecerem na doc.
 */
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Define a extensão dos arquivos a serem lidos pelo swagger-jsdoc.
 * Usa .ts em desenvolvimento e .js em produção.
 */
const fileExtension = process.env.NODE_ENV === 'DEV' ? 'ts' : 'js';


/**
 * swaggerSpec: Objeto OpenAPI gerado pelo swagger-jsdoc.
 * Inclui informações gerais, tags, servidores e paths das rotas/controllers.
 * Deve ser exportado e utilizado no Swagger UI e endpoints de documentação.
 */
export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Assembleia Backend API',
      description: 'API para votação eletrônica em assembleias condominiais. Gerencia assembleias, itens, votos, autenticação e operações administrativas.',
      version: '1.0.0',
    },
    tags: [
      {
        name: 'Healthcheck',
        description: 'Verificações de status da aplicação',
      },
      {
        name: 'Admin',
        description: 'Rotas administrativas de assembleia',
      },
      {
        name: 'Público',
        description: 'Consultas públicas de assembleia e itens',
      },
      {
        name: 'Operador',
        description: 'Rotas de operador',
      },
      {
        name: 'Votação',
        description: 'Rotas de votação eletrônica',
      },
    ],
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Desenvolvimento local'
      }
    ]
  },
  apis: [
    path.resolve(__dirname, `./routes/*.${fileExtension}`),
    path.resolve(__dirname, `./controllers/*.${fileExtension}`),
  ],
});
