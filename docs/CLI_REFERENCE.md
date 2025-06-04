# CLI Reference

***

## Table of Contents

* [CLI Reference](#cli-reference)
  * [Table of Contents](#table-of-contents)
  * [Usage Syntax](#usage-syntax)
  * [Global Options](#global-options)
  * [Commands](#commands)
    * [`wizard`](#wizard)
    * [`plan`](#plan)
    * [`scaffold`](#scaffold)
    * [`code`](#code)
    * [`search`](#search)
    * [`fix-tests`](#fix-tests)
    * [`run-workflow`](#run-workflow)
    * [`plugin:list`](#pluginlist)
    * [`plugin:install`](#plugininstall)
    * [`plugin:remove`](#pluginremove)
    * [`deploy`](#deploy)
    * [`monitor`](#monitor)
  * [Examples](#examples)
    * [Initialize a New Project](#initialize-a-new-project)
    * [Generate or Update Plan](#generate-or-update-plan)
    * [Scaffold from Spec](#scaffold-from-spec)
    * [Generate Code Patch for Task](#generate-code-patch-for-task)
    * [Perform a Contextual Search](#perform-a-contextual-search)
    * [Fix Failing Tests](#fix-failing-tests)
    * [Install a Plugin](#install-a-plugin)
    * [Deploy to AWS](#deploy-to-aws)
  * [Troubleshooting](#troubleshooting)
    * [Common Errors](#common-errors)

***

## Usage Syntax

```sh
npx nootropic <command> [options]
```

* `npx nootropic`: Invokes the nootropic CLI. If installed globally, `nootropic` may be used directly.
* `<command>`: One of the commands listed in the Commands section below.
* `[options]`: Optional flags or parameters to modify command behavior.

***

## Global Options

These options can be applied to any command:

* `-h, --help` Show help information for a command.
* `-V, --version` Display the current version of nootropic.
* `--json` Output results in JSON format.
* `--yaml` Output results in YAML format.
* `--config <path>` Specify a custom path to the configuration file (default: `~/.nootropic/config.json`).
* `--verbose` Enable verbose logging for debugging.

***

## Commands

### `wizard`

Guide the user through an interactive project setup wizard.

* **Syntax:** `npx nootropic wizard [options]`
* **Options:**
  * `--template <name>` Use a specific project template (e.g., `nodejs`, `python`).
  * `--skip-prompts` Run with default values without prompting.

### `plan`

Generate or update the project plan based on the current `project-spec.md`.

* **Syntax:** `npx nootropic plan [options]`
* **Options:**
  * `--output <file>` Write the generated TaskGraph JSON to a custom file.
  * `--delta` Perform a delta replan, updating only changed tasks.
  * `--timeout <secs>` Override the default PDDL solver timeout (default: 60).

### `scaffold`

Create initial project scaffolding based on a spec or template.

* **Syntax:** `npx nootropic scaffold <spec-file> [options]`
* **Arguments:**
  * `<spec-file>` Path to the `project-spec.yaml` or `.md` file.
* **Options:**
  * `--language <lang>` Override language choice (e.g., `js`, `ts`, `python`).
  * `--ci <provider>` Generate CI configuration (e.g., `github`, `gitlab`).
  * `--infra <tool>` Include infrastructure scaffolding (e.g., `terraform`, `pulumi`).

### `code`

Invoke the CoderAgent to generate or modify code based on a task or issue.

* **Syntax:** `npx nootropic code <task-id> [options]`
* **Arguments:**
  * `<task-id>` Identifier of the task to implement (e.g., `T001`).
* **Options:**
  * `--model <model>` Specify the LLM model to use (default: local StarCoder-2).
  * `--dry-run` Display the proposed changes without applying them.
  * `--apply` Automatically apply the generated patch.

### `search`

Search project code, documentation, or memory using the SearchAgent.

* **Syntax:** `npx nootropic search [query] [options]`
* **Arguments:**
  * `[query]` Text to search for (e.g., function name, keyword).
* **Options:**
  * `--lang <language>` Restrict search to a specific language (e.g., `javascript`).
  * `--limit <n>` Return a maximum of `n` results (default: 10).
  * `--json` Output results in JSON format.

### `fix-tests`

Automatically detect and fix failing tests using the ReasoningAgent.

* **Syntax:** `npx nootropic fix-tests [options]`
* **Options:**
  * `--model <model>` Specify the LLM model to use for reasoning (default: local StarCoder-2).
  * `--dry-run` Show proposed fixes without applying.

### `run-workflow`

Trigger a named workflow within the project (e.g., build, deploy).

* **Syntax:** `npx nootropic run-workflow <workflow-name> [options]`
* **Arguments:**
  * `<workflow-name>` Name of the workflow to run (as defined in `workflows/`).
* **Options:**
  * `--env <environment>` Specify environment variables file to load.
  * `--watch` Stream real-time logs of the workflow execution.

### `plugin:list`

List all installed CLI plugins and their versions.

* **Syntax:** `npx nootropic plugin:list`

### `plugin:install`

Install a plugin from the marketplace or local path.

* **Syntax:** `npx nootropic plugin:install <plugin-name> [options]`
* **Arguments:**
  * `<plugin-name>` Name or path of the plugin to install.
* **Options:**
  * `--version <semver>` Install a specific version.
  * `--force` Overwrite if plugin already exists.

### `plugin:remove`

Uninstall a previously installed plugin.

* **Syntax:** `npx nootropic plugin:remove <plugin-name>`
* **Arguments:**
  * `<plugin-name>` Name of the plugin to remove.

### `deploy`

Deploy the current project to a target environment or cloud.

* **Syntax:** `npx nootropic deploy [options]`
* **Options:**
  * `--provider <provider>` Cloud provider (e.g., `aws`, `gcp`, `azure`).
  * `--region <region>` Region or zone to deploy to.
  * `--dry-run` Validate deployment without executing.

### `monitor`

Monitor project health, workflows, and alerts.

* **Syntax:** `npx nootropic monitor [options]`
* **Options:**
  * `--dashboard` Open the monitoring dashboard in a browser.
  * `--poll-interval <sec>` Refresh interval in seconds (default: 30).

***

## Examples

### Initialize a New Project

```sh
npx nootropic wizard --template nodejs
```

### Generate or Update Plan

```sh
npx nootropic plan --output taskgraph.json
```

### Scaffold from Spec

```sh
npx nootropic scaffold project-spec.md --language ts --ci github
```

### Generate Code Patch for Task

```sh
npx nootropic code T005 --model starcoder2-3b-4bit --apply
```

### Perform a Contextual Search

```sh
npx nootropic search "initialize Redis client" --lang javascript --limit 5
```

### Fix Failing Tests

```sh
npx nootropic fix-tests --model starcoder2-3b-4bit --dry-run
```

### Install a Plugin

```sh
npx nootropic plugin:install nootropic-plugin-foo --version ^1.2.0
```

### Deploy to AWS

```sh
npx nootropic deploy --provider aws --region us-west-2 --dry-run
```

***

## Troubleshooting

### Common Errors

* **Missing Configuration File**

  * Error: `Cannot find config file "~/.nootropic/config.json"`
  * **Solution:** Run `npx nootropic wizard` to create a default config, or specify `--config <path>`.

* **Model Download Failures**

  * Error: `Failed to download model"starcoder2-3b-4bit"`
  * **Solution:** Ensure you have sufficient disk space and a stable internet connection. Use `--model` to select a local or alternative model.

* **PDDL Solver Timeout**

  * Error: `Planning failed: solver timed out after 60s`
  * **Solution:** Increase timeout via `npx nootropic plan --timeout 120`, or simplify the project spec to reduce complexity.

* **Indexing Errors**

  * Error: `Chroma index unreachable`
  * **Solution:** Verify that the Chroma server is running (`docker ps`), and check `storageAdapter` config in `~/.nootropic/config.json`.

* **Permission Denied**
  * Error: `EACCES: permission denied, access '<path>'`
  * **Solution:** Adjust file or directory permissions, or run with elevated privileges.

For further assistance, consult the [documentation](https://github.com/your-org/nootropic/docs) or open an issue on the GitHub repository.
