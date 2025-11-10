import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// En mode développement, on conserve l'instance de PrismaClient dans le global
// pour éviter les fuites de mémoire lors du rechargement à chaud (HMR)
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
