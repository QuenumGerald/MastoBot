// Point d'entrée du bot Mastodon avec BlazerJob
require('dotenv').config();
const { BlazeJob } = require('blazerjob');
const { fetchHomeTimeline, replyToStatus } = require('./mastodon');

const jobs = new BlazeJob({ dbPath: './tasks.db' });

// Tâche périodique pour lire la timeline et répondre aux nouveaux statuts
jobs.schedule(async () => {
  const statuses = await fetchHomeTimeline();
  for (const status of statuses) {
    // TODO: éviter de répondre plusieurs fois au même statut
    await replyToStatus(status);
  }
}, {
  runAt: new Date(),
  interval: 60000 // toutes les 60 secondes
});

jobs.start();
