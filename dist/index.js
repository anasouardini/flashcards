"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cards_1 = __importDefault(require("./view/cards"));
const explorer_1 = __importDefault(require("./view/explorer"));
const result = explorer_1.default.init({ cb: cards_1.default.init });
