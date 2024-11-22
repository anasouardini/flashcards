import path from "path";
import os from "os";

let dataPath;

if (process.platform === "win32") {
  // For Windows
  dataPath = path.join(os.homedir(), "AppData", "Local");
} else if (process.platform === "darwin") {
  // For macOS
  dataPath = path.join(os.homedir(), "Library", "Application Support");
} else {
  // For Linux and other Unix-like systems
  dataPath = path.join(os.homedir(), ".local", "share");
}

const appName = "iflash";

interface Vars {
  appPath: string;
  storePath: string;
  // logsPath: string;
}
//@ts-ignore
const vars: Vars = {
  appPath: `${dataPath}/${appName}`,
};
vars.storePath = `${vars.appPath}/data`;
// vars.logsPath = `${vars.appPath}/logs`;

export default vars;
