import { type Model, loadList, saveList, getModel, recordHistory } from '../model/model';
import { SrsCardC } from './srs-sm2';
import tools from './tools';

const args = {
  dictionaryName: process.argv[2],
  foreignWord: process.argv[3],
  equivalentWord: process.argv[4],
  definitionEN: process.argv[5],
  forms: process.argv[6],
};

const parsedForeignWord = args.foreignWord.split('(')[0].trim().toLocaleLowerCase();

// const entryType = args.dictionaryName.split('.')[0].split('-')[1];

const model = loadList({ item: `${args.dictionaryName}.json` });
// console.log({ model })
if (!model) {
  process.exit(2);;
}

const alreadyExists = Object.values(model.cards).some((cardBatch) => {
  return cardBatch[parsedForeignWord];
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

// add the new card
const srs = new SrsCardC();
const srsProps = srs.getCardProps();
const newCard = { content: newC, srsProps };
const nextReviewDate = srs.getNextReviewDate().toISOString().split('T')[0];
const existingBatch = model.cards[nextReviewDate];
if (existingBatch) {
  model.cards[nextReviewDate][parsedForeignWord] = newCard
} else {
  model.cards[nextReviewDate] = { [parsedForeignWord]: newCard };
}

recordHistory({
  type: 'add',
  word: tools.capitalize(args.foreignWord.split('(')[0].trim()),
  date: new Date().toISOString(),
});

saveList();

const total = Object.values(model.cards).reduce((acc, cardBatch) => {
  acc += Object.keys(cardBatch).length;
}, 0);

console.log({
  total,
})