import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { config } from './seed.config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.mongodbUri,
    },
  },
});

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Nettoyer la base de données
  console.log('🧹 Nettoyage de la base de données...');
  await prisma.courseCategory.deleteMany({});
  await prisma.progress.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.category.deleteMany({});

  // Créer des catégories
  console.log('📚 Création des catégories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Développement Web',
        description: 'Apprenez à créer des sites web modernes et réactifs',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Science des Données',
        description: 'Maîtrisez l\'analyse et la visualisation des données',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Marketing Digital',
        description: 'Développez votre présence en ligne et vos compétences en marketing',
      },
    }),
  ]);

  // Créer un administrateur
  console.log('👨‍💼 Création de l\'administrateur...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@eduhub.com',
      password: await hash('admin123', 12),
      firstName: 'Admin',
      lastName: 'EduHub',
      role: 'ADMIN',
      bio: 'Administrateur de la plateforme EduHub',
    },
  });

  // Créer des instructeurs
  console.log('👨‍🏫 Création des instructeurs...');
  const instructors = await Promise.all([
    prisma.user.create({
      data: {
        email: 'instructor1@eduhub.com',
        password: await hash('instructor123', 12),
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'INSTRUCTOR',
        bio: 'Développeur Full Stack avec 10 ans d\'expérience',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
    }),
    prisma.user.create({
      data: {
        email: 'instructor2@eduhub.com',
        password: await hash('instructor123', 12),
        firstName: 'Marie',
        lastName: 'Martin',
        role: 'INSTRUCTOR',
        bio: 'Spécialiste en science des données et IA',
        profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
    }),
  ]);

  // Créer des étudiants
  console.log('👨‍🎓 Création des étudiants...');
  const students = await Promise.all(
    Array.from({ length: 5 }, async (_, i) => {
      const firstNames = ['Pierre', 'Sophie', 'Thomas', 'Emma', 'Lucas', 'Camille', 'Hugo', 'Léa'];
      const lastNames = ['Bernard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent'];
      
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      return prisma.user.create({
        data: {
          email: `etudiant${i + 1}@eduhub.com`,
          password: await hash('etudiant123', 12),
          firstName,
          lastName,
          role: 'STUDENT',
          bio: `Étudiant passionné par l'apprentissage en ligne`,
          profileImage: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 10}.jpg`,
        },
      });
    })
  );

  // Créer des cours
  console.log('📖 Création des cours...');
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Développement Web Moderne avec React et Next.js',
        description: 'Apprenez à créer des applications web modernes avec React, Next.js et TypeScript',
        subject: 'Développement Web',
        level: 'Intermédiaire',
        price: 49.99,
        instructorId: instructors[0].id,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        isPublished: true,
        rating: 4.8,
        totalStudents: 125,
        courseCategories: {
          create: {
            categoryId: categories[0].id,
          },
        },
      },
    }),
    prisma.course.create({
      data: {
        title: 'Introduction à la Science des Données avec Python',
        description: 'Découvrez les fondamentaux de la science des données avec Python, Pandas et Scikit-learn',
        subject: 'Science des Données',
        level: 'Débutant',
        price: 39.99,
        instructorId: instructors[1].id,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        isPublished: true,
        rating: 4.6,
        totalStudents: 89,
        courseCategories: {
          create: {
            categoryId: categories[1].id,
          },
        },
      },
    }),
  ]);

  // Créer des leçons pour chaque cours
  console.log('📝 Création des leçons...');
  const lessons = [];
  
  // Leçons pour le premier cours
  const course1Lessons = await Promise.all(
    [
      {
        title: 'Introduction à React',
        description: 'Découvrez les bases de React et son écosystème',
        videoUrl: 'https://example.com/videos/react-intro',
        duration: 1200, // 20 minutes
        order: 1,
        isPublished: true,
      },
      {
        title: 'Les composants React',
        description: 'Apprenez à créer et à utiliser des composants React',
        videoUrl: 'https://example.com/videos/react-components',
        duration: 1800, // 30 minutes
        order: 2,
        isPublished: true,
      },
      {
        title: 'Gestion d\'état avec Redux',
        description: 'Maîtrisez la gestion d\'état avec Redux',
        videoUrl: 'https://example.com/videos/redux-state',
        duration: 2400, // 40 minutes
        order: 3,
        isPublished: true,
      },
    ].map((lesson, index) =>
      prisma.lesson.create({
        data: {
          ...lesson,
          courseId: courses[0].id,
        },
      })
    )
  );
  lessons.push(...course1Lessons);

  // Leçons pour le deuxième cours
  const course2Lessons = await Promise.all(
    [
      {
        title: 'Introduction à Python pour la science des données',
        description: 'Découvrez Python et les bibliothèques essentielles',
        videoUrl: 'https://example.com/videos/python-ds-intro',
        duration: 1500, // 25 minutes
        order: 1,
        isPublished: true,
      },
      {
        title: 'Manipulation des données avec Pandas',
        description: 'Apprenez à manipuler des données avec la bibliothèque Pandas',
        videoUrl: 'https://example.com/videos/pandas-tutorial',
        duration: 2100, // 35 minutes
        order: 2,
        isPublished: true,
      },
    ].map((lesson, index) =>
      prisma.lesson.create({
        data: {
          ...lesson,
          courseId: courses[1].id,
        },
      })
    )
  );
  lessons.push(...course2Lessons);

  // Inscrire des étudiants aux cours
  console.log('🎓 Inscription des étudiants aux cours...');
  const enrollments = [];
  
  for (const student of students) {
    for (const course of courses) {
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          status: Math.random() > 0.3 ? 'APPROVED' : 'PENDING',
          progress: Math.floor(Math.random() * 100),
          rating: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 3 : null,
          review: Math.random() > 0.7 ? 'Cours très instructif et bien structuré !' : null,
        },
      });
      enrollments.push(enrollment);
    }
  }

  // Ajouter des messages
  console.log('💬 Création de messages...');
  const messages = [];
  
  for (let i = 0; i < 10; i++) {
    const sender = instructors[Math.floor(Math.random() * instructors.length)];
    const recipient = students[Math.floor(Math.random() * students.length)];
    const course = courses[Math.floor(Math.random() * courses.length)];
    
    const message = await prisma.message.create({
      data: {
        content: `Message de test ${i + 1} - ${['Bonjour', 'Salut', 'Hello', 'Coucou', 'Bonjour cher étudiant'][i % 5]} ! Comment puis-je vous aider avec le cours "${course.title}" ?`,
        senderId: sender.id,
        recipientId: recipient.id,
        courseId: course.id,
        read: Math.random() > 0.5,
      },
    });
    messages.push(message);
  }

  // Ajouter des données de progression
  console.log('📊 Création des données de progression...');
  const progresses = [];
  
  for (const enrollment of enrollments) {
    if (enrollment.status === 'APPROVED') {
      const course = courses.find(c => c.id === enrollment.courseId);
      if (!course) continue;
      
      const courseLessons = lessons.filter(l => l.courseId === course.id);
      
      for (const lesson of courseLessons) {
        const progress = await prisma.progress.create({
          data: {
            userId: enrollment.userId,
            lessonId: lesson.id,
            courseId: course.id,
            completed: Math.random() > 0.3,
            progress: Math.floor(Math.random() * 100),
          },
        });
        progresses.push(progress);
      }
    }
  }

  console.log('✅ Seeding terminé avec succès !');
  console.log(`📊 Données créées :`);
  console.log(`- Utilisateurs: ${1 + instructors.length + students.length}`);
  console.log(`- Cours: ${courses.length}`);
  console.log(`- Leçons: ${lessons.length}`);
  console.log(`- Inscriptions: ${enrollments.length}`);
  console.log(`- Messages: ${messages.length}`);
  console.log(`- Progrès: ${progresses.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });