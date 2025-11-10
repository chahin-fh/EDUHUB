import { z } from 'zod';
import { ValidationError } from './api-errors';

// Schéma de base pour les dates
const dateSchema = z.string().refine(
  (value) => !isNaN(Date.parse(value)),
  { message: 'Format de date invalide' }
);

// Schéma pour les IDs MongoDB
export const objectIdSchema = z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  { message: 'ID invalide' }
);

// Schéma pour l'utilisateur
export const userSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']).optional(),
  bio: z.string().optional(),
  profileImage: z.string().url('URL d\'image invalide').optional(),
});

// Schéma pour la création d'un cours
export const createCourseSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  subject: z.string().min(2, 'La matière est requise'),
  level: z.string().min(2, 'Le niveau est requis'),
  price: z.number().min(0, 'Le prix ne peut pas être négatif'),
  thumbnail: z.string().url('URL de l\'image invalide').optional(),
  isPublished: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
});

// Schéma pour la mise à jour d'un cours
export const updateCourseSchema = createCourseSchema.partial();

// Schéma pour une leçon
export const lessonSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  videoUrl: z.string().url('URL de la vidéo invalide'),
  duration: z.number().int().positive('La durée doit être un nombre positif'),
  order: z.number().int().nonnegative('L\'ordre doit être un nombre positif ou nul'),
  isPublished: z.boolean().optional(),
});

// Schéma pour l'inscription à un cours
export const enrollmentSchema = z.object({
  courseId: objectIdSchema,
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).optional(),
});

// Schéma pour la progression
export const progressSchema = z.object({
  lessonId: objectIdSchema,
  courseId: objectIdSchema,
  completed: z.boolean().optional(),
  progress: z.number().min(0).max(100).optional(),
});

// Schéma pour un message
export const messageSchema = z.object({
  recipientId: objectIdSchema,
  content: z.string().min(1, 'Le message ne peut pas être vide'),
  courseId: objectIdSchema.optional(),
});

// Fonction utilitaire pour valider les données
export const validate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.reduce((acc, issue) => {
      const path = issue.path.join('.');
      if (!acc[path]) {
        acc[path] = [];
      }
      acc[path].push(issue.message);
      return acc;
    }, {} as Record<string, string[]>);

    throw new ValidationError(errors);
  }

  return result.data;
};

// Fonction pour valider les paramètres d'URL
export const validateParams = <T>(
  schema: z.ZodSchema<T>,
  params: unknown
): T => {
  const result = schema.safeParse(params);
  
  if (!result.success) {
    throw new ValidationError(
      { params: ['Paramètres invalides'] },
      'Paramètres de requête invalides'
    );
  }

  return result.data;
};
