import fs from 'fs';
import path from 'path';
import {
  type Model,
  type LevelHistory,
  CardFrontSide,
  CardBackSide,
} from '../model/model';

const inputFilePath = path.join(__dirname, '..', 'data', 'french-voc.md');
const outputFilePath = path.join(__dirname, '..', 'data', 'french-voc.json');
const content = fs.readFileSync(inputFilePath, 'utf-8');
const wordBlobs = content.split('##').slice(1);

const model: Model = {
  currentLevel: 0,
  levels: [],
  history: {
    actions: [],
    levels: [],
  }
};
for (let i = 0; i <= 9; i++) {
  model.levels.push({
    currentCardIndex: 0,
    currentCardSide: 'front',
    cards: [],
  });
}
wordBlobs.forEach((wordBlob) => {
  const lines = wordBlob.split('\n');
  const word = lines[0];
  const examples = lines.slice(1).filter((line) => {
    return line != '';
  });

  const cardFront: CardFrontSide = {
    content: word.includes('#') ? word.slice(1).trim() : word.trim(),
  };
  const cardBack: CardBackSide = {
    content: examples.map((line) => {
      return line.trim();
    }),
  };

  model.levels[word.includes('#') ? 1 : 0].cards.push({
    front: cardFront,
    back: cardBack,
  });
});

fs.writeFileSync(outputFilePath, JSON.stringify(model));
