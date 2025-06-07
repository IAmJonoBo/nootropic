import { Worker } from "@temporalio/worker";
import { Logger } from "@nootropic/shared";
/**
 * @todo Implement Temporal worker
 * - Configure task queues
 * - Set up workflows
 * - Set up activities
 * - Add error handling
 * - Add monitoring
 */
const logger = new Logger();
async function run() {
  try {
    // TODO: Configure worker options
    const worker = await Worker.create({
      taskQueue: "nootropic",
      workflowsPath: require.resolve("./workflows"),
      activities: require("./activities"),
    });
    await worker.run();
    logger.info("Temporal worker started");
  } catch (error) {
    logger.error("Failed to start Temporal worker", error);
    process.exit(1);
  }
}
run().catch((error) => {
  logger.error("Unhandled error in Temporal worker", error);
  process.exit(1);
});
//# sourceMappingURL=index.js.map
