// Gestion des dates de dernière réponse à chaque utilisateur
const fs = require('fs');
const path = require('path');
const FILE_PATH = path.join(__dirname, '../recent_replies.json');

function loadRecentReplies() {
  if (!fs.existsSync(FILE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
  } catch (e) {
    return {};
  }
}

function saveRecentReplies(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

function canReplyTo(account, now = new Date()) {
  const data = loadRecentReplies();
  const last = data[account];
  if (!last) return true;
  const lastDate = new Date(last);
  const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);
  return diffDays >= 15;
}

function setLastReply(account, date = new Date()) {
  const data = loadRecentReplies();
  data[account] = date.toISOString();
  saveRecentReplies(data);
}

module.exports = { canReplyTo, setLastReply };
