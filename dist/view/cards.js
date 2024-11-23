"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blessed_1 = __importDefault(require("blessed"));
const model_1 = require("../model/model");
const screen_1 = require("./screen");
const explorer_1 = __importDefault(require("./explorer"));
const srs_sm2_1 = require("../tools/srs-sm2");
const tools_1 = __importDefault(require("../tools/tools"));
let vars = {
    tmpCardLevel: undefined,
    model: {},
    screen: {},
    unsavedActions: 0,
    stats: {
        visible: false,
        statsCard: {},
        statsCardText: {},
    },
    info: {
        visible: false,
        infoCard: {},
        infoCardText: {},
    },
};
function renderCard({ id, direction, side, 
// level,
levelDirection, }) {
    vars.screen.realloc();
    // let cardLevel = level ?? vars.model.currentLevel;
    const batches = vars.model.cards;
    let targetBatchDate = vars.model.currentBatchDate;
    if (!batches[targetBatchDate]) {
        vars.model.currentCardSide = 'front';
        const oldestDate = Object.keys(batches).reduce((oldestDate, batchDate, index, list) => {
            // skipping the ignored batch
            if (batchDate == "ignored") {
                return oldestDate;
            }
            if (batchDate < oldestDate) {
                oldestDate = batchDate;
            }
            return oldestDate;
        }, '9');
        targetBatchDate = oldestDate;
        if (batches[targetBatchDate]) {
            vars.model.currentBatchDate = targetBatchDate;
        }
        else {
            throw new Error('No batches');
        }
    }
    // 1st condition just in case I did "nextLevel" on 1st render
    if (batches[targetBatchDate] && levelDirection) {
        const neighbords = tools_1.default.getNeighbors({
            list: Object.keys(batches),
            target: targetBatchDate,
            initialNeighbors: { min: '-1', max: '9999' },
            blackList: ['ignored']
        });
        if (batches[neighbords[levelDirection]]) {
            (0, screen_1.showDebug)(`=> ${neighbords.min} - ${neighbords.previous} - ${targetBatchDate} - ${neighbords.next} - ${neighbords.max}`);
            targetBatchDate = neighbords[levelDirection];
            vars.model.currentBatchDate = targetBatchDate;
            // showDebug(`${levelDirection}-level: ${targetBatchDate} - ${neighbords.err}`);
        }
        else {
            throw new Error(`No neighbords, ${levelDirection}: ${neighbords[levelDirection]}`);
        }
    }
    let currentBatch = batches[targetBatchDate];
    const currentBatchKeys = Object.keys(currentBatch);
    const currentBatchLength = currentBatchKeys.length;
    if (currentBatchLength == 0) {
        delete vars.model.cards[targetBatchDate];
        // next batch
        renderCard({ id, direction, side });
        // skip this empty batch
        return;
    }
    let currentCardId = id ?? vars.model.currentCardId;
    let currentCardIndex;
    let currentCard = currentBatch[currentCardId];
    if (!currentCard) {
        vars.model.currentCardSide = 'front';
        currentCardId = currentBatchKeys[0];
        currentCard = currentBatch[currentCardId];
    }
    if (direction) {
        vars.model.currentCardSide = 'front';
        if (direction == 'next') {
            currentCardId = currentBatchKeys[((currentBatchKeys.indexOf(currentCardId) + 1) + currentBatchLength) % currentBatchLength];
        }
        else if (direction == 'previous') {
            currentCardId = currentBatchKeys[((currentBatchKeys.indexOf(currentCardId) - 1) + currentBatchLength) % currentBatchLength];
        }
        currentCard = currentBatch[currentCardId];
    }
    currentCardIndex = currentBatchKeys.indexOf(currentCardId);
    (0, screen_1.showDebug)(`args: cardId(${currentCardId}) cardContent(${currentCard.content.front.content})`);
    (0, screen_1.showDebug)(`args: cardIdx(${currentCardIndex}) dir(${direction}) side(${vars.model.currentCardSide})`);
    vars.model.currentCardId = currentCardId;
    let currentCardSide = vars.model.currentCardSide;
    if (side) {
        if (side == 'toggle') {
            currentCardSide = currentCardSide == 'front' ? 'back' : 'front';
        }
        else {
            currentCardSide = side;
        }
        vars.model.currentCardSide = currentCardSide;
    }
    let cardContent = '';
    const cardContentTmp = currentCard.content[currentCardSide].content;
    if (Array.isArray(cardContentTmp)) {
        cardContent = cardContentTmp.join('\n');
    }
    else {
        cardContent = cardContentTmp;
    }
    // showDebug(`endargs: idx(${cardId}) side(${currentCardSide}) level(${currentCard.srsProps.level})`);
    // showDebug(`content: ${cardContent}`);
    const card = screen_1.painter.box({
        top: 0,
        left: 0,
        width: '100%',
        height: '50%',
        border: 'line',
        tags: true,
    });
    vars.screen.append(card);
    const title = screen_1.painter.text({
        top: 0,
        left: 'center',
        content: `Due: ${targetBatchDate} - L: ${vars.tmpCardLevel ? "> " + vars.tmpCardLevel + " <" : currentCard.srsProps.level} - Index: ${currentCardIndex}/${currentBatchLength} - Face: ${currentCardSide} - [Unsaved: ${vars.unsavedActions}]`,
        tags: true,
    });
    card.append(title);
    if (currentCardSide == 'back') {
        const wordSubTitle = screen_1.painter.text({
            top: 2,
            left: 'center',
            content: `${currentCard.content.front.content}`,
            tags: true,
        });
        card.append(wordSubTitle);
    }
    const text = screen_1.painter.text({
        top: 'center',
        left: currentCardSide == 'front' ? 'center' : 0,
        content: cardContent,
        tags: true,
    });
    card.append(text);
    card.focus();
    vars.screen.render();
}
function moveCardToLevel({ levelDirection, }) {
    const currentLevelKey = vars.model.currentLevel;
    const currentLevel = vars.model.levels[currentLevelKey];
    if (currentLevel.cards.length == 0) {
        (0, screen_1.showDebug)(`level ${currentLevelKey} has no cards`);
        return;
    }
    let targetLevelIndex = (currentLevelKey + (levelDirection == 'next' ? 1 : -1)) %
        vars.model.levels.length;
    if (targetLevelIndex == -1) {
        targetLevelIndex = vars.model.levels.length - 1;
    }
    const targetLevel = vars.model.levels[targetLevelIndex];
    (0, screen_1.showDebug)(`moving ${currentLevelKey} to ${targetLevelIndex}`);
    // showDebug(`${JSON.stringify(currentLevel.cards[currentLevel.currentCardIndex])}`)
    targetLevel.cards.push(currentLevel.cards[currentLevel.currentCardIndex]);
    // showDebug(`${JSON.stringify(targetLevel.cards[currentLevel.currentCardIndex])}`)
    currentLevel.cards.splice(currentLevel.currentCardIndex, 1);
    vars.unsavedActions++;
    (0, model_1.recordHistory)({
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
            id: currentLevel.cards.length == 0 ? 0 : currentLevel.cards.length - 1,
        });
    }
    else {
        vars.model.levels[currentLevelKey].currentCardSide = 'front';
        renderCard({ id: currentLevel.currentCardIndex });
    }
}
function showInfo() {
    vars.screen.realloc();
    const currentCard = vars.model.cards[vars.model.currentBatchDate][vars.model.currentCardId];
    if (!vars.info.visible) {
        vars.info.visible = true;
        let content = `    ===== ${currentCard.content.front.content} =====`;
        content += `\n`;
        content += `\nCreatedAt: ${currentCard.srsProps.creationDate}`;
        content += `\nLastAction: ${currentCard.srsProps.lastReviewDate}`;
        content += `\nNextAction: ${currentCard.srsProps.nextReviewDate}`;
        content += `\nLevel: ${currentCard.srsProps.level}`;
        content += `\nCorrect Repetitions: ${currentCard.srsProps.repetitions}`;
        vars.info.infoCard = screen_1.painter.box({
            top: 'center',
            left: 'center',
            width: '50%',
            height: '30%',
            border: 'line',
            tags: true,
        });
        vars.screen.append(vars.info.infoCard);
        const text = screen_1.painter.text({
            width: '70%',
            height: '70%',
            top: 'center',
            left: 'center',
            tags: true,
        });
        vars.info.infoCard.append(text);
        (0, screen_1.showDebug)(`showing info`);
        text.setContent(content);
    }
    else {
        vars.screen.remove(vars.info.infoCard);
        vars.info.visible = false;
    }
    vars.screen.render();
}
function showStats() {
    vars.screen.realloc();
    if (!vars.stats.visible) {
        vars.stats.visible = true;
        let total = 0;
        const sizes = Object.entries(vars.model.history.lengths)
            .map(([level, lengthObj]) => {
            const lastRecordedLength = lengthObj?.at(-1)?.length ?? 0;
            total += lastRecordedLength;
            // if (lastRecordedLength == 0) {
            //   return undefined;
            // }
            return `${level}: ${lastRecordedLength}`;
        })
            .filter((line) => {
            return !!line;
        });
        const content = sizes.join('\n') + `\n=> Total: ${total}`;
        vars.stats.statsCard = screen_1.painter.box({
            top: 'center',
            left: 'center',
            width: '30%',
            height: '30%',
            border: 'line',
            tags: true,
        });
        vars.screen.append(vars.stats.statsCard);
        const text = screen_1.painter.text({
            width: '70%',
            height: '70%',
            top: 'center',
            left: 'center',
            tags: true,
        });
        vars.stats.statsCard.append(text);
        (0, screen_1.showDebug)(`showing stats`);
        text.setContent(content);
    }
    else {
        vars.screen.remove(vars.stats.statsCard);
        vars.stats.visible = false;
    }
    vars.screen.render();
}
function moveCardToIndex({ orderDirection, }) {
    const currentLevel = vars.model.levels[vars.model.currentLevel];
    if (currentLevel.cards.length == 0) {
        (0, screen_1.showDebug)(`level ${vars.model.currentLevel} has no cards`);
        return;
    }
    const currentIndex = currentLevel.currentCardIndex;
    let targetIndex = (currentIndex + (orderDirection == 'next' ? 1 : -1)) %
        currentLevel.cards.length;
    if (targetIndex == -1) {
        targetIndex = currentLevel.cards.length - 1;
    }
    // swaping order
    const tmpCard = currentLevel.cards[currentIndex];
    currentLevel.cards[currentIndex] = currentLevel.cards[targetIndex];
    currentLevel.cards[targetIndex] = tmpCard;
    (0, screen_1.showDebug)(`moving ${currentIndex} to ${targetIndex}`);
    vars.unsavedActions++;
    renderCard({ direction: orderDirection });
}
function editCard() {
    const form = blessed_1.default.form({
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
    const input = blessed_1.default.textbox({
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
    const textArea = blessed_1.default.textarea({
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
function setCardLevel(level) {
    const cardClone = structuredClone(vars.model.cards[vars.model.currentBatchDate][vars.model.currentCardId]);
    if (!cardClone) {
        throw new Error('setCardLevel: cardClone is undefined');
    }
    const currentCardLevel = cardClone.srsProps.level;
    if (level == 0) {
        // moving card to the "ignored" batch
        if (!vars.model.cards['ignored']) {
            vars.model.cards['ignored'] = {};
        }
        cardClone.srsProps.level = 0;
        vars.model.cards['ignored'][vars.model.currentCardId] = cardClone;
    }
    else {
        const srsCard = new srs_sm2_1.SrsCardC(cardClone.srsProps);
        srsCard.review(level);
        cardClone.srsProps = srsCard.getCardProps();
        // moving card to next preview date batch
        const nextReviewDate = new Date(srsCard.getNextReviewDate()).toISOString().split('T')[0];
        const existingBatch = vars.model.cards[nextReviewDate];
        if (existingBatch) {
            vars.model.cards[nextReviewDate][vars.model.currentCardId] = cardClone;
        }
        else {
            vars.model.cards[nextReviewDate] = { [vars.model.currentCardId]: cardClone };
        }
    }
    // delete old card after moving is successfull
    delete vars.model.cards[vars.model.currentBatchDate][vars.model.currentCardId];
    // Record action in history
    (0, model_1.recordHistory)({
        type: 'move',
        word: vars.model.currentCardId,
        fromLevel: currentCardLevel,
        toLevel: level,
        date: new Date().toISOString(),
    });
    // increment unsaved actions
    vars.unsavedActions++;
}
function setupKeybindings() {
    // vars.screen.key(['g'], function (ch, key) {
    //   renderCard({ id: 0 });
    // });
    // vars.screen.key(['S-g'], function (ch, key) {
    //   renderCard({ id: -1 });
    // });
    vars.screen.key(['j'], function (ch, key) {
        renderCard({ direction: 'next' });
    });
    vars.screen.key(['k'], function (ch, key) {
        renderCard({ direction: 'previous' });
    });
    // vars.screen.key(['S-j'], function (ch, key) {
    //   moveCardToIndex({ orderDirection: 'next' });
    // });
    // vars.screen.key(['S-k'], function (ch, key) {
    //   moveCardToIndex({ orderDirection: 'previous' });
    // });
    vars.screen.key(['f', 'o'], function (ch, key) {
        renderCard({ side: 'toggle' });
    });
    vars.screen.key(['0', '1', '2', '3', '4', '5'], function (ch, key) {
        vars.tmpCardLevel = Number(ch);
        renderCard({});
    });
    vars.screen.key(['space'], function (ch, key) {
        if (vars.tmpCardLevel == undefined) {
            return;
        }
        setCardLevel(vars.tmpCardLevel);
        vars.tmpCardLevel = 0;
        renderCard({});
    });
    // vars.screen.key(
    //   ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    //   function (ch, key) {
    //     renderCard({ level: ch });
    //   },
    // );
    vars.screen.key(['l'], function (ch, key) {
        renderCard({ levelDirection: 'next' });
    });
    vars.screen.key(['h'], function (ch, key) {
        renderCard({ levelDirection: 'previous' });
    });
    // vars.screen.key(['S-l'], function (ch, key) {
    //   moveCardToLevel({ levelDirection: 'next' });
    // });
    // vars.screen.key(['S-h'], function (ch, key) {
    //   moveCardToLevel({ levelDirection: 'previous' });
    // });
    vars.screen.key(['x'], function (ch, key) {
        vars.unsavedActions = 0;
        vars.screen.destroy();
        explorer_1.default.init({ cb: init });
    });
    vars.screen.key(['s'], function (ch, key) {
        vars.model.currentCardSide = 'front';
        (0, model_1.saveList)();
        vars.unsavedActions = 0;
        renderCard({});
    });
    vars.screen.key(['b'], function (ch, key) {
        showStats();
    });
    vars.screen.key(['i'], function (ch, key) {
        showInfo();
    });
    vars.screen.key(['d'], function (ch, key) {
        (0, screen_1.toggleDebugLog)();
    });
    // vars.screen.key(['e'], function (ch, key) {
    //   editCard();
    // });
    vars.screen.key(['q', 'C-c'], function (ch, key) {
        return process.exit(0);
    });
}
function init() {
    vars.model = (0, model_1.getModel)().model;
    const { screen, debugBox } = (0, screen_1.newScreen)({ title: 'flashcards' });
    vars.screen = screen;
    setupKeybindings();
    renderCard({});
}
exports.default = {
    init,
};