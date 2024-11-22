"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../model/model");
const srs_sm2_1 = require("./srs-sm2");
const tools_1 = __importDefault(require("./tools"));
const args = {
    dictionaryName: process.argv[2],
    foreignWord: process.argv[3],
    equivalentWord: process.argv[4],
    definitionEN: process.argv[5],
    forms: process.argv[6],
};
const parsedForeignWord = args.foreignWord.split('(')[0].trim().toLocaleLowerCase();
// const entryType = args.dictionaryName.split('.')[0].split('-')[1];
const model = (0, model_1.loadList)({ item: `${args.dictionaryName}.json` });
// console.log({ model })
if (!model) {
    process.exit(2);
    ;
}
const alreadyExists = Object.values(model.cards).some((cardBatch) => {
    return cardBatch[parsedForeignWord];
});
if (alreadyExists) {
    console.log('Word already exists');
    process.exit(1);
}
const newC = {
    front: { content: tools_1.default.capitalize(args.foreignWord) },
    back: {
        content: [
            `- [${tools_1.default.capitalize(args.equivalentWord)}]: ${args.definitionEN ?? ''}`
        ]
    },
};
if (args.forms) {
    newC.back.content.push(`- Forms: ${args.forms ?? ''}`);
}
// add the new card
const srs = new srs_sm2_1.SrsCardC();
const srsProps = srs.getCardProps();
const newCard = { content: newC, srsProps };
const nextReviewDate = srs.getNextReviewDate().toISOString().split('T')[0];
const existingBatch = model.cards[nextReviewDate];
if (existingBatch) {
    model.cards[nextReviewDate][parsedForeignWord] = newCard;
}
else {
    model.cards[nextReviewDate] = { [parsedForeignWord]: newCard };
}
(0, model_1.recordHistory)({
    type: 'add',
    word: tools_1.default.capitalize(args.foreignWord.split('(')[0].trim()),
    date: new Date().toISOString(),
});
(0, model_1.saveList)();
const total = Object.values(model.cards).reduce((acc, cardBatch) => {
    acc += Object.keys(cardBatch).length;
}, 0);
console.log({
    total,
});
