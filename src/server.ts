import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import healthRoutes from './routes/HealthRoutes';
import adminRoutes from './routes/AdminRoutes';
import publicRoutes from './routes/PublicRoutes';
import opsRoutes from './routes/OperatorRoutes';
import voteRoutes from './routes/VoteRoutes';

import { createIO } from './sockets/io';

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use('/', healthRoutes);
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ops', opsRoutes);
app.use('/api', voteRoutes);

const server = http.createServer(app);
const { io } = createIO(server);

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => {
    logger.info({ PORT }, 'API listening');
});
