export var IssueType;
(function (IssueType) {
  IssueType["BUG"] = "BUG";
  IssueType["VULNERABILITY"] = "VULNERABILITY";
  IssueType["CODE_SMELL"] = "CODE_SMELL";
  IssueType["PERFORMANCE"] = "PERFORMANCE";
})(IssueType || (IssueType = {}));
export var Severity;
(function (Severity) {
  Severity["LOW"] = "LOW";
  Severity["MEDIUM"] = "MEDIUM";
  Severity["HIGH"] = "HIGH";
  Severity["CRITICAL"] = "CRITICAL";
})(Severity || (Severity = {}));
export var SuggestionType;
(function (SuggestionType) {
  SuggestionType["REFACTOR"] = "REFACTOR";
  SuggestionType["OPTIMIZE"] = "OPTIMIZE";
  SuggestionType["SECURITY"] = "SECURITY";
  SuggestionType["TEST"] = "TEST";
})(SuggestionType || (SuggestionType = {}));
export var Impact;
(function (Impact) {
  Impact["LOW"] = "LOW";
  Impact["MEDIUM"] = "MEDIUM";
  Impact["HIGH"] = "HIGH";
})(Impact || (Impact = {}));
export var Effort;
(function (Effort) {
  Effort["LOW"] = "LOW";
  Effort["MEDIUM"] = "MEDIUM";
  Effort["HIGH"] = "HIGH";
})(Effort || (Effort = {}));
export var ChangeType;
(function (ChangeType) {
  ChangeType["ADD"] = "ADD";
  ChangeType["MODIFY"] = "MODIFY";
  ChangeType["DELETE"] = "DELETE";
})(ChangeType || (ChangeType = {}));
//# sourceMappingURL=types.js.map
