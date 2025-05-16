// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import { promises as fs } from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';

const PLUGIN_FEEDBACK_PATH = path.join('.nootropic-cache', 'plugin-feedback.json');

export type PluginFeedback = {
  pluginName: string;
  user: string;
  rating: number; // 1-5
  review?: string;
  timestamp: string;
};

export type PluginFeedbackAggregate = {
  pluginName: string;
  averageRating: number;
  reviewCount: number;
  ratings: number[];
  reviews: { user: string; review: string; timestamp: string }[];
};

/**
 * Submit feedback for a plugin.
 */
// @ts-expect-error TS(6133): 'feedback' is declared but its value is never read... Remove this comment to see the full error message
export async function submitPluginFeedback(feedback: PluginFeedback): Promise<void> {
  // @ts-expect-error TS(2304): Cannot find name 'all'.
  const all = await loadAllPluginFeedback();
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  all.push(feedback);
  // @ts-expect-error TS(2304): Cannot find name 'all'.
  await fs.writeFile(PLUGIN_FEEDBACK_PATH, JSON.stringify(all, null, 2));
}

/**
 * Load all plugin feedback entries.
 */
export async function loadAllPluginFeedback(): Promise<PluginFeedback[]> {
  try {
    // @ts-expect-error TS(2304): Cannot find name 'raw'.
    const raw = await fs.readFile(PLUGIN_FEEDBACK_PATH, 'utf-8');
    // @ts-expect-error TS(2304): Cannot find name 'raw'.
    return JSON.parse(raw) as PluginFeedback[];
  } catch {
    return [];
  }
}

/**
 * List all feedback for a given plugin.
 */
// @ts-expect-error TS(6133): 'pluginName' is declared but its value is never re... Remove this comment to see the full error message
export async function listFeedbackForPlugin(pluginName: string): Promise<PluginFeedback[]> {
  // @ts-expect-error TS(2304): Cannot find name 'all'.
  const all = await loadAllPluginFeedback();
  // @ts-expect-error TS(2304): Cannot find name 'all'.
  return all.filter(fb => fb.pluginName === pluginName);
}

/**
 * Aggregate feedback for a plugin (average rating, review count, etc).
 */
// @ts-expect-error TS(6133): 'pluginName' is declared but its value is never re... Remove this comment to see the full error message
export async function aggregatePluginFeedback(pluginName: string): Promise<PluginFeedbackAggregate> {
  // @ts-expect-error TS(2304): Cannot find name 'feedbacks'.
  const feedbacks = await listFeedbackForPlugin(pluginName);
  // @ts-expect-error TS(2304): Cannot find name 'ratings'.
  const ratings = feedbacks.map(fb => fb.rating);
  // @ts-expect-error TS(2304): Cannot find name 'reviews'.
  const reviews = feedbacks.filter(fb => fb.review).map(fb => ({ user: fb.user, review: fb.review!, timestamp: fb.timestamp }));
  // @ts-expect-error TS(2304): Cannot find name 'averageRating'.
  const averageRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  return {
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    pluginName,
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    averageRating,
    // @ts-expect-error TS(2304): Cannot find name 'reviews'.
    reviewCount: reviews.length,
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    ratings,
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    reviews
  };
}

const pluginFeedbackCapability: Capability = {
  name: 'pluginFeedback',
  describe(): CapabilityDescribe {
    return {
      name: 'pluginFeedback',
      description: 'Submit, list, and aggregate plugin feedback (rating, review, social memory).',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/nootropic/nootropic',
      methods: [
        { name: 'submitPluginFeedback', signature: '(feedback: PluginFeedback) => Promise<void>', description: 'Submit feedback for a plugin.' },
        { name: 'listFeedbackForPlugin', signature: '(pluginName: string) => Promise<PluginFeedback[]>', description: 'List all feedback for a plugin.' },
        { name: 'aggregatePluginFeedback', signature: '(pluginName: string) => Promise<PluginFeedbackAggregate>', description: 'Aggregate feedback for a plugin.' }
      ],
      // @ts-expect-error TS(2322): Type '{ name: string; description: string; license... Remove this comment to see the full error message
      schema: {
        submitPluginFeedback: {
          input: {
            type: 'object',
            properties: {
              pluginName: { type: 'string' },
              user: { type: 'string' },
              rating: { type: 'number', minimum: 1, maximum: 5 },
              review: { type: 'string' },
              timestamp: { type: 'string' }
            },
            required: ['pluginName', 'user', 'rating', 'timestamp']
          },
          // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
          output: { type: 'null', description: 'No output (side effect: feedback stored)' }
        },
        listFeedbackForPlugin: {
          // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
          input: { type: 'object', properties: { pluginName: { type: 'string' } }, required: ['pluginName'] },
          // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
          output: { type: 'array', items: { type: 'object' }, description: 'Array of PluginFeedback' }
        },
        aggregatePluginFeedback: {
          // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
          input: { type: 'object', properties: { pluginName: { type: 'string' } }, required: ['pluginName'] },
          // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
          output: { type: 'object', description: 'PluginFeedbackAggregate' }
        }
      },
      // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
      usage: "import { submitPluginFeedback, listFeedbackForPlugin, aggregatePluginFeedback } from 'nootropic/utils/feedback/pluginFeedback';",
      // @ts-expect-error TS(2304): Cannot find name 'docsFirst'.
      docsFirst: true,
      // @ts-expect-error TS(2304): Cannot find name 'aiFriendlyDocs'.
      aiFriendlyDocs: true,
      // @ts-expect-error TS(2304): Cannot find name 'references'.
      references: [],
      promptTemplates: [
        {
          name: 'Submit Plugin Feedback',
          description: 'Prompt for instructing the agent or LLM to submit feedback for a plugin, including rating, user, and optional review.',
          template: 'Submit feedback for the plugin named "{{pluginName}}" from user "{{user}}" with a rating of {{rating}} and review: {{review}}. Timestamp: {{timestamp}}.',
          usage: 'Used by submitPluginFeedback to collect and store plugin feedback.'
        },
        {
          name: 'List Plugin Feedback',
          description: 'Prompt for instructing the agent or LLM to list all feedback for a given plugin.',
          template: 'List all feedback entries for the plugin named "{{pluginName}}".',
          usage: 'Used by listFeedbackForPlugin to retrieve feedback for a plugin.'
        },
        {
          name: 'Aggregate Plugin Feedback',
          description: 'Prompt for instructing the agent or LLM to aggregate feedback for a plugin (average rating, review count, etc.).',
          template: 'Aggregate feedback for the plugin named "{{pluginName}}" and return average rating, review count, and recent reviews.',
          usage: 'Used by aggregatePluginFeedback to summarize plugin feedback.'
        }
      ]
    };
  },
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  },
  // @ts-expect-error TS(2304): Cannot find name 'init'.
  init: async function() {},
  // @ts-expect-error TS(1344): 'A label is not allowed here.
  reload: async function() {},
};

export default pluginFeedbackCapability; 