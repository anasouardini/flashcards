import fs from 'fs';
import path from 'path';
import { type Model } from '../model/model';

const args = {
  wordFR: process.argv[2],
  wordEN: process.argv[3],
  definitionEN: process.argv[4],
};

const wordsList = path.join(__dirname, '..', 'data', 'french-voc.json');
const content = fs.readFileSync(wordsList, 'utf-8');

let model: Model = JSON.parse(content);
model.levels[0].cards.push({
  front: { content: args.wordFR },
  back: { content: [`- [${args.wordEN}]: ${args.definitionEN ?? ''}`] },
});

fs.writeFileSync(wordsList, JSON.stringify(model, null, 2));
