import { Injectable } from "@nestjs/common";
import { Logger, Adapter } from "../../shared/src/logger.js";
import { trace } from "@opentelemetry/api";
import * as os from "os";
import { z } from "zod";
import { LocalModelProvider } from "./providers/local-model.provider.js";
import { CloudModelProvider } from "./providers/cloud-model.provider.js";
import { CostTrackingService } from "./cost-tracking.service.js";

export interface ModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ModelResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 1. Project Specification
const TaskSchema = z.object({
  id: z.string().min(1),
  dependsOn: z.array(z.string()).optional(),
});
const ProjectSpecSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  tasks: z.array(TaskSchema).min(1),
});

// 2. Model Adapter Configuration
const ProviderRoutingSchema = z.object({
  preferredHardware: z.array(z.string()).optional(),
  fallbackProviders: z.array(z.string()).optional(),
});
const ModelMetaSchema = z.object({
  providers: z.array(z.string()).nonempty(),
  routing: ProviderRoutingSchema.optional(),
});
const ModelAdapterConfigSchema = z.object({
  modelMetadata: z.record(ModelMetaSchema),
  hardwareCapabilities: z.array(z.string()).optional(),
  providersConfig: z.record(z.any()).optional(),
});

// 3. Vector Store Configuration
const ChromaConfig = z.object({ path: z.string(), inMemory: z.boolean() });
const LanceConfig = z.object({ directory: z.string(), maxFileSize: z.number() });
const MilvusConfig = z.object({
  host: z.string(),
  port: z.number().int(),
  useGPU: z.boolean().optional(),
});
const VectorStoreConfigSchema = z.object({
  default: z.enum(["chroma", "lance", "milvus"]),
  chroma: ChromaConfig.optional(),
  lance: LanceConfig.optional(),
  milvus: MilvusConfig.optional(),
});

// 4. Orchestration Configuration
const WorkflowConfig = z.object({
  name: z.string(),
  schedule: z.string(), // cron or ISO RRULE
  retry: z
    .object({ maxAttempts: z.number().int(), backoffSeconds: z.number().int() })
    .optional(),
});
const OrchestrationConfigSchema = z.object({
  temporal: z.object({ endpoint: z.string(), namespace: z.string() }),
  workflows: z.array(WorkflowConfig),
});

// 5. Plugin System Configuration
const PluginManifestSchema = z.object({
  name: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  capabilities: z.array(z.string()).nonempty(),
  commands: z.record(z.string(), z.string()),
});
const PluginSystemConfigSchema = z.object({
  pluginDirs: z.array(z.string()),
  manifests: z.array(PluginManifestSchema),
});

// 6. Development Environment Configuration
const NxConfigSchema = z.object({
  defaultBase: z.string().optional(),
  parallel: z.number().int().min(1).optional(),
  cacheableOps: z.array(z.string()),
});
const EnvConfigSchema = z.record(z.string(), z.string());
const DevelopmentConfigSchema = z.object({
  nx: NxConfigSchema,
  env: EnvConfigSchema,
  dockerComposeFile: z.string().optional(),
});

// 7. Storage Configuration
const SQLConfig = z.object({
  type: z.enum(["sqlite", "postgres"]),
  connectionString: z.string(),
});
const NoSQLConfig = z.object({
  type: z.enum(["redis", "leveldb"]),
  host: z.string().optional(),
  port: z.number().int().optional(),
  directory: z.string().optional(),
});
const StorageConfigSchema = z.object({
  relational: SQLConfig,
  nosql: NoSQLConfig,
  objectStore: z.object({
    provider: z.enum(["minio", "s3", "gcs"]),
    bucket: z.string(),
    endpoint: z.string().optional(),
  }),
  backups: z.object({
    schedule: z.string(),
    retentionDays: z.number().int(),
  }),
});

// 8. API Configuration
const EndpointConfig = z.object({
  path: z.string(),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  auth: z.boolean().optional(),
});
const ApiConfigSchema = z.object({
  rest: z.array(EndpointConfig),
  grpc: z.array(z.string()),
  versioning: z.enum(["uri", "header", "mediaType"]).optional(),
  rateLimit: z.object({ windowMs: z.number().int(), max: z.number().int() }),
});

// 9. Security Configuration
const AuthConfig = z.object({
  oauth: z.object({
    issuer: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    scopes: z.array(z.string()),
  }),
  jwt: z.object({ publicKey: z.string(), tokenExpiry: z.string() }),
});
const RbacConfig = z.record(z.string(), z.array(z.string()));
const SecurityConfigSchema = z.object({
  auth: AuthConfig,
  rbac: RbacConfig,
  opaPolicies: z.array(z.string()).optional(),
});

// 10. Root Configuration
export const NootropicConfigSchema = z.object({
  project: ProjectSpecSchema,
  modelAdapter: ModelAdapterConfigSchema,
  vectorStore: VectorStoreConfigSchema,
  orchestration: OrchestrationConfigSchema,
  plugins: PluginSystemConfigSchema,
  development: DevelopmentConfigSchema,
  storage: StorageConfigSchema,
  api: ApiConfigSchema,
  security: SecurityConfigSchema,
});

// Usage:
// const config = NootropicConfigSchema.parse(userConfig);

@Injectable()
export class ModelAdapter implements Adapter {
  id = "model-adapter";
  name = "Model Adapter";
  version = "1.0.0";
  private readonly logger = new Logger();

  private providers: Record<string, (LocalModelProvider | CloudModelProvider)[]> = {};
  private costTrackingService: CostTrackingService;
  private modelMetadata: Record<string, any> = {};
  private routingTable: Record<string, string[]> = {};
  private hardwareCapabilities: string[] = [];

  constructor() {
    this.costTrackingService = new CostTrackingService();
  }

  async initialize(config: unknown): Promise<void> {
    const parsed = ModelAdapterConfigSchema.safeParse(config);
    if (!parsed.success) {
      this.logger.error("Invalid model adapter configuration", parsed.error);
      throw new Error("Invalid model adapter configuration");
    }
    const { modelMetadata, hardwareCapabilities, providersConfig } = parsed.data;

    this.modelMetadata = modelMetadata;
    this.hardwareCapabilities =
      hardwareCapabilities && hardwareCapabilities.length > 0
        ? hardwareCapabilities
        : this.detectHardwareCapabilities();

    // Build routing table based on model metadata and hardware capabilities
    for (const [modelName, meta] of Object.entries(this.modelMetadata)) {
      const preferredHardware = meta.routing?.preferredHardware || [];
      const fallbackProviders = meta.routing?.fallbackProviders || [];
      const availableProviders = meta.providers || [];

      // Filter providers by hardware capabilities if preferredHardware specified
      let orderedProviders: string[];
      if (preferredHardware.length > 0) {
        orderedProviders = availableProviders.filter((p: string) =>
          preferredHardware.some((hw: string) => this.hardwareCapabilities.includes(hw))
        );
        // Append fallback providers that are available
        orderedProviders = orderedProviders.concat(
          fallbackProviders.filter((p: string) => !orderedProviders.includes(p) && availableProviders.includes(p))
        );
      } else {
        orderedProviders = availableProviders;
      }
      this.routingTable[modelName] = orderedProviders;
    }

    // Instantiate providers
    for (const providerName of new Set(Object.values(this.modelMetadata).flatMap((m) => m.providers))) {
      if (providerName.startsWith("local")) {
        this.providers[providerName] = [
          new LocalModelProvider(providersConfig?.[providerName] || {}, this.logger),
        ];
      } else if (providerName.startsWith("cloud")) {
        this.providers[providerName] = [
          new CloudModelProvider(providersConfig?.[providerName] || {}, this.logger),
        ];
      } else {
        this.logger.warn(`Unknown provider type for provider ${providerName}`);
        this.providers[providerName] = [];
      }
    }
  }

  async connect(): Promise<void> {
    for (const [providerName, providers] of Object.entries(this.providers)) {
      for (const provider of providers) {
        try {
          await provider.connect();
          this.logger.info(`Connected to provider ${providerName}`);
        } catch (err) {
          this.logger.error(`Error connecting to provider ${providerName}: ${err}`);
          throw err;
        }
      }
    }
  }

  async disconnect(): Promise<void> {
    for (const [providerName, providers] of Object.entries(this.providers)) {
      for (const provider of providers) {
        try {
          await provider.disconnect();
          this.logger.info(`Disconnected from provider ${providerName}`);
        } catch (err) {
          this.logger.error(`Error disconnecting from provider ${providerName}: ${err}`);
          throw err;
        }
      }
    }
  }

  async generate(config: ModelConfig, prompt: string): Promise<ModelResponse> {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttribute("model", config.model);
      if (config.temperature !== undefined) {
        span.setAttribute("temperature", config.temperature);
      }
      if (config.maxTokens !== undefined) {
        span.setAttribute("maxTokens", config.maxTokens);
      }
    }

    const providers = this.selectProvider(config.model);
    if (!providers || providers.length === 0) {
      throw new Error(`No providers available for model ${config.model}`);
    }

    let lastError: Error | null = null;
    for (const providerName of providers) {
      const providerInstances = this.providers[providerName];
      if (!providerInstances || providerInstances.length === 0) {
        continue;
      }

      for (const provider of providerInstances) {
        try {
          const response = await provider.generate(prompt, config);
          await this.costTrackingService.track(config.model, response.usage);
          return response;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          this.logger.warn(`Provider ${providerName} failed: ${lastError.message}`);
        }
      }
    }

    throw lastError || new Error(`All providers failed for model ${config.model}`);
  }

  selectProvider(modelName: string): string[] {
    return this.routingTable[modelName] || [];
  }

  private detectHardwareCapabilities(): string[] {
    const caps: string[] = [];
    const cpus = os.cpus();
    if (cpus && cpus.length > 0) {
      caps.push("cpu");
      if (cpus[0].model.toLowerCase().includes("intel")) {
        caps.push("intel-cpu");
      }
      if (cpus[0].model.toLowerCase().includes("amd")) {
        caps.push("amd-cpu");
      }
    }
    if (os.platform() === "linux") {
      caps.push("linux");
    } else if (os.platform() === "darwin") {
      caps.push("macos");
    } else if (os.platform() === "win32") {
      caps.push("windows");
    }
    // Add GPU detection if needed, placeholder:
    // caps.push("gpu");
    return caps;
  }
}
