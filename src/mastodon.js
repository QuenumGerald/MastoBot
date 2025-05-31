// Fonctions Mastodon : récupération timeline et réponse
const Mastodon = require('mastodon-api');
const { generateReply, generatePost } = require('./gemini');
const { canReplyTo, setLastReply } = require('./recentReplies');

// Utilise OAuth2 :
// - MASTODON_BASE_URL : ex https://mastodon.social
// - MASTODON_ACCESS_TOKEN : token généré via le flow OAuth2
// Pour générer ce token, voir la documentation OAuth2 de Mastodon.
const M = new Mastodon({
  access_token: process.env.MASTODON_ACCESS_TOKEN,
  api_url: `https://mastodon.social/api/v1/`
});

async function fetchHomeTimeline() {
  const resp = await M.get('timelines/home', { limit: 5 });
  return resp.data;
}

async function replyToStatus(status) {
  const account = status.account.acct;
  if (!canReplyTo(account)) {
    console.log(`[Mastodon] Pas de réponse à ${account} (délai 15j non écoulé)`);
    return;
  }
  const reply = await generateReply(status.content);
  await M.post('statuses', {
    status: `@${account} ${reply}`,
    in_reply_to_id: status.id
  });
  setLastReply(account);
  console.log(`[Mastodon] Répondu à ${account}`);
}

async function postStatus(contextInfo = '') {
  const post = await generatePost(contextInfo);
  await M.post('statuses', {
    status: post
  });
  console.log('[Mastodon] Post publié:', post);
}

async function followAccount(accountId, username = null) {
  try {
    const resp = await M.post(`accounts/${accountId}/follow`);
    console.log(`[Mastodon] Suivi de l'utilisateur ${accountId}${username ? ' (@' + username + ')' : ''} effectué. Réponse API :`, JSON.stringify(resp.data));
    return resp.data;
  } catch (err) {
    console.error(`[Mastodon] Erreur lors du suivi de ${accountId}:`, err);
    throw err;
  }
}

async function searchAndFollow(keyword, limit = 10) {
  try {
    // Recherche de statuts publics contenant le mot-clé
    const resp = await M.get('search', { q: keyword, type: 'statuses', resolve: true, limit: 10 });
    const statuses = resp.data.statuses || [];
    if (statuses.length === 0) {
      console.log(`[Mastodon] Aucun utilisateur trouvé pour le mot-clé : ${keyword}`);
      return;
    }
    const userMap = new Map();
    for (const status of statuses) {
      if (status.account && status.account.id) {
        userMap.set(status.account.id, status.account.acct || null);
      }
    }
    let count = 0;
    for (const [id, username] of userMap.entries()) {
      if (count >= limit) break;
      await followAccount(id, username);
      count++;
    }
    if (count === 0) {
      console.log(`[Mastodon] Aucun follow effectué pour le mot-clé : ${keyword}`);
    } else {
      console.log(`[Mastodon] Recherche et follow terminé pour le mot-clé : ${keyword} (limit ${limit})`);
    }
  } catch (err) {
    console.error(`[Mastodon] Erreur dans searchAndFollow(${keyword}):`, err);
    throw err;
  }
}

module.exports = { fetchHomeTimeline, replyToStatus, postStatus, followAccount, searchAndFollow };

