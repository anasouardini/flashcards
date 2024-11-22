"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleDebugLog = exports.showDebug = exports.getScreen = exports.newScreen = exports.painter = void 0;
const blessed_1 = __importDefault(require("blessed"));
exports.painter = blessed_1.default;
const vars = {
    screen: {},
    debugBox: {},
    debugLogsVisible: false,
};
const newScreenObj = newScreen({ title: 'flashcards' });
vars.screen = newScreenObj.screen;
vars.debugBox = newScreenObj.debugBox;
function newScreen({ title }) {
    const screen = exports.painter.screen({
        smartCSR: true,
        title,
    });
    // debug box
    const debugBox = exports.painter.box({
        top: 0,
        right: 0,
        width: '400',
        height: '100%',
        content: 'start',
        hidden: !vars.debugLogsVisible,
        tags: true,
        border: {
            type: 'line',
        },
        style: {
            border: {
                fg: 'red',
            },
        },
    });
    screen.append(debugBox);
    screen.render();
    screen.key(['q', 'C-c'], function (ch, key) {
        return process.exit(0);
    });
    return { screen, debugBox };
}
exports.newScreen = newScreen;
function getScreen() {
    return vars.screen;
}
exports.getScreen = getScreen;
function showDebug(msg) {
    const lines = vars.debugBox.content.split('\n');
    if (lines.length > 30) {
        lines.shift();
        vars.debugBox.content = lines.join('\n');
    }
    vars.debugBox.setContent(`${vars.debugBox.content}\n${msg}`);
    vars.screen.render();
}
exports.showDebug = showDebug;
function toggleDebugLog() {
    if (vars.debugBox.hidden) {
        vars.debugBox.show();
        vars.debugLogsVisible = true;
    }
    else {
        vars.debugBox.hide();
        vars.debugLogsVisible = false;
    }
    vars.screen.render();
}
exports.toggleDebugLog = toggleDebugLog;
