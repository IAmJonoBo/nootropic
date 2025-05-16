declare module 'update-notifier' {
  interface UpdateNotifierOptions {
    pkg: Record<string, unknown>;
  }
  interface Notifier {
    notify(options?: { defer?: boolean }): void;
  }
  function updateNotifier(options: UpdateNotifierOptions): Notifier;
  export = updateNotifier;
} 