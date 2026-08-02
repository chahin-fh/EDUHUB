# 📋 AUDIT — État des lieux du projet EDUHUB

> **Date :** Août 2026 — **Méthode :** exploration manuelle du code (backend + frontend), vérification des routes, middlewares, modèles, pages et composants.
>
> **Objectif :** recenser les fonctionnalités **100 % terminées**, les fonctionnalités **partielles** (avec ce qui manque précisément), les **bugs identifiés** et les **incohérences** avant tout développement.

---

## 1. ✅ Fonctionnalités 100 % terminées

| # | Fonctionnalité | Preuve dans le code |
|---|---|---|
| 1 | **Auth locale** (inscription/connexion JWT + bcrypt) | `routes/auth.js`, `authController.js`, `User.pre('save')` |
| 2 | **Vérification d'email** (token + expiration 24h + renvoi) | `authController.js` (verifyEmail, resendVerificationEmail), `routes/auth.js` |
| 3 | **Mot de passe oublié / reset** (token + expiration) | `authController.js` (forgot/resetPassword) |
| 4 | **3 rôles** (admin / user / moniteur via `isMonitor`) | `models/User.js` (`role: ['admin','user']` + `isMonitor`) |
| 5 | **Annuaire `/users`** : pagination, tri, recherche, **filtre par matière (nom→ObjectId corrigé)** | `routes/usersList.js` (`resolveSubjectToId`), `app/users/page.tsx` |
| 6 | **Stats réelles** : `/api/stats/home`, `/admin`, `/dashboard` | `statsController.js`, `routes/stats.js`, pages Accueil/`/admin`/`/dashboard` |
| 7 | **Cours payants via Stripe** : checkout + webhook + historique `/paiements` | `paymentController.js`, `routes/payment.js`, `app/paiements/` |
| 8 | **Inscription gratuite aux cours** (idempotente, `$setOnInsert`) | `courseController.js` (enrollCourse), `routes/courses.js` |
| 9 | **Messagerie** conversations temps réel + recherche d'utilisateurs | `chatController.js`, `chat-widget.tsx`, `app/messages/page.tsx` |
| 10 | **Appels vidéo / partage d'écran WebRTC** (accepte/refuse/fin, caméra/micro/écran, minimisation) | `components/webrtc-call.tsx` + signalisation `index.js` (socket.io) |
| 11 | **Matching + demandes** (`MatchRequest`, accept/refuse, création auto de conversation) | `matchingController.js`, `app/demandes/page.tsx` |
| 12 | **Avis & notation** (1–5 ⭐, anti-doublon, moyenne recalculée) | `reviewController.js` |
| 13 | **Gestion des matières** : CRUD admin, ajout simple/multiple, catégories, filtres (design refondu) | `subjectController.js`, `components/admin/subject-manager.tsx` |
| 14 | **Gestion des établissements** : CRUD admin + stats par type | `establishmentController.js`, `establishment-manager.tsx` |
| 15 | **Upload de cours (documents)** + téléchargement | `courseController.js` (uploadCourse/downloadCourse), `app/cours/upload/` |
| 16 | **Suivi de progression** des cours (backend : `updateProgress`) | `courseController.js` |
| 17 | **Formulaire de contact** + envoi email | `contactController.js` |
| 18 | **Sécurité de base** : helmet, CORS, rate-limit global + auth | `middleware/security.js` |
| 19 | **Profils mentors** : `monitorProfile` (expertise, niveau, vérifié, dispo) | `models/User.js`, `app/profile/`, `app/users/[id]/` |
| 20 | **Design system cohérent** (dégradé bleu→violet→rose, shadcn/ui, Framer Motion, glassmorphisme) | l'ensemble des pages `app/` |

---

## 2. ⚠️ Fonctionnalités partielles (ce qui manque précisément)

### 2.1 Espace moniteur (mentor)
- **Pas de tableau de bord mentor dédié** : aucune page montrant ses statistiques (nb étudiants, complétion de ses cours, note moyenne agrégée, revenus). Le dashboard actuel est **étudiant**.
- **Pas de liste des inscriptions à ses cours** : pas d'UI pour voir les étudiants inscrits ni leur progression individuelle.
- **Pas d'historique des paiements reçus** pour ses cours payants.
- `GET /api/courses/instructor/my-courses` existe côté backend mais est **inaccessible** (voir Bug #1) et n'est consommé par aucun frontend.

### 2.2 Espace admin
- **Pas de gestion des utilisateurs dans l'UI** : la page `/users` est un annuaire **en lecture seule** (pas d'actions suspendre/bannir/supprimer/promouvoir/vérifier).
- **Pas de validation manuelle des `monitorProfile`** (pas d'UI pour vérifier un mentor / son niveau d'expertise).
- **Pas de modération des avis** (signaler/supprimer un avis abusif en tant qu'admin).
- **Pas de vue Stripe côté admin** : pas d'historique global des transactions, pas de gestion de remboursements, pas de statut des webhooks.
- **Pas de logs d'activité sensible** (actions admin, connexions, tentatives échouées).
- **Pas de gestion des litiges** / signalements de paiement.

### 2.3 Appels vidéo — « presque done » (`nextstep.md`)
- **Pas de serveur TURN** (uniquement STUN Google) → échec probable derrière certains NAT/entreprises.
- **Pas de gestion de reconnexion socket** (un `socket.on('reconnect')` manquant) ; l'état de l'appel peut rester bloqué si le socket se coupe.
- **Pas de gestion « occupé »** : un utilisateur déjà en appel reçoit quand même un `incoming-call`.
- **Refus explicite** : le caller reste en « Appel en cours… » indéfiniment si le destinataire ferme sans répondre (pas d'événement `call-declined`).
- **Deux implémentations WebRTC parallèles** : `webrtc-call.tsx` **et** `chat-widget.tsx` (gestion socket/peerConnection dupliquée, non harmonisées).
- **Permissions caméra/micro refusées** : `getUserMedia` renvoie `null` et l'appel s'arrête silencieusement (pas de message à l'utilisateur).

### 2.4 Notifications
- **Pas de notification temps réel du changement de statut** d'une `MatchRequest` (pas de push socket.io : le statut n'est visible qu'en rechargeant `/demandes`).

### 2.5 Progression « temps réel »
- `updateProgress` existe (backend) et la page `cours/[id]` gère l'inscription/paiement, mais il faut **vérifier l'intégration frontend de la complétion de chaque leçon** (marquage leçon terminée → appel PATCH `/progress`) — partiel.

---

## 3. 🐛 Bugs identifiés

| # | Sévérité | Bug | Fichier(s) | Explication |
|---|---|---|---|---|
| 1 | 🔴 **Critique** | **Le rôle `"instructor"` n'existe pas** | `backend/routes/courses.js` (l. 42-85), `backend/models/User.js` | `restrictTo("instructor","admin")` est utilisé partout sur les routes cours, mais `User.role` n'accepte que `["admin","user"]`. Les **moniteurs** (`isMonitor:true`) sont donc bloqués avec 403 sur : `POST /api/courses`, `PATCH/DELETE /:id`, `/instructor/my-courses`, `/upload-video`. Seuls les admins peuvent créer des cours ! |
| 2 | 🔴 **Critique** | **`isMonitor` est `default: true`** | `backend/models/User.js` (l. 80-83) | Tous les nouveaux utilisateurs deviennent **moniteurs par défaut** à l'inscription, sauf si le frontend envoie explicitement `isMonitor:false`. À confirmer dans `authController.registerUser` — si le champ n'est pas passé, tout le monde est moniteur. |
| 3 | 🔴 **Critique** | **Middleware `requireEmailVerification` jamais monté** | `backend/middleware/emailVerification.js` | Le middleware existe mais **aucune route ne l'importe** : l'accès aux fonctionnalités n'est en réalité **jamais bloqué** pour un email non vérifié côté backend (seule la génération de token existe). |
| 4 | 🟠 Élevé | **`/api/usersList` accessible à tout utilisateur connecté** | `backend/routes/usersList.js` (l. 180) | La route n'est protégée que par `protect` (pas `adminOnly`) alors que la page frontend `/users` est **admin-only** (redirection non-admin → `/`). Un étudiant peut récupérer tous les profils via l'API. |
| 5 | 🟠 Élevé | **`/api/usersList/all-users` public et expose les emails** | `backend/routes/usersList.js` (l. 405) | Route **publique** (aucun middleware) qui renvoie tous les comptes `role:"user"` **avec leur email**. |
| 6 | ✅ **Vérifié — pas un bug** | `findMentorsBySubject` filtre `subject` en ObjectId | `backend/controllers/matchingController.js` (l. 22) + `app/apprendre/page.tsx` (l. 114-120) | Le frontend `/apprendre` envoie bien `subject._id` (ObjectId) via `handleSubjectSelect(subject._id, subject.name)` → le filtre `"monitorProfile.expertise.subject": subject` est correct. **Aucun CastError possible ici.** *(Hypothèse d'audit initiale, écartée après vérification du code.)* |
| 7 | 🟠 Élevé | **`POST /api/courses/upload` sans restriction de rôle** | `backend/routes/courses.js` (l. 24-28) + `frontend/app/dashboard/page.tsx` (l. 220) | La route `upload` est seulement `protect` (pas de `restrictTo`), contrairement à `POST /api/courses` (Bug #1). Résultat inverse du Bug #1 : **n'importe quel étudiant connecté peut créer un cours** via le bouton « Nouveau cours » du dashboard. Incohérence entre les deux chemins de création. *(Corrigé après review : la description initiale « étudiant voit le bouton puis échoue » était fausse — il réussit.)* |
| 8 | 🟡 Moyen | **Webhook Stripe : détection de doublon par heuristique temporelle** | `backend/controllers/paymentController.js` (l. 116-145) | `Math.abs(createdAt - updatedAt) < 2000` pour décider si l'inscription est nouvelle. Fonctionne en pratique mais **fragile** (basé sur l'horloge), et aucun traitement des événements `payment_intent.payment_failed` / `charge.refunded`. |
| 9 | 🟡 Moyen | **Deux middlewares auth dupliqués** | `backend/middleware/auth.js` **et** `authMiddleware.js` | Deux `protect` quasi identiques + deux approches de rôle (`restrictTo` vs `adminOnly/monitorOnly`). Source d'incohérences (cf. Bug #1). |
| 10 | 🟡 Moyen | **Redondance `/api/usersList/stats` vs `/api/stats/admin`** | `routes/usersList.js` + `statsController.js` | Deux endpoints de stats qui se chevauchent ; la page `/users` consomme l'ancien, `/admin` le nouveau. |
| 11 | 🟢 Faible | **URL API en dur `http://localhost:5000`** | ~30 fichiers frontend (`app/**`, `components/**`) | Aucune variable d'environnement `NEXT_PUBLIC_API_URL` ; le déploiement nécessite de tout remplacer. |
| 12 | 🟢 Faible | **`/api/courses/upload` créé des cours gratuits `price:0`** | `courseController.js` (l. 41) | Le flux d'upload documentaire ne propose ni prix ni catégorie (choix par défaut) ; pas de mismatch bloquant mais limitant pour l'espace moniteur. |

---

## 4. 🔍 Incohérences design / nommage

1. **Rôle « instructor » fantôme** : utilisé dans les routes cours mais absent du modèle User (cf. Bug #1). Le frontend utilise `isMonitor` comme « vrai » marqueur de moniteur.
2. **`role: "monitor"`** envoyé par `app/mentors/page.tsx` comme filtre → géré spécialement dans `usersList.js` (`query.isMonitor = true`). Fonctionne mais le nommage est trompeur.
3. **README obsolète** : mentionne **Prisma ORM** et `pnpm`, alors que le backend réel utilise **Mongoose** et que le dossier `frontend/src/` (ancien setup Prisma avec `lib/db.ts`) coexiste avec l'App Router dans `app/`. À réécrire (livrable n°4).
4. **Statut des demandes** : modèle = `pending/accepted/declined` ; le prompt IA évoque `refused`. Le frontend `/demandes` affiche « Refusée » pour `declined` — cohérent visuellement mais le nom d'API diffère de la doc.
5. **Langue des messages API** : mélange français/anglais (« User not found », « Erreur lors de… »). À uniformiser en français.
6. **`language: "fr"` vs `"Français"`** : le modèle Course accepte par défaut « Français » mais l'upload crée des cours avec `language: "fr"` — incohérent selon la donnée lue.

---

## 5. 🧪 Tests & documentation manquants

- **Aucun test** dans le projet (aucun `*.test.*` / `*.spec.*` hors `node_modules`). Le prompt exige au minimum des tests sur : auth, routes admin protégées, webhook Stripe.
- **Pas de `.env.example`** complet (backend ni frontend) — livrable n°5.
- **Pas de `CHANGELOG.md`** — livrable n°6.
- **`nextstep.md`** : « nrakhou section apple, apple vedio , share screen + tools : presque done » → tâche restante = **finaliser la vidéo + partage d'écran + outils**.

---

## 6. 🗂️ Ordre de développement proposé (conforme au prompt)

1. **Sécurité des rôles / routes** — corriger Bug #1 (remplacer `restrictTo("instructor")` par une logique `isMonitor || admin`), #2 (`isMonitor` par défaut), #3 (monter `requireEmailVerification`), #4, #5, #6, #9. Tester les 3 rôles sur toutes les routes sensibles.
2. **Finalisation appels vidéo** — TURN optionnel, reconnexion socket, refus explicite, gestion « occupé », permissions refusées, harmoniser les 2 implémentations.
3. **Espace Admin** — gestion utilisateurs (suspendre/bannir/promouvoir/vérifier), modération avis, vue Stripe, logs.
4. **Espace Moniteur** — dashboard mentor (stats, étudiants inscrits, progression), historique paiements reçus, accès aux routes cours corrigées.
5. **Espace Étudiant** — cas limites auth, progression leçons en temps réel, notifications de statut de demande, avis après cours.
6. **Tests** — auth, routes admin, webhook Stripe (idempotence).
7. **Documentation finale** — README, `.env.example`, CHANGELOG, clôture `nextstep.md`.
