import { z } from "zod";
/**
 * @todo Implement agent state schema
 * - Define state validation
 * - Add telemetry fields
 * - Define state transitions
 */
export declare const AgentStateSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    status: z.ZodEnum<["idle", "running", "error"]>;
    lastRun: z.ZodOptional<z.ZodDate>;
    error: z.ZodOptional<z.ZodType<Error, z.ZodTypeDef, Error>>;
    metadata: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    telemetry: z.ZodOptional<
      z.ZodObject<
        {
          startTime: z.ZodDate;
          endTime: z.ZodOptional<z.ZodDate>;
          duration: z.ZodOptional<z.ZodNumber>;
          metrics: z.ZodRecord<z.ZodString, z.ZodNumber>;
        },
        "strip",
        z.ZodTypeAny,
        {
          startTime: Date;
          metrics: Record<string, number>;
          endTime?: Date | undefined;
          duration?: number | undefined;
        },
        {
          startTime: Date;
          metrics: Record<string, number>;
          endTime?: Date | undefined;
          duration?: number | undefined;
        }
      >
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    id: string;
    version: string;
    name: string;
    metadata: Record<string, unknown>;
    status: "error" | "idle" | "running";
    error?: Error | undefined;
    lastRun?: Date | undefined;
    telemetry?:
      | {
          startTime: Date;
          metrics: Record<string, number>;
          endTime?: Date | undefined;
          duration?: number | undefined;
        }
      | undefined;
  },
  {
    id: string;
    version: string;
    name: string;
    metadata: Record<string, unknown>;
    status: "error" | "idle" | "running";
    error?: Error | undefined;
    lastRun?: Date | undefined;
    telemetry?:
      | {
          startTime: Date;
          metrics: Record<string, number>;
          endTime?: Date | undefined;
          duration?: number | undefined;
        }
      | undefined;
  }
>;
export type AgentState = z.infer<typeof AgentStateSchema>;
export declare const AgentCapabilitySchema: z.ZodObject<
  {
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodString;
    parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
  },
  "strip",
  z.ZodTypeAny,
  {
    version: string;
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    dependencies?: string[] | undefined;
  },
  {
    version: string;
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    dependencies?: string[] | undefined;
  }
>;
export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;
