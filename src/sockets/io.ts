import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

export function createIO(server: HttpServer) {
    const io = new Server(server, {
        cors: { origin: '*' }
    });

    io.on('connection', (socket) => {
        // opcional: usar rooms por assemblyId
        const assemblyId = socket.handshake.query.assemblyId as string | undefined;
        if (assemblyId) socket.join(`assembly:${assemblyId}`);
    });

    function emitToAssembly(assemblyId: string, event: string, payload: any) {
        io.to(`assembly:${assemblyId}`).emit(event, payload);
    }

    return { io, emitToAssembly };
}
