import { promises as fs } from 'fs';
import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';
import { ZodSchema } from 'zod';

/**
 * BaseMemoryUtility: Abstract base class for feedback/memory utilities.
 * Handles aggregation, deduplication, event emission, registry/describe/health compliance, and Zod schema validation.
 * Subclasses should provide filePath, schema, and type-specific logic.
 */
export abstract class BaseMemoryUtility<T extends object> implements Capability {
  abstract name: string;
  abstract filePath: string;
  abstract schema: ZodSchema<T>;

  /**
   * Optional event hooks. Subclasses or users can override or assign these.
   */
  onAdd?: (memory: T) => Promise<void> | void;
  onDeduplicate?: (memories: T[]) => Promise<void> | void;
  onAggregate?: (result: unknown) => Promise<void> | void;

  /**
   * Pluggable deduplication. Subclasses can override or assign this function.
   * If not set, uses the default deduplication logic.
   */
  deduplicateFn?: (memories: T[]) => T[];

  /**
   * Load all memory entries from the file.
   */
  async loadAll(): Promise<T[]> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((m: unknown) => this.schema.safeParse(m).success).map((m: unknown) => this.schema.parse(m));
      // Support object-of-arrays (e.g., findingId -> memories)
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.values(parsed).flat().filter((m: unknown) => this.schema.safeParse(m).success).map((m: unknown) => this.schema.parse(m));
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Save all memory entries to the file.
   */
  async saveAll(memories: T[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(memories, null, 2));
  }

  /**
   * Deduplicate memory entries. Subclasses can override for custom logic.
   */
  deduplicate(memories: T[]): T[] {
    const seen = new Set<string>();
    return memories.filter(m => {
      // Use id, tool, and memoryType as the deduplication key if present
      const id = (m as any).id;
      const tool = (m as any).tool;
      const memoryType = (m as any).memoryType;
      let key: string;
      if (id && tool) {
        key = `${id}|${tool}|${memoryType ?? ''}`;
      } else {
        key = JSON.stringify(m);
      }
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Add a memory entry. Triggers onAdd hook if present.
   */
  async add(memory: T): Promise<void> {
    const all = await this.loadAll();
    all.push(this.schema.parse(memory));
    const deduped = this.deduplicateFn ? this.deduplicateFn(all) : this.deduplicate(all);
    if (this.onDeduplicate) await this.onDeduplicate(deduped);
    await this.saveAll(deduped);
    if (this.onAdd) await this.onAdd(memory);
  }

  /**
   * List all memory entries (deduplicated).
   */
  async list(): Promise<T[]> {
    const all = await this.loadAll();
    return this.deduplicate(all);
  }

  /**
   * Generic aggregation method. Aggregates memories by a key or custom logic.
   * Triggers onAggregate hook if present.
   */
  async aggregate<K>(by: (memory: T) => K, aggregator: (group: T[]) => unknown): Promise<Record<string, unknown>> {
    const all = await this.list();
    const groups: Record<string, T[]> = {};
    for (const m of all) {
      const key = String(by(m));
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(m);
    }
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(groups)) {
      result[key] = aggregator(groups[key] ?? []);
    }
    if (this.onAggregate) await this.onAggregate(result);
    return result;
  }

  /**
   * Registry/describe compliance.
   */
  describe(): CapabilityDescribe {
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

  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
} 