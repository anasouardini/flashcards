import fs from 'fs';
import path from 'path';

export type CardSide = "front" | "back";
export interface CardFrontSide {
    content: string | string[]
}
export interface CardBackSide {
    content: string | string[]
}
export interface Level {
    currentCardIndex: number
    currentCardSide: CardSide
    cards: {
        front: CardFrontSide
        back: CardBackSide
    }[]
}
export interface Model {
    currentLevel: number,
    levels: Level[]
}

const vars = {
    model: {} as Model,
    paths: {
        data: path.join(__dirname, "..", "data"),
        currentFile: ""
    }
}

export function loadList({ item }: { item: string }) {
    let content;
    try {
        vars.paths.currentFile = path.join(vars.paths.data, `${item}`);
        content = fs.readFileSync(vars.paths.currentFile, "utf-8");
    } catch (E) {
        // console.log(content)
        console.log(`data/${item} not found`);
        return;
    }

    try {
        vars.model = JSON.parse(content);
    } catch (E) {
        if (vars.model?.levels) { process.exit() }
        console.log(`data/${item} is not valid`);
    }
}

export function saveList() {
    fs.writeFileSync(vars.paths.currentFile, JSON.stringify(vars.model));
}

export function getModel() {
    return vars;
}

export function listCollections() {
    const dataFiles = fs.readdirSync(path.join(__dirname, '..', 'data'));
    const jsonFiles = dataFiles.filter(file => file.endsWith('.json'));
    return jsonFiles;
}