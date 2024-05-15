import blessed from "blessed";
import { type CardSide, type Model, getModel, saveList } from "../model/model";
import { getScreen, newScreen, showDebug, painter } from "./screen";
import explorer from "./explorer";


interface Vars {
    model: Model
    screen: blessed.Widgets.Screen;
}
let vars: Vars = {
    model: {} as Model,
    screen: {} as blessed.Widgets.Screen,
}

interface renderCardsArgs {
    index?: number,
    direction?: "next" | "previous",
    level?: number,
    levelDirection?: "next" | "previous",
    side?: "front" | "back" | "toggle"
}
function renderCard({ index, direction, side, level, levelDirection }: renderCardsArgs) {
    vars.screen.realloc();
    let cardLevel = level ?? vars.model.currentLevel;

    if (levelDirection) {
        const levelsLength = Object.keys(vars.model.levels).length;
        if (levelDirection == "next") {
            cardLevel = (vars.model.currentLevel + 1) % levelsLength;
        } else if (levelDirection == "previous") {
            cardLevel = (vars.model.currentLevel - 1) % levelsLength;
            if (cardLevel < 0) { cardLevel += levelsLength }
        }

        if (vars.model.levels[cardLevel].cards.length == 0) {
            showDebug(`level ${cardLevel} is empty`);
            return;
        }
    }

    // vars.screen.append(painter.box({
    //     width: '10%',
    //     // content: `${JSON.stringify(vars.model)}`,
    //     content: `---------------`,
    //     tags: true
    // }));
    // vars.screen.render();

    let cardIndex = index ?? vars.model.levels[cardLevel].currentCardIndex;
    let cardSide: CardSide = vars.model.levels[cardLevel].currentCardSide;
    showDebug(`args: idx(${index}) dir(${direction}) side(${cardSide}) level(${cardLevel})`);

    if (side) {
        if (side == "toggle") {
            cardSide = cardSide == "front" ? "back" : "front";
        } else {
            cardSide = side;
        }

        vars.model.levels[cardLevel].currentCardSide = cardSide;
    }

    if (index) {
        cardIndex = index == -1 ? vars.model.levels[cardLevel].cards.length - 1 : index
    } else if (direction) {
        const cardsLength = vars.model.levels[cardLevel].cards.length;
        if (direction == "next") {
            cardIndex = (vars.model.levels[cardLevel].currentCardIndex + 1) % cardsLength;
        } else if (direction == "previous") {
            cardIndex = (vars.model.levels[cardLevel].currentCardIndex - 1) % cardsLength;
            if (cardIndex < 0) { cardIndex += cardsLength }
        }
    }


    if (cardIndex != vars.model.levels[cardLevel].currentCardIndex || cardLevel != vars.model.currentLevel) {
        // console.log('reset side')
        cardSide = vars.model.levels[cardLevel].currentCardSide = "front";
    }

    vars.model.levels[cardLevel].currentCardIndex = cardIndex;
    vars.model.currentLevel = cardLevel;

    let cardContent = ""
    const cardObj = vars.model.levels[cardLevel].cards[cardIndex];
    const cardContentTmp = cardObj[cardSide].content;
    if (cardLevel > Object.keys(vars.model.levels).length) {
        cardContent = "This level has no cards";
    } else {
        if (Array.isArray(cardContentTmp)) {
            cardContent = cardContentTmp.join("\n");
        } else {
            cardContent = cardContentTmp;
        }
    }

    showDebug(`endargs: idx(${cardIndex}) side(${cardSide}) level(${cardLevel})`);
    showDebug(`content: ${cardContent}`);

    const card = painter.box({
        top: 0,
        left: 0,
        width: '50%',
        height: '50%',
        border: 'line',
        tags: true
    })
    vars.screen.append(card);
    const title = painter.text({
        top: 0,
        left: "center",
        content: `${cardLevel} - ${cardIndex} - ${cardSide}`,
        tags: true
    })
    card.append(title)
    if (cardSide == "back") {
        const wordSubTitle = painter.text({
            top: 2,
            left: "center",
            content: `${cardObj.front.content}`,
            tags: true
        })
        card.append(wordSubTitle)
    }
    const text = painter.text({
        top: "center",
        left: cardSide == "front" ? "center" : 0,
        content: cardContent,
        tags: true
    })
    card.append(text)
    card.focus();
    vars.screen.render();
}

function moveCardToLevel({ levelDirection }: { levelDirection: "previous" | "next" }) {
    const currentLevelKey = vars.model.currentLevel;
    const currentLevel = vars.model.levels[currentLevelKey];
    const targetLevelIndex = currentLevelKey + (levelDirection == "next" ? 1 : -1);
    const targetLevel = vars.model.levels[targetLevelIndex];

    showDebug(`moving ${currentLevelKey} to ${targetLevelIndex}`);
    // showDebug(`${JSON.stringify(currentLevel.cards[currentLevel.currentCardIndex])}`)

    targetLevel.cards.push(currentLevel.cards[currentLevel.currentCardIndex]);
    // showDebug(`${JSON.stringify(targetLevel.cards[currentLevel.currentCardIndex])}`)

    currentLevel.cards.splice(currentLevel.currentCardIndex, 1);

    //* new length is old length - 1
    if (currentLevel.currentCardIndex == currentLevel.cards.length) {
        renderCard({ index: currentLevel.currentCardIndex - 1 });
    } else {
        renderCard({ index: currentLevel.currentCardIndex });
    }
}
function moveCardToIndex({ orderDirection }: { orderDirection: "previous" | "next" }) {
    const currentLevel = vars.model.levels[vars.model.currentLevel];
    const currentIndex = currentLevel.currentCardIndex;
    const targetIndex = currentIndex + (orderDirection == "next" ? 1 : -1);

    // swaping order
    const tmpCard = currentLevel.cards[currentIndex];
    currentLevel.cards[currentIndex] = currentLevel.cards[targetIndex];
    currentLevel.cards[targetIndex] = tmpCard;

    showDebug(`moving ${currentIndex} to ${targetIndex}`);
    renderCard({ direction: orderDirection });
}

function setupKeybindings() {
    vars.screen.key(['g'], function (ch, key) {
        renderCard({ index: 0 })
    });
    vars.screen.key(['S-g'], function (ch, key) {
        renderCard({ index: -1 })
    });
    vars.screen.key(['j'], function (ch, key) {
        renderCard({ direction: "next" })
    });
    vars.screen.key(['k'], function (ch, key) {
        renderCard({ direction: "previous" })
    });
    vars.screen.key(['S-j'], function (ch, key) {
        moveCardToIndex({ orderDirection: "next" })
    });
    vars.screen.key(['S-k'], function (ch, key) {
        moveCardToIndex({ orderDirection: "previous" })
    });

    vars.screen.key(['f'], function (ch, key) {
        renderCard({ side: "toggle" })
    });

    vars.screen.key(
        ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        function (ch, key) {
            renderCard({ level: ch })
        }
    );
    vars.screen.key(['l'], function (ch, key) {
        renderCard({ levelDirection: "next" })
    });
    vars.screen.key(['h'], function (ch, key) {
        renderCard({ levelDirection: "previous" })
    });
    vars.screen.key(['S-l'], function (ch, key) {
        moveCardToLevel({ levelDirection: "next" })
    });
    vars.screen.key(['S-h'], function (ch, key) {
        moveCardToLevel({ levelDirection: "previous" })
    });

    vars.screen.key(['e'], function (ch, key) {
        vars.screen.destroy();
        explorer.init({ cb: init });
    });

    vars.screen.key(['s'], function (ch, key) {
        saveList();
    });

    vars.screen.key(['q', 'C-c'], function (ch, key) {
        return process.exit(0);
    });
}

function init() {
    vars.model = getModel().model;

    const { screen, debugBox } = newScreen({ title: 'flashcards' });
    vars.screen = screen;

    // vars.screen.append(painter.box({
    //     width: '10%',
    //     content: `${JSON.stringify(vars.model)}`,
    //     tags: true
    // }));
    // vars.screen.render();

    setupKeybindings();
    renderCard({ index: 0 });
}

export default {
    init
}