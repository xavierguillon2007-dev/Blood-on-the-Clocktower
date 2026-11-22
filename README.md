# Clocktower — Grimoire du Conteur

Application statique autonome pour aider le Conteur pendant une partie IRL de Blood on the Clocktower.

## Utilisation
- Ouvrir `index.html` dans un navigateur pour tester.
- Ajouter les joueurs, attribuer leurs rôles et cliquer sur un siège pour gérer son état.
- Les données sont sauvegardées dans `localStorage` sur cet appareil.
- Utiliser Exporter / Importer pour sauvegarder ou transférer une partie.

## Déploiement sur Vercel
1. Décompresser l'archive.
2. Importer le dossier `clocktower-conteur` dans un dépôt GitHub.
3. Sur Vercel, créer un nouveau projet depuis ce dépôt.
4. Framework Preset : **Other** ; Build Command : laisser vide ; Output Directory : `.`.
5. Déployer.

Aucun backend, aucune clé API et aucune base de données ne sont nécessaires.

## Limites de cette première version
- Le catalogue de rôles inclut les personnages des trois scripts de base (Trouble Brewing, Sects & Violets, Bad Moon Rising), avec possibilité de laisser un rôle non attribué.
- Les rôles et jetons sont des aides de suivi : le site ne remplace pas le livret officiel ni l'ordre de réveil propre à chaque script.
- La sauvegarde locale dépend du navigateur et de l'appareil. Exporter régulièrement la partie est recommandé.

## Déplacement des joueurs
Sur l'onglet Grimoire, cliquer-glisser un siège pour déplacer librement le joueur autour de la table. La position est enregistrée automatiquement dans la sauvegarde locale et incluse dans l'export JSON. Un simple clic ouvre toujours la fiche du joueur.


### Déplacement des sièges
Les sièges peuvent être déplacés librement dans les deux axes (haut/bas et gauche/droite). Les positions sont mémorisées dans la sauvegarde locale et dans l'export JSON.


## Direction artistique
Interface retravaillée dans une esthétique de grimoire gothique : encre bleu-noir, rouge sang, laiton patiné, parchemin, typographies à empattements et éléments moins arrondis. Les fonctionnalités et les données de partie restent inchangées.
