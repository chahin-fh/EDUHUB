# 🎓 EDUHUB — Plateforme d'apprentissage collaboratif

EDUHUB est une application web **full-stack** (architecture client-serveur) qui met en relation des **étudiants** et des **mentors/moniteurs** pour un apprentissage collaboratif horizontal : chacun peut apprendre d'un tuteur ou enseigner une matière qu'il maîtrise.

Le projet est entièrement en français et repose sur **3 espaces** :
- 🧑‍🎓 **Étudiant** : découvrir des mentors, s'inscrire à des cours (gratuits ou payants), suivre sa progression, échanger en messagerie temps réel, passer des appels vidéo, laisser des avis.
- 👨‍🏫 **Moniteur / Mentor** : créer des cours structurés en modules/leçons, gérer les inscriptions et la progression des étudiants, accepter/refuser les demandes de tutorat, consulter ses statistiques et revenus.
- 🛡️ **Administration** : statistiques globales réelles, gestion des utilisateurs, matières, établissements, avis et paiements.

---

## 🧱 Stack technique

### Frontend (`/frontend`)
| Technologie | Usage |
|---|---|
| **Next.js 13+** (App Router) | Pages et layouts dans `app/` |
| **React + TypeScript** | UI typée |
| **Tailwind CSS + shadcn/ui** | Design system (Dialog, Card, Badge, Tabs, Progress…) |
| **Framer Motion** | Animations et micro-interactions |
| **Recharts** | Graphiques (dashboard, admin, accueil) |
| **Socket.io-client** | Messagerie temps réel, signalisation des appels WebRTC |
| **AuthContext** (`contexts/AuthContext.tsx`) | Contexte d'authentification global (JWT) |

### Backend (`/backend`)
| Technologie | Usage |
|---|---|
| **Node.js / Express** | API REST |
| **MongoDB + Mongoose** | 9 modèles : `User`, `Course`, `Enrollment`, `Subject`, `Establishment`, `Conversation`, `Message`, `MatchRequest`, `Review` |
| **JWT + bcryptjs** | Authentification stateless, hachage des mots de passe |
| **Passport.js** | Sessions |
| **Socket.io** | Temps réel (chat, notifications, WebRTC signaling) |
| **Stripe** | Paiements de cours (checkout + webhook idempotent) |
| **Nodemailer** | Emails (vérification, mot de passe oublié, contact) |
| **Cloudinary + Multer** | Upload d'images et de documents |
| **helmet / cors / express-rate-limit** | Sécurité et limitation de débit |
| **node:test** | Tests unitaires (runner natif Node.js, aucun package requis) |

---

## 🚀 Installation

### Prérequis
- Node.js **18+** (testé sous v26)
- MongoDB (local ou MongoDB Atlas)
- npm
- *(optionnel)* Docker Compose pour MongoDB + services

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # puis renseigner chaque variable
npm run dev             # http://localhost:5000
```

Créer un compte administrateur :
```bash
node scripts/create-superuser.js
```

Lancer les tests :
```bash
npm test                # node --test tests/
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev             # http://localhost:3000
```

### 3. (Optionnel) MongoDB via Docker

```bash
docker compose up -d mongo
```

---

## 🔑 Variables d'environnement

### Backend — `backend/.env`
| Variable | Obligatoire | Description |
|---|---|---|
| `MONGODB_URI` / `MONGO_URL` | ✅ | URI de connexion MongoDB |
| `JWT_SECRET` | ✅ | Secret des tokens JWT |
| `SESSION_SECRET` | ✅ | Secret des sessions |
| `FRONTEND_URL` | ✅ | URL du frontend (`http://localhost:3000`) |
| `PORT` | ❌ | Port du serveur (défaut `5000`) |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` / `EMAIL_FROM` | selon besoin | SMTP (vérification d'email, mot de passe oublié) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | selon besoin | Upload d'images |
| `STRIPE_SECRET_KEY` | pour les paiements | Clé Stripe (`sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | pour les paiements | Clé de signature webhook (`whsec_…`) |

### Frontend — `frontend/.env.local`
| Variable | Obligatoire | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE` | ✅ | `http://localhost:5000` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ❌ | Affichage des images Cloudinary |

> ⚠️ Aucune donnée sensible ne doit être codée en dur : tout passe par les fichiers `.env`.

---

## 📁 Structure du projet

```
EDUHUB/
├── backend/
│   ├── controllers/     # Logique métier des routes
│   ├── models/          # Schémas Mongoose (9 modèles)
│   ├── routes/          # Définition des endpoints API
│   ├── middleware/      # auth, authMiddleware, security, emailVerification…
│   ├── config/          # stripe, cloudinary, email, multer, passport
│   ├── scripts/         # create-superuser, resetDatabase…
│   ├── tests/           # Tests unitaires (node:test)
│   ├── index.js         # Point d'entrée serveur (Express + Socket.io)
│   └── .env.example
├── frontend/
│   ├── app/             # Pages Next.js (App Router)
│   │   ├── admin/       #   Espace administration
│   │   ├── dashboard/   #   Dashboard étudiant / moniteur
│   │   ├── cours/       #   Liste + détail des cours (modules/leçons)
│   │   ├── users/       #   Annuaire des mentors
│   │   ├── demandes/    #   Demandes de tutorat (matching)
│   │   ├── messages/    #   Messagerie
│   │   ├── paiements/   #   Historique des paiements
│   │   └── …
│   ├── components/      # Composants réutilisables (shadcn/ui + métier)
│   ├── contexts/        # AuthContext, etc.
│   ├── lib/             # Utilitaires
│   └── .env.example
├── docker-compose.yml   # MongoDB + backend + frontend
├── readme.md
└── nextstep.md
```

---

## ✨ Fonctionnalités principales

### 🔐 Authentification
- Inscription / connexion avec JWT (`bcryptjs`)
- Vérification d'email par lien (avec renvoi), middleware bloquant tant que l'email n'est pas confirmé
- Mot de passe oublié / réinitialisation par email
- 3 rôles : `user` (étudiant), `mentor`/moniteur, `admin` — middlewares `adminOnly`, `monitorOnly`, `adminOrMonitorOnly` sur toutes les routes sensibles

### 🧑‍🎓 Espace étudiant
- Annuaire `/users` : pagination, tri, recherche et filtrage par matière (résolution nom → ObjectId côté backend)
- Cours : inscription gratuite ou paiement Stripe, modules/leçons (vidéo, texte, quiz, devoir), progression en temps réel (`PATCH /api/courses/:id/progress`)
- `/paiements` : historique réel des paiements
- Matching : envoi de `MatchRequest` avec créneau horaire, statut suivi dans `/demandes` + **notification temps réel** (Socket.io) quand un mentor répond
- Messagerie temps réel + **appels vidéo / partage d'écran WebRTC** (signalisation Socket.io, gestion accept/refuse/fin, busy, caméra refusée)
- Avis : note 1–5 étoiles + commentaire sur les mentors
- Dashboard : données réelles (`/api/stats/dashboard`) — cours suivis, heures d'étude, complétion, activité sur 7 jours

### 👨‍🏫 Espace moniteur
- Profil mentor : `monitorProfile` (matières, niveau, disponibilités), statut de vérification
- Création de cours (modules/leçons, gratuit ou payant en TND)
- **Dashboard mentor** (vue dédiée dans `/dashboard`) : étudiants inscrits (uniques), revenus, note moyenne, taux de complétion, cours + inscriptions récentes (`GET /api/monitor/stats`)
- Acceptation/refus des demandes de tutorat
- Messagerie et appels vidéo

### 🛡️ Espace administration (`/admin`)
- Statistiques globales **réelles** (`/api/stats/admin`) : utilisateurs, cours, inscriptions, avis, établissements, activités récentes, messages récents, taux d'engagement
- Gestion des utilisateurs : lister, filtrer par rôle, activer/désactiver, promouvoir/déclasser un moniteur (la déclassification retire aussi la vérification du profil mentor)
- Gestion des matières : CRUD, ajout multiple, catégories
- Gestion des établissements : CRUD, statuts actif/featured/verified
- Gestion des avis et des paiements

### 📊 Statistiques
- `GET /api/stats/home` — compteurs publics (accueil)
- `GET /api/stats/admin` — métriques globales + 5 dernières activités
- `GET /api/stats/dashboard` — progression de l'étudiant connecté
- `GET /api/monitor/stats` — statistiques du moniteur connecté

---

## 🔌 Principaux endpoints API

| Méthode | Route | Accès |
|---|---|---|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Privé |
| `GET` | `/api/usersList` | Privé (paginé, tri, filtres) |
| `GET` | `/api/subjects` | Public |
| `POST` | `/api/courses` | Moniteur/Admin |
| `POST` | `/api/courses/:id/enroll` | Privé |
| `PATCH` | `/api/courses/:id/progress` | Étudiant inscrit |
| `POST` | `/api/payment/create-checkout-session` | Privé |
| `POST` | `/api/payment/webhook` | Stripe (body brut) |
| `GET` | `/api/payment/history` | Privé |
| `POST` | `/api/matching/requests` | Privé |
| `POST` | `/api/reviews` | Privé |
| `GET` | `/api/stats/home` | Public |
| `GET` | `/api/stats/admin` | Admin |
| `GET` | `/api/stats/dashboard` | Privé |
| `GET` | `/api/monitor/stats` | Moniteur/Admin |

---

## 🧪 Tests

Suite de tests unitaires avec le runner natif **`node:test`** (aucune dépendance à installer, aucune base de données requise — les modèles sont mockés) :

```bash
cd backend && npm test
```

Couvre :
- **Auth** : gardes d'inscription/connexion (400), doublon, succès avec token
- **Middlewares de rôles** : `protect` (sans/avec token invalide/expiré/valide), `adminOnly`, `monitorOnly`, `adminOrMonitorOnly` (403 pour les rôles non autorisés)
- **Stripe** : webhook sans signature (400), événements non liés, et **idempotence** du `checkout.session.completed` (aucun doublon d'inscription ni double incrément de `studentsEnrolled`), session de checkout (404 cours inexistant, succès)

---

## 📝 Notes importantes
- Ne jamais commiter les fichiers `.env`
- Changer `JWT_SECRET` et `SESSION_SECRET` en production
- Le webhook Stripe doit être enregistré sur la route `/api/payment/webhook` (body brut, avant `bodyParser`)
- En production, définir `NODE_ENV=production` (masque les stack traces)
