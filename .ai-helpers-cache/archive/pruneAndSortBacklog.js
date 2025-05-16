const fs = require('fs');
const path = require('path');

const BACKLOG_PATH = path.resolve(__dirname, '../agentBacklog.json');
const SCRIPT_PATH = __filename;

const PRIORITY_ORDER = [
  'top',
  'high',
  'medium',
  'partial',
  'in progress',
  'planned',
  'future',
  'not started'
];

function priorityRank(priority) {
  if (!priority) return PRIORITY_ORDER.length + 1;
  const idx = PRIORITY_ORDER.indexOf(priority.toLowerCase());
  return idx === -1 ? PRIORITY_ORDER.length + 1 : idx;
}

function sortByPriority(arr) {
  return arr.slice().sort((a, b) => {
    return priorityRank(a.priority) - priorityRank(b.priority);
  });
}

function pruneAndSortBacklog(backlog) {
  // Remove completed epics and completed subtasks
  const pruned = backlog.filter(epic => epic.status !== 'complete');
  for (const epic of pruned) {
    if (Array.isArray(epic.subtasks)) {
      epic.subtasks = epic.subtasks.filter(st => st.status !== 'complete');
      epic.subtasks = sortByPriority(epic.subtasks);
    }
  }
  return sortByPriority(pruned);
}

function main() {
  const raw = fs.readFileSync(BACKLOG_PATH, 'utf8');
  const data = JSON.parse(raw);
  if (Array.isArray(data.backlog)) {
    data.backlog = pruneAndSortBacklog(data.backlog);
  }
  fs.writeFileSync(BACKLOG_PATH, JSON.stringify(data, null, 2));
  fs.unlinkSync(SCRIPT_PATH);
}

main(); 