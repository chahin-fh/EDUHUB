# Changelog EDUHUB

Toutes les modifications notables du projet, module par module.

## Module 8 — Documentation
- `README.md` réécrit intégralement : stack réelle, installation (frontend + backend), variables d'environnement, structure, fonctionnalités, endpoints, tests.
- `backend/.env.example` et `frontend/.env.example` créés (modèles complets des variables requises).
- `CHANGELOG.md` créé.
- `nextstep.md` clôturé (module d'appels vidéo finalisé).

## Module 7 — Tests
- Suite de tests unitaires créée avec le runner natif **`node:test`** (aucun package à installer, aucun accès MongoDB requis — modèles mockés via `require.cache`).
- `backend/tests/auth.test.js` : gardes d'inscription/connexion (champs manquants, email invalide, mot de passe court, doublon → 400), succès → 201 + token, vérification/renvoi d'email.
- `backend/tests/middleware.test.js` : `protect` (401 sans token, token invalide, token expiré, token valide → `next()`), `adminOnly`, `monitorOnly`, `adminOrMonitorOnly` (403 pour les rôles non autorisés, `next()` pour les rôles légitimes).
- `backend/tests/payment.test.js` : webhook sans signature → 400, événement non lié accusé, **idempotence** du `checkout.session.completed` (aucun doublon d'inscription, un seul incrément de `studentsEnrolled`), session de checkout (404 cours inexistant, succès), historique vide.
- **Durcissement de l'idempotence du webhook** (`paymentController.webhookCheckout`) : l'heuristique temporelle fragile (`createdAt` vs `updatedAt` < 2 s) est remplacée par une vérification explicite `findOne({ student, course })` — si l'inscription existe déjà (webhook rejoué), on ne fait qu'une mise à jour des champs de paiement **sans** ré-incrémenter `studentsEnrolled` ; l'incrément n'a lieu qu'à la création.
- Script `npm test` ajouté au `package.json` backend.

## Module 6 — Espace Étudiant
- **Progression des leçons en temps réel** : la page `/cours/[id]` affiche désormais le contenu du cours (modules/leçons) pour les inscrits, avec cases à cocher « leçon terminée », icônes par type (vidéo/texte/quiz/devoir), modules repliables et barre de progression globale ; appel à `PATCH /api/courses/:id/progress` avec état local optimiste.
- **Notification temps réel du statut de demande** : `backend/index.js` expose l'instance Socket.io via `app.set('io', io)` ; `matchingController.respondToMatchRequest` émet `match-request-updated` dans la room de l'étudiant (avec message en français) ; la page `/demandes` écoute l'événement, affiche un toast et rafraîchit la liste.

## Module 5 — Espace Moniteur
- Nouvel endpoint `GET /api/monitor/stats` (protégé par `protect, monitorOnly`) : nombre de cours, étudiants uniques, revenus (somme des paiements `completed`), note moyenne depuis les avis, taux de complétion moyen, stats par cours et inscriptions récentes. Refactor en `Map` (O(n)) sur les conseils du relecteur.
- Nouveau composant `frontend/components/dashboard/mentor-overview.tsx` : bannière de vérification, 4 cartes de statistiques, liste des cours (inscrits, revenus, statut), inscriptions récentes avec barres de progression.
- `/dashboard` : sélecteur de vue **Étudiant / Moniteur** pour les moniteurs et admins ; le fetch des stats étudiant est évité quand la vue moniteur est active (anti-429) ; les sections étudiant sont groupées dans un fragment JSX.

## Module 4 — Espace Admin
- `adminController.updateUser` : la déclassification d'un moniteur (`isMonitor: false`) retire aussi la vérification du profil mentor (`monitorProfile.verified = false`), cohérent avec `deleteUser`.
- Statistiques admin réelles depuis `/api/stats/admin` (activités récentes, messages récents, taux d'engagement).
- Gestion des matières : ajout de la catégorie et de l'icône dans `subjectController` (`addSubject`/`updateSubject`), design des pages admin refondu.

## Module 3 — Appels vidéo (WebRTC)
- Finalisation du module d'appels : gestion de la **déconnexion pendant un appel** (fin d'appel + nettoyage), **refus / ligne occupée** (émission `hangUp` vers l'appelant), annulation de l'appel pendant la sonnerie (`end-call`), gestion des permissions caméra/micro refusées, partage d'écran.
- Signalisation entièrement via Socket.io (candidats ICE, acceptation, refus, fin).

## Module 2 — Sécurité des rôles / routes
- Middlewares `adminOnly`, `monitorOnly`, `adminOrMonitorOnly` appliqués sur toutes les routes sensibles (admin, moniteur, paiements, statistiques).
- Vérification systématique du rôle requis sur `/api/**` et redirections frontend pour les accès non autorisés.

## Module 1 — Audit
- `AUDIT.md` : état des lieux détaillé (fonctionnalités complètes, partielles, bugs identifiés).

## Correctifs antérieurs (pré-audit)
- **Erreur 429 « Trop de requêtes »** sur `/users` : suppression du double-fetch initial (React StrictMode), réduction des requêtes superflues côté chat, meilleure gestion du rate-limiting.
- **Erreur 500 sur le filtrage par matière** dans `/users` : résolution correcte du nom de matière vers son `ObjectId` côté backend.
- **Statistiques réelles** sur l'accueil (`/api/stats/home`), `/admin` (`/api/stats/admin`) et `/dashboard` (`/api/stats/dashboard`) avec graphiques Recharts (plus aucune valeur codée en dur).
- **Paiements Stripe** : webhook déplacé avant `bodyParser` (body brut), traitement **idempotent** de `checkout.session.completed` (pas de doublon d'inscription ni de double incrément de `studentsEnrolled`), URL de retour `/cours/:id?success|cancelled`, historique des paiements (`GET /api/payment/history`) et page `/paiements`.
- **Stripe non configuré** : `config/stripe.js` renvoie désormais un proxy avec une erreur claire en français au lieu de crasher le serveur.
- **Suppression de l'OAuth Google** (passport-google-oauth20) : authentification JWT uniquement, retrait des routes `/api/auth/google*` et de la page `/auth/callback`.
- **Fix du design de la partie Explorer** dans `/profile` (objet React illégal rendu comme enfant).
- **Amélioration du design de la page d'ajout des matières** (formulaire refondu, ajout multiple, catégories).
