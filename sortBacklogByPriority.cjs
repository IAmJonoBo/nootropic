const fs = require('fs');
const path = require('path');

const BACKLOG_PATH = path.resolve(__dirname, '../agentBacklog.json');
const SCRIPT_PATH = __filename;

function priorityRank(priority) {
  switch ((priority || '').toLowerCase()) {
    case 'top': return 1;
    case 'high': return 2;
    case 'medium': return 3;
    case 'low': return 4;
    default: return 5;
  }
}

function sortArrayByPriority(arr) {
  return arr.slice().sort((a, b) => {
    return priorityRank(a.priority) - priorityRank(b.priority);
  });
}

function main() {
  const raw = fs.readFileSync(BACKLOG_PATH, 'utf8');
  const data = JSON.parse(raw);
  ['completed', 'inProgress', 'planned'].forEach(key => {
    if (Array.isArray(data[key])) {
      data[key] = sortArrayByPriority(data[key]);
    }
  });
  fs.writeFileSync(BACKLOG_PATH, JSON.stringify(data, null, 2));
  // Delete this script after execution
  fs.unlinkSync(SCRIPT_PATH);
}

main(); 