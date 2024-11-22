"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
let dataPath;
if (process.platform === "win32") {
    // For Windows
    dataPath = path_1.default.join(os_1.default.homedir(), "AppData", "Local");
}
else if (process.platform === "darwin") {
    // For macOS
    dataPath = path_1.default.join(os_1.default.homedir(), "Library", "Application Support");
}
else {
    // For Linux and other Unix-like systems
    dataPath = path_1.default.join(os_1.default.homedir(), ".local", "share");
}
const appName = "iflash";
//@ts-ignore
const vars = {
    appPath: `${dataPath}/${appName}`,
};
vars.storePath = `${vars.appPath}/data`;
// vars.logsPath = `${vars.appPath}/logs`;
exports.default = vars;
