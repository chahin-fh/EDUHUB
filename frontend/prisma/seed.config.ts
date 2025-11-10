// Configuration pour le script de seeding
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Vérifier que l'URL de la base de données est définie
if (!process.env.MONGODB_URI) {
  throw new Error('La variable d\'environnement MONGODB_URI n\'est pas définie');
}

export const config = {
  // URL de connexion à MongoDB
  mongodbUri: process.env.MONGODB_URI,
  
  // Options pour le client MongoDB
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  
  // Noms des collections
  collections: {
    users: 'users',
    courses: 'courses',
    lessons: 'lessons',
    categories: 'categories',
    enrollments: 'enrollments',
    messages: 'messages',
    progress: 'progress',
    courseCategories: 'course_categories',
  },
};
