const fs = require('fs');
const path = require('path');

const backlogPath = path.join(__dirname, '../agentBacklog.json');
const raw = fs.readFileSync(backlogPath, 'utf-8');
const data = JSON.parse(raw);

function pruneTasks(tasks) {
  if (!Array.isArray(tasks)) return tasks;
  return tasks
    .filter(task => !['complete', 'completed'].includes((task.status || '').toLowerCase()))
    .map(task => {
      if (Array.isArray(task.subtasks)) {
        task.subtasks = pruneTasks(task.subtasks);
      }
      return task;
    });
}

const before = JSON.stringify(data.backlog).length;
data.backlog = pruneTasks(data.backlog);
const after = JSON.stringify(data.backlog).length;

fs.writeFileSync(backlogPath, JSON.stringify(data, null, 2));
console.log(`Pruned completed tasks. Size before: ${before}, after: ${after}`); 