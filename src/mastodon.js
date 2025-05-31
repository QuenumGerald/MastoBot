// Fonctions Mastodon : récupération timeline et réponse
const Mastodon = require('mastodon-api');
const { generateReply } = require('./gemini');
const { canReplyTo, setLastReply } = require('./recentReplies');

const M = new Mastodon({
  access_token: process.env.MASTODON_TOKEN,
  api_url: process.env.MASTODON_API_URL
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

module.exports = { fetchHomeTimeline, replyToStatus };
