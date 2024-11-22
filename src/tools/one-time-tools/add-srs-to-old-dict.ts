import { type Model, loadList, saveList, getModel, recordHistory, Card } from '../../model/model';
import { SrsLevel, SrsCardC, SrsCardProps } from '../srs-sm2';
import tools from '../tools';

let model = loadList({ item: `german-voc-new.json` });
// console.log({ model })
if (!model) {
  process.exit(2);;
}

// I. restructuring
if (!model.cards) {
  model.cards = {};
  model.currentBatchDate = "";

  model.levels.forEach((level, levelIndex) => {
    level.cards.forEach((card) => {
      interface Consts {
        levels: {
          repetitions: number;
          level: SrsLevel;
        }[]
      }
      const consts: Consts = {
        levels: [
          {
            repetitions: 2,
            level: 2,
          },
          {
            repetitions: 4,
            level: 3,
          },
          {
            repetitions: 5,
            level: 5,
          },
        ],
      }

      // const wordsWithNoAddAction = [];
      // const orphentActions = [];
      // model.levels.forEach((level, levelIndex) => {
      //   level.cards.forEach((card) => {
      //     const initialAction = model.history.actions.filter((action) => {
      //       const isWordMatch = action.word.toLowerCase() === card.front.content.split('(')[0].trim().toLowerCase();
      //       const isTypeAdd = action.type === 'add';
      //       if (isWordMatch && isTypeAdd) {
      //         return true;
      //       }
      //     })[0];
      //     if (!initialAction) {
      //       wordsWithNoAddAction.push(card.front.content);
      //     }
      //   })
      // })
      // model.history.actions.forEach((action) => {
      //   const isNotOrphent = model.levels.some((level, levelIndex) => {
      //     return level.cards.some((card) => {
      //       const isWordMatch = action.word.toLowerCase() === card.front.content.split('(')[0].trim().toLowerCase();
      //       return isWordMatch;
      //     })
      //   })
      //   if (!isNotOrphent) {
      //     orphentActions.push(`${action.type} - ${action.word}`);
      //   }
      // })
      // console.log("---------- wordsWithNoAddAction ----------")
      // for (let index = 0; index < wordsWithNoAddAction.length; index++) {
      //   console.log(wordsWithNoAddAction[index]);
      // }
      // console.log("---------- orphentActions ----------")
      // for (let index = 0; index < orphentActions.length; index++) {
      //   console.log(orphentActions[index]);
      // }
      // process.exit(1);

      const initialAction = model.history.actions.filter((action) => {
        const isWordMatch = action.word.toLowerCase() === card.front.content.split('(')[0].trim().toLowerCase();
        const isTypeAdd = action.type === 'add';
        if (isWordMatch && isTypeAdd) {
          return true;
        }
      })[0];
      const creationDate = initialAction?.date;
      if (!creationDate) {
        console.log({ creationDate, card: card.front.content });
        throw new Error('no "add" action!');
      }
      const prepCard = new SrsCardC({
        level: consts.levels[levelIndex].level,
        creationDate: new Date(creationDate)
      });
      for (let index = 0; index < consts.levels[levelIndex].repetitions; index++) {
        const lastAction = model.history.actions.filter((action) => {
          if (action.word.toLowerCase() === card.front.content.split('(')[0].trim().toLowerCase()) {
            return action;
          }
        }).at(-1);
        const lastActionDate = lastAction?.date;
        if (!lastActionDate) {
          console.log({ lastAction, card: card.front.content });
          throw new Error('no last action date');
        }
        prepCard.review(consts.levels[levelIndex].level, new Date(lastActionDate));
      }

      const newCard: Card = {
        content: card,
        srsProps: prepCard.getCardProps(),
      }

      const cardId = card.front.content.split('(')[0].trim().toLowerCase();
      if (model.cards[newCard.srsProps.nextReviewDate]) {
        model.cards[newCard.srsProps.nextReviewDate][cardId] = newCard;
      } else {
        model.cards[newCard.srsProps.nextReviewDate] = { [cardId]: newCard };
      }
    })
  })

  delete model.levels;
  delete model.currentLevel;
  model.currentCardId = "";
  model.currentCardSide = 'front';

  // just in case
  if (model.srs) { delete model.srs; }
}

if (model.history.levels) {
  model.history.lengths = {
    0: [],
    1: [],
    2: structuredClone(model.history.levels[0].lengths),
    3: structuredClone(model.history.levels[1].lengths),
    4: [],
    5: structuredClone(model.history.levels[2].lengths),
  };

  Object.entries(model.history.lengths)
    .forEach(([key, lengthsList]) => {
      model.history.lengths[key] = lengthsList
        .reduce((acc, lengthObj) => {
          const parsedPriorDate = acc?.at(-1)?.date?.split('T')?.[0] ?? '';
          const parsedCurrentDate = lengthObj.date.split('T')[0];
          if (parsedPriorDate !== parsedCurrentDate) { acc.push(lengthObj) }

          return acc;
        }, [])
    })

  delete model.history.levels;
}

if (model.history.actions) {
  model.history.actions.forEach((action) => {
    if (action.type == 'move') {
      const ls = ['fromLevel', 'toLevel'] as const;
      ls.forEach((key) => {
        switch (action[key] as 0 | 1 | 2) {
          case 0: {
            action[key] = 1;
            break;
          };
          case 1: {
            action[key] = 3;
            break;
          };
          case 2: {
            action[key] = 5;
            break;
          };
        }
      })
    }
  })
}

// reorder items in model
const modelClone = {
  currentCardId: "",
  currentCardSide: 'front',
  currentBatchDate: '',
  cards: {},
  history: {}
};
Object.entries(model).forEach(([key, value]) => {
  modelClone[key] = value;
})

saveList(modelClone as Model);