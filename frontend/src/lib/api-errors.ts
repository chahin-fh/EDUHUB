import { NextApiResponse } from 'next';

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Requête invalide') {
    super(400, message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Non autorisé') {
    super(401, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Accès refusé') {
    super(403, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Ressource non trouvée') {
    super(404, message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflit') {
    super(409, message);
  }
}

export class ValidationError extends ApiError {
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message = 'Erreur de validation') {
    super(422, message);
    this.errors = errors;
  }
}

export const handleApiError = (error: unknown, res: NextApiResponse) => {
  console.error(error);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error instanceof ValidationError && { errors: error.errors }),
    });
  }

  // Gestion des erreurs Prisma
  if (error instanceof Error && 'code' in error) {
    const prismaError = error as any;
    
    // Erreur de contrainte unique
    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'champ';
      return res.status(409).json({
        success: false,
        message: `Un enregistrement avec cette valeur de ${field} existe déjà`,
      });
    }

    // Ressource non trouvée
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Ressource non trouvée',
      });
    }
  }

  // Erreur de validation Zod
  if (error instanceof Error && 'issues' in error) {
    const zodError = error as any;
    const errors = zodError.issues.reduce((acc: Record<string, string[]>, issue: any) => {
      const path = issue.path.join('.');
      if (!acc[path]) {
        acc[path] = [];
      }
      acc[path].push(issue.message);
      return acc;
    }, {});

    return res.status(422).json({
      success: false,
      message: 'Erreur de validation',
      errors,
    });
  }

  // Erreur inattendue
  return res.status(500).json({
    success: false,
    message: 'Une erreur est survenue',
    ...(process.env.NODE_ENV === 'development' && { error: error instanceof Error ? error.message : 'Erreur inconnue' }),
  });
};

export const asyncHandler = (fn: Function) => 
  async (req: any, res: NextApiResponse, next: any) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      handleApiError(error, res);
    }
  };
