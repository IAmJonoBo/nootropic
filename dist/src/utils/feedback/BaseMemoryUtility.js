import { promises as fs } from 'fs';
/**
 * BaseMemoryUtility: Abstract base class for feedback/memory utilities.
 * Handles aggregation, deduplication, event emission, registry/describe/health compliance, and Zod schema validation.
 * Subclasses should provide filePath, schema, and type-specific logic.
 */
export class BaseMemoryUtility {
    /**
     * Optional event hooks. Subclasses or users can override or assign these.
     */
    onAdd;
    onDeduplicate;
    onAggregate;
    /**
     * Pluggable deduplication. Subclasses can override or assign this function.
     * If not set, uses the default deduplication logic.
     */
    deduplicateFn;
    /**
     * Load all memory entries from the file.
     */
    async loadAll() {
        try {
            const raw = await fs.readFile(this.filePath, 'utf-8');
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed))
                return parsed.filter((m) => this.schema.safeParse(m).success).map((m) => this.schema.parse(m));
            // Support object-of-arrays (e.g., findingId -> memories)
            if (typeof parsed === 'object' && parsed !== null) {
                return Object.values(parsed).flat().filter((m) => this.schema.safeParse(m).success).map((m) => this.schema.parse(m));
            }
            return [];
        }
        catch {
            return [];
        }
    }
    /**
     * Save all memory entries to the file.
     */
    async saveAll(memories) {
        await fs.writeFile(this.filePath, JSON.stringify(memories, null, 2));
    }
    /**
     * Deduplicate memory entries. Subclasses can override for custom logic.
     */
    deduplicate(memories) {
        const seen = new Set();
        return memories.filter(m => {
            // Use id, tool, and memoryType as the deduplication key if present
            const id = m.id;
            const tool = m.tool;
            const memoryType = m.memoryType;
            let key;
            if (id && tool) {
                key = `${id}|${tool}|${memoryType ?? ''}`;
            }
            else {
                key = JSON.stringify(m);
            }
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
    /**
     * Add a memory entry. Triggers onAdd hook if present.
     */
    async add(memory) {
        const all = await this.loadAll();
        all.push(this.schema.parse(memory));
        const deduped = this.deduplicateFn ? this.deduplicateFn(all) : this.deduplicate(all);
        if (this.onDeduplicate)
            await this.onDeduplicate(deduped);
        await this.saveAll(deduped);
        if (this.onAdd)
            await this.onAdd(memory);
    }
    /**
     * List all memory entries (deduplicated).
     */
    async list() {
        const all = await this.loadAll();
        return this.deduplicate(all);
    }
    /**
     * Generic aggregation method. Aggregates memories by a key or custom logic.
     * Triggers onAggregate hook if present.
     */
    async aggregate(by, aggregator) {
        const all = await this.list();
        const groups = {};
        for (const m of all) {
            const key = String(by(m));
            if (!groups[key])
                groups[key] = [];
            groups[key].push(m);
        }
        const result = {};
        for (const key of Object.keys(groups)) {
            result[key] = aggregator(groups[key] ?? []);
        }
        if (this.onAggregate)
            await this.onAggregate(result);
        return result;
    }
    /**
     * Registry/describe compliance.
     */
    describe() {
        return {
            name: this.name,
            description: 'Feedback/memory utility (base class). Subclasses provide type-specific logic.',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://github.com/nootropic/nootropic',
            methods: [
                { name: 'add', signature: '(memory: T) => Promise<void>', description: 'Add a memory entry.' },
                { name: 'list', signature: '() => Promise<T[]>', description: 'List all memory entries.' },
                { name: 'deduplicate', signature: '(memories: T[]) => T[]', description: 'Deduplicate memory entries.' }
            ],
            docsFirst: true,
            aiFriendlyDocs: true,
            schema: this.schema
        };
    }
    async health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
