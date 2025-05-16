const fs = require('fs');
const path = require('path');

const BACKLOG_PATH = path.resolve(__dirname, '../agentBacklog.json');
const SCRIPT_PATH = __filename;

function removeDone(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(item => {
    const status = (item.status || '').toLowerCase();
    return status !== 'done' && status !== 'completed' && status !== 'complete';
  });
}

function main() {
  const raw = fs.readFileSync(BACKLOG_PATH, 'utf8');
  const data = JSON.parse(raw);
  if (Array.isArray(data.completed)) data.completed = [];
  ['inProgress', 'planned', 'backlog'].forEach(key => {
    if (Array.isArray(data[key])) {
      data[key] = removeDone(data[key]);
    }
  });
  fs.writeFileSync(BACKLOG_PATH, JSON.stringify(data, null, 2));
  // Delete this script after execution
  fs.unlinkSync(SCRIPT_PATH);
}

main(); 