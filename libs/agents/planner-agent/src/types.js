export var TaskStatus;
(function (TaskStatus) {
  TaskStatus["PENDING"] = "PENDING";
  TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
  TaskStatus["COMPLETED"] = "COMPLETED";
  TaskStatus["FAILED"] = "FAILED";
})(TaskStatus || (TaskStatus = {}));
export var DependencyType;
(function (DependencyType) {
  DependencyType["BLOCKS"] = "BLOCKS";
  DependencyType["REQUIRES"] = "REQUIRES";
  DependencyType["RELATED"] = "RELATED";
})(DependencyType || (DependencyType = {}));
//# sourceMappingURL=types.js.map
