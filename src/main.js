// Point d'entrée du bot Mastodon avec BlazerJob
require('dotenv').config();
const { BlazeJob } = require('blazerjob');
const { fetchHomeTimeline, replyToStatus, postStatus, searchAndFollow } = require('./mastodon');

const jobs = new BlazeJob({ dbPath: './tasks.db' });

// Tâche périodique pour lire la timeline et répondre aux nouveaux statuts
// Tâche périodique pour répondre à 50 personnes par jour (toutes les 28min48s)
let replyCursor = 0;
jobs.schedule(async () => {
  const statuses = await fetchHomeTimeline();
  if (!Array.isArray(statuses)) {
    console.error('[Mastodon] fetchHomeTimeline n’a pas retourné un tableau:', statuses);
    return;
  }
  // On ne répond qu'à une seule personne à chaque exécution (pour répartir sur la journée)
  if (statuses.length > 0) {
    // Répond à jusqu'à 3 statuts par cycle, sans dépasser la limite
    const maxReplies = 3;
    let replies = 0;
    for (let i = 0; i < statuses.length && replies < maxReplies; i++) {
      const status = statuses[(replyCursor + i) % statuses.length];
      await replyToStatus(status);
      replies++;
    }
    replyCursor += replies;
  }
}, {
  runAt: new Date(),
  interval: 14 * 60 * 1000 + 24 * 1000 // toutes les 14min24s (2x plus rapide)
});

// Tâche périodique pour publier 5 posts par jour (toutes les ~4h48min)
jobs.schedule(async () => {
  await postStatus();
}, {
  runAt: new Date(Date.now() + 60000), // commence dans 1 min
  interval: 2 * 60 * 60 * 1000 + 24 * 60 * 1000 // toutes les 2h24min (2x plus rapide)
});

// --- Tâche follow automatique répartie sur la journée ---
const followKeywords = [
  'bitcoin', 'ethereum', 'blockchain', 'clippy',
  // Termes Bitcoin spécifiques et techniques
  'hal finney', 'lightning network',
  'segwit', 'UTXO', 'proof of work',
  'bitcoin mining difficulty', 'bitcoin mempool', 'taproot upgrade',
  // Termes Ethereum spécifiques et techniques
  'gavin wood',
  'ethereum merge', 'solidity', 'ERC-20', 'EIP-1559', 'optimistic rollups',
  'layer 2 scaling', 'serenity upgrade', 'casper protocol',
  // Termes blockchain spécifiques et techniques
  'zero knowledge proofs', 'merkle tree', 'consensus algorithm',
  'delegated proof of stake', 'sharding implementation',
  'blockchain interoperability', 'atomic swap',
  // Termes tech spécifiques et profonds
  'arm64 architecture', 'RISC processor', 'quantum computing',
  'neural network optimization',
  'microservice architecture',
  'CUDA parallel computing',
  // Termes Clippy et technologie rétro spécifiques
  'leanne ruzsa-atkinson',
  'kevan atkinson clippy',
  'windows 95 release', 'windows NT kernel', 'MS-DOS commands'
];
let followIndex = 0;

jobs.schedule(async () => {
  // Mot-clé cyclique ou aléatoire
  const keyword = followKeywords[followIndex % followKeywords.length];
  followIndex++;
  // On adapte searchAndFollow pour ne suivre qu'1 utilisateur à chaque exécution
  try {
    await searchAndFollow(keyword, 1); // Limite à 1 user par exécution
  } catch (e) {
    console.error('[FollowJob] Erreur:', e);
  }
}, {
  runAt: new Date(Date.now() + 120000), // commence dans 2 min
  interval: 12 * 60 * 1000 // toutes les 12 minutes (2x plus rapide)
});

jobs.start();
