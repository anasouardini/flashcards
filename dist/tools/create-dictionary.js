"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = __importDefault(require("./tools"));
const vars_1 = __importDefault(require("./vars"));
const args = {
    dictionaryName: process.argv[2],
    entryType: process.argv[3]
};
const config = {
    allowedTypes: ['voc', 'exp', 'abb'],
    templateObj: {
        levels: {}
    }
};
;
(async () => {
    if (args.entryType && !config.allowedTypes.includes(args.entryType)) {
        console.log(`[!] Invalid 2nd argument (entry type), choose from: ${config.allowedTypes.join(', ')}`);
        process.exit(1);
    }
    let parsedDictionaryName = args.dictionaryName;
    if (args.entryType) {
        parsedDictionaryName += `-${args.entryType}`;
    }
    // if (parsedDictionaryName.includes('-')) {
    //   parsedDictionaryName = parsedDictionaryName.replaceAll('-', '_');
    // }
    const resp = await tools_1.default.execPromise(`cp "${vars_1.default.storePath}/template.json" "${vars_1.default.storePath}/${parsedDictionaryName}.json"`);
    console.log(`New dictionary was created with the name: ${parsedDictionaryName}.`);
    console.log(`Your dictinoary can be found in the path: ${vars_1.default.storePath}`);
})();
