"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inputFilePath = path_1.default.join(__dirname, '..', 'data', 'french-voc.md');
const outputFilePath = path_1.default.join(__dirname, '..', 'data', 'french-voc.json');
const content = fs_1.default.readFileSync(inputFilePath, 'utf-8');
const wordBlobs = content.split('##').slice(1);
const model = {
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
    const cardFront = {
        content: word.includes('#') ? word.slice(1).trim() : word.trim(),
    };
    const cardBack = {
        content: examples.map((line) => {
            return line.trim();
        }),
    };
    model.levels[word.includes('#') ? 1 : 0].cards.push({
        front: cardFront,
        back: cardBack,
    });
});
fs_1.default.writeFileSync(outputFilePath, JSON.stringify(model));
