import { promises as fsp } from 'fs';
import yaml from 'js-yaml';

// Define a type for YAML frontmatter
interface Frontmatter {
  status?: string;
  [key: string]: unknown;
}

// Recursively get all .md files in a directory
async function getAllMarkdownFiles(dir: string): Promise<string[]> {
  let results: string[] = [];
  const list = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = dir + '/' + entry.name;
    if (entry.isDirectory()) {
      results = results.concat(await getAllMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Parse YAML frontmatter for status
async function getStatusFromMarkdown(file: string): Promise<string> {
  if (typeof file !== 'string') return '';
  const content = await fsp.readFile(file, 'utf-8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (match && typeof match[1] === 'string') {
    try {
      const frontmatter = yaml.load(match[1]) as Frontmatter;
      if (
        frontmatter &&
        typeof frontmatter === 'object' &&
        'status' in frontmatter &&
        typeof frontmatter.status === 'string'
      ) {
        return frontmatter.status;
      }
    } catch {}
  }
  // Fallback: check for status in first 10 lines
  const lines = content.split('\n').slice(0, 10).join(' ').toLowerCase();
  if (lines.includes('status: implemented') || lines.includes('status: complete')) return 'implemented';
  if (lines.includes('status: planned') || lines.includes('planned:')) return 'planned';
  if (lines.includes('status: in progress') || lines.includes('in progress')) return 'in progress';
  // Fallback: filename/title heuristics
  const lower = file.toLowerCase();
  if (lower.includes('planned')) return 'planned';
  if (lower.includes('in progress')) return 'in progress';
  return '';
}

async function main() {
  const manifestPath = 'docs/docManifest.json';
  const epicsDir = 'docs/epics';
  const storiesDir = 'docs/stories';
  const manifest = await fsp.readFile(manifestPath, 'utf-8').then(JSON.parse);

  // Enhanced: Recursively scan all .md files in docs/capabilities
  const capRoot = 'docs/capabilities';
  const allMdFiles: string[] = await getAllMarkdownFiles(capRoot);
  const implemented: string[] = [];
  const planned: string[] = [];
  const inProgress: string[] = [];
  const missingStatus: string[] = [];
  for (const file of allMdFiles) {
    const status = await getStatusFromMarkdown(file);
    const name = file.endsWith('.md') ? file.substring(file.lastIndexOf('/') + 1, file.length - 3) : file;
    if (!status) {
      missingStatus.push(file);
      implemented.push(name); // Default to implemented if ambiguous
    } else if (status === 'planned') {
      planned.push(name);
    } else if (status === 'in progress') {
      inProgress.push(name);
    } else {
      implemented.push(name);
    }
  }
  if (missingStatus.length) {
    console.warn('Warning: The following capability docs are missing a status field or have ambiguous status:', missingStatus);
  }

  // Add epics and stories from docs/epics and docs/stories
  const getMarkdownSlugs = async (dir: string) => {
    const files = await fsp.readdir(dir);
    return files.filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''));
  };
  const epics = (await getMarkdownSlugs(epicsDir)).map(slug => ({ slug, docPath: `${epicsDir}/${slug}.md` }));
  const stories = (await getMarkdownSlugs(storiesDir)).map(slug => ({ slug, docPath: `${storiesDir}/${slug}.md` }));

  // Write new manifest
  const newManifest = {
    ...manifest,
    sections: [...implemented, ...epics.map(e => e.slug)],
    planned,
    inProgress,
    epics,
    stories,
    timestamp: new Date().toISOString(),
  };
  await fsp.writeFile(manifestPath, JSON.stringify(newManifest, null, 2));
  console.log(`Doc manifest updated with ${implemented.length} implemented, ${planned.length} planned, ${inProgress.length} in progress, ${epics.length} epics, ${stories.length} stories.`);
}

main().catch(e => { console.error(e); process.exit(1); }); 