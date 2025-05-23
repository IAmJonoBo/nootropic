"use strict";
/**
 * Shared CLI Helper Utility for nootropic scripts.
 *
 * - Standardizes argument parsing (--help, --json, etc.)
 * - Provides help output
 * - Standardizes error handling and exit codes
 * - Supports human and machine-readable (JSON) output
 *
 * Example:
 *   import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers';
 *   const { args, showHelp } = parseCliArgs({
 *     usage: 'Usage: myscript [options]',
 *     options: { foo: { desc: 'Foo option', type: 'string' } }
 *   });
 *   if (showHelp) printUsage();
 *   try { ... } catch (e) { printError(e); }
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.describe = exports.health = exports.reload = exports.shutdown = exports.init = exports.printError = exports.printResult = exports.printUsage = exports.parseCliArgs = void 0;
var process_1 = require("process");
function parseCliArgs(_a) {
    var _b;
    var options = _a.options;
    var args = process_1["default"].argv.slice(2);
    var parsed = {};
    var showHelp = false;
    for (var _i = 0, _c = Object.entries(options); _i < _c.length; _i++) {
        var _d = _c[_i], key = _d[0], opt = _d[1];
        var idx = args.indexOf("--".concat(key));
        if (idx !== -1) {
            parsed[key] = opt.type === 'boolean' ? true : args[idx + 1];
        }
    }
    if ((_b = args.includes('--help')) !== null && _b !== void 0 ? _b : args.includes('-h'))
        showHelp = true;
    if (args.includes('--json'))
        parsed['json'] = true;
    return { args: parsed, showHelp: showHelp };
}
exports.parseCliArgs = parseCliArgs;
function printUsage(usage, options) {
    if (usage === void 0) { usage = ''; }
    if (options === void 0) { options = {}; }
    console.log(usage);
    for (var _i = 0, _a = Object.entries(options); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], opt = _b[1];
        console.log("  --".concat(key).concat(opt.type === 'boolean' ? '' : " <".concat(opt.type, ">"), "\t").concat(opt.desc));
    }
    console.log('  --help\tShow help');
    console.log('  --json\tOutput in JSON format');
}
exports.printUsage = printUsage;
function printResult(result, asJson) {
    if (asJson === void 0) { asJson = false; }
    if (asJson) {
        console.log(JSON.stringify(result, null, 2));
    }
    else {
        console.log(result);
    }
}
exports.printResult = printResult;
function printError(error, asJson) {
    if (asJson === void 0) { asJson = false; }
    if (asJson) {
        console.error(JSON.stringify({ error: String(error) }, null, 2));
    }
    else {
        console.error('Error:', error);
    }
    process_1["default"].exit(1);
}
exports.printError = printError;
function init() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); });
}
exports.init = init;
function shutdown() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); });
}
exports.shutdown = shutdown;
function reload() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); });
}
exports.reload = reload;
function health() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, { status: 'ok', timestamp: new Date().toISOString() }];
    }); });
}
exports.health = health;
function describe() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, { name: 'cliHelpers', description: 'Stub lifecycle hooks for registry compliance.' }];
    }); });
}
exports.describe = describe;
