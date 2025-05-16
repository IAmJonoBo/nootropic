# updateNotifier

Notifies users of available package updates via CLI. Useful for keeping AI-Helpers up to date.

**Usage:**

`import updateNotifierCapability from 'ai-helpers/utils/describe/updateNotifier'; updateNotifierCapability.checkForUpdates();`

## Methods/Functions

- **checkForUpdates**: () => void - Checks for updates and notifies the user via CLI.

## Schema

```json
{
  "checkForUpdates": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "null",
      "description": "No output (side effect: CLI notification)"
    }
  }
}
```
## References

- https://www.npmjs.com/package/update-notifier

