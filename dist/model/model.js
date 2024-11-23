"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCollections = exports.getModel = exports.saveList = exports.loadList = exports.recordHistory = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vars_1 = __importDefault(require("../tools/vars"));
const vars = {
    model: {},
    paths: {
        data: vars_1.default.storePath,
        currentFile: '',
    },
};
function recordHistory(action) {
    if (action.type == 'move' && action.fromLevel == action.toLevel) {
        return;
    }
    // adding new action objects
    vars.model.history.actions.push(action);
    // update length of all levels
    if (action.type === 'add') {
        vars.model.history.lengths[0].push({
            length: (vars.model.history.lengths[0]?.at(-1)?.length ?? 0) + 1,
            date: new Date().toISOString(),
        });
    }
    else if (action.type === 'move') {
        vars.model.history.lengths[action.toLevel].push({
            length: (vars.model.history.lengths[action.toLevel]?.at(-1)?.length ?? 0) + 1,
            date: new Date().toISOString(),
        });
        vars.model.history.lengths[action.fromLevel].push({
            length: (vars.model.history.lengths[action.fromLevel]?.at(-1)?.length ?? 0) - 1,
            date: new Date().toISOString(),
        });
    }
}
exports.recordHistory = recordHistory;
function fixLengths(model) {
    let updatedLength = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    updatedLength = Object.values(model.cards).reduce((acc, cardBatch) => {
        Object.values(cardBatch).forEach((card) => { acc[card.srsProps.level]++; });
        return acc;
    }, updatedLength);
    Object.entries(updatedLength).forEach(([level, value]) => {
        // @ts-ignore
        const lvl = level;
        model.history.lengths[lvl].push({
            length: value,
            date: new Date().toISOString(),
        });
    });
}
function fixActions(model) {
    const fixedActions = model.history.actions.filter((actionObj, index) => {
        if (actionObj.type == 'move') {
            if (actionObj.fromLevel == actionObj.toLevel) {
                return false;
            }
            actionObj.toLevel = Number(actionObj.toLevel);
        }
        return true;
    });
    model.history.actions = fixedActions;
}
function compressDates(model) {
    model.history.actions.forEach((actionObj) => {
        actionObj.date = actionObj.date.split('T')[0];
    });
}
function compressActions(model) {
    const compressedActions = [];
    model.history.actions.forEach((current, index) => {
        let prior = compressedActions.at(-1);
        if (!prior) {
            compressedActions.push(current);
            return;
        }
        const sameType = prior.type == current.type;
        const sameDate = prior.date == current.date;
        if (!sameType || !sameDate) {
            compressedActions.push(current);
            return;
        }
        if (current.type == 'move' && prior.type == 'move') {
            const SameFromLevel = prior.fromLevel == current.fromLevel;
            const SameToLevel = prior.toLevel == current.toLevel;
            if (!SameFromLevel || !SameToLevel) {
                compressedActions.push(current);
                return;
            }
            // add current word Id to the prior
            compressedActions.at(-1).word = [prior.word, current.word].flat();
        }
        else if (current.type == 'add' && prior.type == 'add') {
            compressedActions.at(-1).word = [prior.word, current.word].flat();
        }
    });
    vars.model.history.actions = compressedActions;
}
function loadList({ item }) {
    let content;
    vars.paths.currentFile = path_1.default.join(vars.paths.data, `${item}`);
    try {
        // console.log({
        //   path: vars.paths.currentFile,
        // })
        content = fs_1.default.readFileSync(vars.paths.currentFile, 'utf-8');
    }
    catch (E) {
        // console.log(content)
        // console.log(`${vars.paths.currentFile} not found`);
        console.log(`[!] Dictionary "${item.split('.')[0]}" not found`);
        return;
    }
    try {
        vars.model = JSON.parse(content);
        // fixLengths(vars.model);
        // fixActions(vars.model);
        // compressDates(vars.model);
        compressActions(vars.model);
        return vars.model;
    }
    catch (E) {
        console.log(`data/${item} is not valid`);
    }
}
exports.loadList = loadList;
function saveList(model) {
    fs_1.default.writeFileSync(vars.paths.currentFile, JSON.stringify(model ?? vars.model, null, 2));
}
exports.saveList = saveList;
function getModel() {
    return vars;
}
exports.getModel = getModel;
function listCollections() {
    const dataFiles = fs_1.default.readdirSync(vars.paths.data);
    const jsonFiles = dataFiles.filter((file) => file.endsWith('.json'));
    return jsonFiles;
}
exports.listCollections = listCollections;
