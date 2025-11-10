export const config = {
  app: {
    name: 'EduHub',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    jwtSecret: process.env.JWT_SECRET!,
  },
  db: {
    uri: process.env.MONGODB_URI!,
  },
  storage: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  email: {
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM || 'noreply@eduhub.com',
  },
};

// Vérification des variables d'environnement requises
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'NEXTAUTH_SECRET'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`La variable d'environnement ${envVar} est requise mais n'est pas définie.`);
  }
});
