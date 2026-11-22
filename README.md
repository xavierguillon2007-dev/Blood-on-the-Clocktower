# Clocktower — Grimoire du Conteur

Application statique autonome pour aider le Conteur pendant une partie IRL de Blood on the Clocktower.

## Utilisation
- Pour tester localement, lancer un petit serveur statique dans ce dossier (par exemple `python3 -m http.server 8000`), puis ouvrir `http://localhost:8000`.
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
