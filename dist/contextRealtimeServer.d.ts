declare function watchAndRefresh(): void;
declare function startHttpServer(port?: number): void;
declare function startWebSocketServer(port?: number): void;
declare function startRealtimeServer(): void;
export { startRealtimeServer, watchAndRefresh, startHttpServer, startWebSocketServer };
