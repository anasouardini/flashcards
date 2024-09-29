import blessed from 'blessed';
import {
  ActionHistory,
  type CardSide,
  LevelHistory,
  type Model,
  getModel,
  recordHistory,
  saveList,
} from '../model/model';
import {
  getScreen,
  newScreen,
  showDebug,
  toggleDebugLog,
  painter,
} from './screen';
import explorer from './explorer';

const cardLevelsList = [
  'researched-c1',
  'familiarized-c1',
  'grasped-c1',
  'applied-c1',
  'researched-c2',
  'grasped-c2',
  'applied-c2',
  'researched-c3',
  'grasped-c3',
  'applied-c3',
  'ignored',
];

interface Vars {
  model: Model;
  screen: blessed.Widgets.Screen;
  unsavedActions: number;
  stats: {
    visible: boolean;
    statsCard: blessed.Widgets.BoxElement;
    statsCardText: blessed.Widgets.TextElement;
  };
}
let vars: Vars = {
  model: {} as Model,
  screen: {} as blessed.Widgets.Screen,
  unsavedActions: 0,
  stats: {
    visible: false,
    statsCard: {} as blessed.Widgets.BoxElement,
    statsCardText: {} as blessed.Widgets.TextElement,
  },
};

interface renderCardsArgs {
  index?: number;
  direction?: 'next' | 'previous';
  level?: number;
  levelDirection?: 'next' | 'previous';
  side?: 'front' | 'back' | 'toggle';
}
function renderCard({
  index,
  direction,
  side,
  level,
  levelDirection,
}: renderCardsArgs) {
  vars.screen.realloc();
  let cardLevel = level ?? vars.model.currentLevel;

  if (levelDirection) {
    const levelsLength = Object.keys(vars.model.levels).length;
    if (levelDirection == 'next') {
      cardLevel = (vars.model.currentLevel + 1) % levelsLength;
    } else if (levelDirection == 'previous') {
      cardLevel = (vars.model.currentLevel - 1) % levelsLength;
      if (cardLevel < 0) {
        cardLevel += levelsLength;
      }
    }
  }

  const isLevelEmpty = vars.model.levels[cardLevel].cards.length == 0;

  // vars.screen.append(painter.box({
  //     width: '10%',
  //     // content: `${JSON.stringify(vars.model)}`,
  //     content: `---------------`,
  //     tags: true
  // }));
  // vars.screen.render();

  let cardIndex = index ?? vars.model.levels[cardLevel].currentCardIndex;
  let cardSide: CardSide = vars.model.levels[cardLevel].currentCardSide;
  showDebug(
    `args: idx(${index}) dir(${direction}) side(${cardSide}) level(${cardLevel})`,
  );

  if (side) {
    if (side == 'toggle') {
      cardSide = cardSide == 'front' ? 'back' : 'front';
    } else {
      cardSide = side;
    }

    vars.model.levels[cardLevel].currentCardSide = cardSide;
  }

  if (index) {
    cardIndex =
      index == -1 ? vars.model.levels[cardLevel].cards.length - 1 : index;
  } else if (direction) {
    const cardsLength = vars.model.levels[cardLevel].cards.length;
    if (direction == 'next') {
      cardIndex =
        (vars.model.levels[cardLevel].currentCardIndex + 1) % cardsLength;
    } else if (direction == 'previous') {
      cardIndex =
        (vars.model.levels[cardLevel].currentCardIndex - 1) % cardsLength;
      if (cardIndex < 0) {
        cardIndex += cardsLength;
      }
    }
  }

  if (
    cardIndex != vars.model.levels[cardLevel].currentCardIndex ||
    cardLevel != vars.model.currentLevel
  ) {
    // console.log('reset side')
    cardSide = vars.model.levels[cardLevel].currentCardSide = 'front';
  }

  vars.model.levels[cardLevel].currentCardIndex = cardIndex;
  // @ts-ignore
  vars.model.currentLevel = parseInt(cardLevel);

  let cardContent = '';
  if (!isLevelEmpty) {
    const cardObj = vars.model.levels[cardLevel].cards[cardIndex];
    const cardContentTmp = cardObj[cardSide].content;
    if (Array.isArray(cardContentTmp)) {
      cardContent = cardContentTmp.join('\n');
    } else {
      cardContent = cardContentTmp;
    }
  } else {
    cardContent = 'This level has no cards';
  }

  showDebug(`endargs: idx(${cardIndex}) side(${cardSide}) level(${cardLevel})`);
  showDebug(`content: ${cardContent}`);

  const card = painter.box({
    top: 0,
    left: 0,
    width: '100%',
    height: '50%',
    border: 'line',
    tags: true,
  });
  vars.screen.append(card);
  const title = painter.text({
    top: 0,
    left: 'center',
    content: `${cardLevelsList[cardLevel]}(${vars.model.levels[cardLevel].cards.length}) - ${cardIndex} - ${cardSide}  unsaved(${vars.unsavedActions})`,
    tags: true,
  });
  card.append(title);
  if (cardSide == 'back') {
    const wordSubTitle = painter.text({
      top: 2,
      left: 'center',
      content: `${vars.model.levels[cardLevel].cards[cardIndex].front.content}`,
      tags: true,
    });
    card.append(wordSubTitle);
  }
  const text = painter.text({
    top: 'center',
    left: cardSide == 'front' ? 'center' : 0,
    content: cardContent,
    tags: true,
  });
  card.append(text);
  card.focus();
  vars.screen.render();
}

function moveCardToLevel({
  levelDirection,
}: {
  levelDirection: 'previous' | 'next';
}) {
  const currentLevelKey = vars.model.currentLevel;
  const currentLevel = vars.model.levels[currentLevelKey];
  if (currentLevel.cards.length == 0) {
    showDebug(`level ${currentLevelKey} has no cards`);
    return;
  }

  let targetLevelIndex =
    (currentLevelKey + (levelDirection == 'next' ? 1 : -1)) %
    vars.model.levels.length;
  if (targetLevelIndex == -1) {
    targetLevelIndex = vars.model.levels.length - 1;
  }
  const targetLevel = vars.model.levels[targetLevelIndex];

  showDebug(`moving ${currentLevelKey} to ${targetLevelIndex}`);
  // showDebug(`${JSON.stringify(currentLevel.cards[currentLevel.currentCardIndex])}`)

  targetLevel.cards.push(currentLevel.cards[currentLevel.currentCardIndex]);
  // showDebug(`${JSON.stringify(targetLevel.cards[currentLevel.currentCardIndex])}`)

  currentLevel.cards.splice(currentLevel.currentCardIndex, 1);
  vars.unsavedActions++;

  recordHistory({
    type: 'move',
    // @ts-ignore
    word: targetLevel.cards.at(-1).front.content.trim().split(' ')[0],
    fromLevel: currentLevelKey,
    toLevel: targetLevelIndex,
    date: new Date().toISOString(),
  });

  //* new length is old length - 1
  if (currentLevel.currentCardIndex == currentLevel.cards.length) {
    renderCard({
      index: currentLevel.cards.length == 0 ? 0 : currentLevel.cards.length - 1,
    });
  } else {
    vars.model.levels[currentLevelKey].currentCardSide = 'front';
    renderCard({ index: currentLevel.currentCardIndex });
  }
}

function showStats() {
  vars.screen.realloc();

  if (!vars.stats.visible) {
    vars.stats.visible = true;
    let total = 0;
    const sizes = vars.model.history.levels
      .map((level: LevelHistory, index: number) => {
        const lastRecordedLength = level.lengths?.at(-1)?.length ?? 0;
        total += lastRecordedLength;

        if (lastRecordedLength == 0) {
          return undefined;
        }

        return `${cardLevelsList[index]}: ${lastRecordedLength}`;
      })
      .filter((line) => {
        return !!line;
      });
    const content = sizes.join('\n') + `\n=> Total: ${total}`;

    vars.stats.statsCard = painter.box({
      top: 'center',
      left: 'center',
      width: '30%',
      height: '30%',
      border: 'line',
      tags: true,
    });

    vars.screen.append(vars.stats.statsCard);
    const text = painter.text({
      width: '70%',
      height: '70%',
      top: 'center',
      left: 'center',
      tags: true,
    });
    vars.stats.statsCard.append(text);

    showDebug(`showing stats`);
    text.setContent(content);
  } else {
    vars.screen.remove(vars.stats.statsCard);
    vars.stats.visible = false;
  }
  vars.screen.render();
}

function moveCardToIndex({
  orderDirection,
}: {
  orderDirection: 'previous' | 'next';
}) {
  const currentLevel = vars.model.levels[vars.model.currentLevel];
  if (currentLevel.cards.length == 0) {
    showDebug(`level ${vars.model.currentLevel} has no cards`);
    return;
  }
  const currentIndex = currentLevel.currentCardIndex;
  let targetIndex =
    (currentIndex + (orderDirection == 'next' ? 1 : -1)) %
    currentLevel.cards.length;
  if (targetIndex == -1) {
    targetIndex = currentLevel.cards.length - 1;
  }

  // swaping order
  const tmpCard = currentLevel.cards[currentIndex];
  currentLevel.cards[currentIndex] = currentLevel.cards[targetIndex];
  currentLevel.cards[targetIndex] = tmpCard;

  showDebug(`moving ${currentIndex} to ${targetIndex}`);
  vars.unsavedActions++;
  renderCard({ direction: orderDirection });
}

function editCard() {
  const form = blessed.form({
    keys: true,
    vi: true,
    height: '50%',
    width: '60%',
    top: 'center',
    left: 'center',
    border: 'line',
    style: {
      border: {
        fg: 'yellow',
      },
    },
  });
  const input = blessed.textbox({
    parent: form,
    content: 'edit card',
    inputOnFocus: true,
    border: 'line',
    height: '200',
    width: '90%',
    top: '10%',
    left: 'center',
    style: {
      bg: 'white',
      fg: 'red',
      border: {
        fg: 'yellow',
      },
    },
  });
  form.append(input);
  const textArea = blessed.textarea({
    parent: form,
    content: 'edit card',
    inputOnFocus: true,
    border: 'line',
    height: '500',
    width: '90%',
    top: '300',
    left: 'center',
    style: {
      border: {
        fg: 'yellow',
      },
    },
  });
  form.append(textArea);
  // form.key(['enter'], function (ch, key) {
  //     console.log(input.getValue())
  // })
  vars.screen.append(form);
  form.focus();
  vars.screen.render();
}

function setupKeybindings() {
  vars.screen.key(['g'], function (ch, key) {
    renderCard({ index: 0 });
  });
  vars.screen.key(['S-g'], function (ch, key) {
    renderCard({ index: -1 });
  });
  vars.screen.key(['j'], function (ch, key) {
    renderCard({ direction: 'next' });
  });
  vars.screen.key(['k'], function (ch, key) {
    renderCard({ direction: 'previous' });
  });
  vars.screen.key(['S-j'], function (ch, key) {
    moveCardToIndex({ orderDirection: 'next' });
  });
  vars.screen.key(['S-k'], function (ch, key) {
    moveCardToIndex({ orderDirection: 'previous' });
  });

  vars.screen.key(['f'], function (ch, key) {
    renderCard({ side: 'toggle' });
  });

  vars.screen.key(
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    function (ch, key) {
      renderCard({ level: ch });
    },
  );
  vars.screen.key(['l'], function (ch, key) {
    renderCard({ levelDirection: 'next' });
  });
  vars.screen.key(['h'], function (ch, key) {
    renderCard({ levelDirection: 'previous' });
  });
  vars.screen.key(['S-l'], function (ch, key) {
    moveCardToLevel({ levelDirection: 'next' });
  });
  vars.screen.key(['S-h'], function (ch, key) {
    moveCardToLevel({ levelDirection: 'previous' });
  });

  vars.screen.key(['x'], function (ch, key) {
    vars.screen.destroy();
    explorer.init({ cb: init });
  });

  vars.screen.key(['s'], function (ch, key) {
    saveList();
    vars.unsavedActions = 0;
    renderCard({});
  });

  vars.screen.key(['b'], function (ch, key) {
    showStats();
  });

  vars.screen.key(['d'], function (ch, key) {
    toggleDebugLog();
  });

  vars.screen.key(['e'], function (ch, key) {
    editCard();
  });

  vars.screen.key(['q', 'C-c'], function (ch, key) {
    return process.exit(0);
  });
}

function init() {
  vars.model = getModel().model;

  const { screen, debugBox } = newScreen({ title: 'flashcards' });
  vars.screen = screen;

  setupKeybindings();
  renderCard({});
}

export default {
  init,
};
