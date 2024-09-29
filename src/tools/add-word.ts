import { type Model, loadList, saveList, getModel, recordHistory } from '../model/model';
import tools from './tools';

const args = {
  dictionaryName: process.argv[2],
  foreignWord: process.argv[3],
  equivalentWord: process.argv[4],
  definitionEN: process.argv[5],
  forms: process.argv[6],
};

loadList({ item: `${args.dictionaryName}.json` });
let model = getModel();
if (!model) {
  process.exit(2);;
}

const alreadyExists = model.model.levels.some((level) => {
  return level.cards.some((card) => {
    const existingWord = card.front.content.split(' ')[0].trim().toLowerCase();
    const newWord = args.foreignWord.split(' ')[0].trim().toLowerCase();
    return existingWord == newWord;
  })
})
if (alreadyExists) {
  console.log('Word already exists');
  process.exit(1);
}

model.model.levels[0].cards.push({
  front: { content: tools.capitalize(args.foreignWord) },
  back: {
    content: [
      `- [${tools.capitalize(args.equivalentWord)}]: ${args.definitionEN ?? ''}`,
      `- Forms: ${args.forms ?? ''}`,
    ]
  },
});

recordHistory({
  type: 'add',
  word: tools.capitalize(args.foreignWord.split(' ')[0].trim()),
  date: new Date().toISOString(),
});

saveList();

const total = model.model.levels.reduce((total, level) => {
    return level.cards.length + total;
  }, 0)
console.log({
  total,
})