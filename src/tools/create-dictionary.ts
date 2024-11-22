import { type Model, loadList, saveList, getModel, recordHistory } from '../model/model';
import tools from './tools';
import vars from './vars';

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
    parsedDictionaryName += `-${args.entryType}`
  }
  // if (parsedDictionaryName.includes('-')) {
  //   parsedDictionaryName = parsedDictionaryName.replaceAll('-', '_');
  // }

  const resp = await tools.execPromise(`cp "${vars.storePath}/template.json" "${vars.storePath}/${parsedDictionaryName}.json"`);
  console.log(`New dictionary was created with the name: ${parsedDictionaryName}.`);
  console.log(`Your dictinoary can be found in the path: ${vars.storePath}`);
})();