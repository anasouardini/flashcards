"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../model/model");
const screen_1 = require("./screen");
const vars = {
    screen: {},
    list: {},
    cursor: 0,
    items: [],
};
let callBack;
function setupKeybindings() {
    // list.on('select', function (item) {
    //     console.log('llll');
    //     screen.render();
    // });
    function keyPressHandler(ch, key) {
        // console.log(ch, key);
        if (key.name == 'return' || key.name == 'l') {
            // list.removeListener('keypress', keyPressHandler);
            // screen.realloc();
            // // for (let i = 0; i < screen.children.length; i++) {
            // screen.children.pop()
            // // }
            // screen.focusNext();
            vars.screen.destroy();
            (0, model_1.loadList)({ item: vars.items[vars.cursor] });
            callBack();
        }
        if (ch == 'g') {
            vars.list.select(0);
            vars.screen.render();
        }
        if (key.full == 'S-g') {
            vars.list.select(vars.items.length - 1);
            vars.screen.render();
        }
        if (ch == 'j') {
            const newCursor = (vars.cursor + 1) % vars.items.length;
            vars.list.select(newCursor);
            vars.cursor = newCursor;
            vars.screen.render();
        }
        if (ch == 'k') {
            let newCursor = 0;
            if (vars.cursor == 0) {
                newCursor = vars.items.length - 1;
                vars.list.select(newCursor);
            }
            else {
                newCursor = (vars.cursor - 1) % vars.items.length;
                vars.list.select(newCursor);
            }
            vars.cursor = newCursor;
            vars.screen.render();
        }
        if (ch == 'd') {
            (0, screen_1.toggleDebugLog)();
        }
        // screen.key(['/'], function (ch, key) {
        //     const idx = list.fuzzyFind('3');
        //     list.select(idx);
        //     screen.render();
        // });
    }
    vars.list.on('keypress', keyPressHandler);
}
function init({ cb }) {
    vars.cursor = 0;
    vars.items = (0, model_1.listCollections)();
    vars.screen = (0, screen_1.newScreen)({ title: 'menu' }).screen;
    vars.list = screen_1.painter.list({
        top: 0,
        left: 0,
        width: '50%',
        height: '50%',
        border: 'line',
        selectedFg: 'red',
        style: {
            border: {
                fg: 'red',
            },
            selected: {
                bg: 'red',
            },
        },
        items: [...vars.items],
        search: (l1, l2) => {
            console.log(l1, l2);
        },
    });
    vars.screen.append(vars.list);
    vars.list.focus();
    vars.screen.render();
    setupKeybindings();
    callBack = cb;
}
exports.default = {
    init,
};
