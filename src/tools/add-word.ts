import { type Model, loadList, saveList, getModel, recordHistory } from '../model/model';
import tools from './tools';

const args = {
  dictionaryName: process.argv[2],
  entryType: process.argv[3],
  foreignWord: process.argv[4],
  equivalentWord: process.argv[5],
  definitionEN: process.argv[6],
  forms: process.argv[7],
};

loadList({ item: `${args.dictionaryName}.json` });
let model = getModel();
if (!model) {
  process.exit(2);;
}

const alreadyExists = model.model.levels.some((level) => {
  return level.cards.some((card) => {
    const existingWord = args.entryType == 'voc' ? card.front.content.split('(')[0] : card.front.content;
    const newWord = args.entryType == 'voc' ? args.foreignWord.split('(')[0]: args.foreignWord;

    return existingWord.trim().toLocaleLowerCase() == newWord.trim().toLocaleLowerCase();
  })
})
if (alreadyExists) {
  console.log('Word already exists');
  process.exit(1);
}

const newC = {
  front: { content: tools.capitalize(args.foreignWord) },
  back: {
    content: [
      `- [${tools.capitalize(args.equivalentWord)}]: ${args.definitionEN ?? ''}`
    ]
  },
};
if (args.forms) {
  newC.back.content.push(`- Forms: ${args.forms ?? ''}`);
}
model.model.levels[0].cards.push(newC);

recordHistory({
  type: 'add',
  word: tools.capitalize(args.foreignWord.split('(')[0].trim()),
  date: new Date().toISOString(),
});

saveList();

const total = model.model.levels.reduce((total, level) => {
  return level.cards.length + total;
}, 0)
console.log({
  total,
})