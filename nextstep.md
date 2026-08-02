# nextstep.md — État des tâches

## ✅ Module d'appels vidéo / partage d'écran (WebRTC) — TERMINÉ

La section précédente listait les cas limites restants des appels vidéo. Tout est désormais traité :

- ✅ Déconnexion pendant un appel → fin d'appel propre + nettoyage des ressources (`hangUp`, arrêt des tracks)
- ✅ Refus d'appel / ligne occupée → `hangUp` renvoyé à l'appelant, sonnerie arrêtée
- ✅ Annulation de l'appel pendant la sonnerie → `end-call` notifié au destinataire
- ✅ Permissions caméra / micro refusées → message d'erreur clair, appel non lancé
- ✅ Partage d'écran fonctionnel pendant l'appel
- ✅ Signalisation complète via Socket.io (candidats ICE, offer/answer, accept/refuse/end)
- ✅ Salles Socket.io isolées par conversation/appel, gestion des déconnexions sans fuite de listeners

Le module d'appels vidéo est **finalisé à 100%**.

## ✅ Finalisation globale du projet (audit → docs)

- ✅ Audit initial (`AUDIT.md`)
- ✅ Sécurité des rôles / routes
- ✅ Appels vidéo (ci-dessus)
- ✅ Espace Admin
- ✅ Espace Moniteur
- ✅ Espace Étudiant
- ✅ Tests (auth, middlewares de rôles, webhook Stripe — `npm test`)
- ✅ Documentation (`README.md`, `.env.example` backend + frontend, `CHANGELOG.md`)
