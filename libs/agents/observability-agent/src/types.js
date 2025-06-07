export var MetricType;
(function (MetricType) {
  MetricType["COUNTER"] = "COUNTER";
  MetricType["GAUGE"] = "GAUGE";
  MetricType["HISTOGRAM"] = "HISTOGRAM";
  MetricType["SUMMARY"] = "SUMMARY";
})(MetricType || (MetricType = {}));
export var AggregationType;
(function (AggregationType) {
  AggregationType["SUM"] = "SUM";
  AggregationType["AVG"] = "AVG";
  AggregationType["MIN"] = "MIN";
  AggregationType["MAX"] = "MAX";
  AggregationType["COUNT"] = "COUNT";
})(AggregationType || (AggregationType = {}));
export var LogLevel;
(function (LogLevel) {
  LogLevel["DEBUG"] = "DEBUG";
  LogLevel["INFO"] = "INFO";
  LogLevel["WARN"] = "WARN";
  LogLevel["ERROR"] = "ERROR";
  LogLevel["FATAL"] = "FATAL";
})(LogLevel || (LogLevel = {}));
//# sourceMappingURL=types.js.map
