export var ProjectStatus;
(function (ProjectStatus) {
  ProjectStatus["PLANNING"] = "PLANNING";
  ProjectStatus["ACTIVE"] = "ACTIVE";
  ProjectStatus["ON_HOLD"] = "ON_HOLD";
  ProjectStatus["COMPLETED"] = "COMPLETED";
  ProjectStatus["CANCELLED"] = "CANCELLED";
})(ProjectStatus || (ProjectStatus = {}));
export var TaskStatus;
(function (TaskStatus) {
  TaskStatus["TODO"] = "TODO";
  TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
  TaskStatus["REVIEW"] = "REVIEW";
  TaskStatus["DONE"] = "DONE";
})(TaskStatus || (TaskStatus = {}));
export var ResourceType;
(function (ResourceType) {
  ResourceType["HUMAN"] = "HUMAN";
  ResourceType["MACHINE"] = "MACHINE";
  ResourceType["TOOL"] = "TOOL";
})(ResourceType || (ResourceType = {}));
export var DependencyType;
(function (DependencyType) {
  DependencyType["FINISH_TO_START"] = "FINISH_TO_START";
  DependencyType["START_TO_START"] = "START_TO_START";
  DependencyType["FINISH_TO_FINISH"] = "FINISH_TO_FINISH";
  DependencyType["START_TO_FINISH"] = "START_TO_FINISH";
})(DependencyType || (DependencyType = {}));
//# sourceMappingURL=types.js.map
