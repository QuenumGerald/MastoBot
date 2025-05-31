# MastoBot

Bot Mastodon qui répond automatiquement aux messages de la timeline home grâce à l'API Gemini, orchestré par BlazerJob.

## Installation

```bash
npm install blazerjob mastodon-api node-fetch dotenv
```

## Configuration

Copiez `.env.example` vers `.env` et remplissez les valeurs :

```
cp .env.example .env
```

## Lancer le bot

```bash
node src/main.js
```

## Personnalisation
- Adaptez `src/gemini.js` selon l'API réelle Gemini utilisée.
- Ajoutez une logique de stockage pour éviter de répondre plusieurs fois au même statut.
