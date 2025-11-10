// Configuration côté client (exposée au navigateur)
const clientConfig = {
  app: {
    name: 'EduHub',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  storage: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
} as const;

export default clientConfig;
