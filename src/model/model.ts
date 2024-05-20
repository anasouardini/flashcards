import fs from 'fs';
import path from 'path';

export type CardSide = 'front' | 'back';
export interface CardFrontSide {
  content: string;
}
export interface CardBackSide {
  content: string | string[];
}
export interface Level {
  currentCardIndex: number;
  currentCardSide: CardSide;
  cards: {
    front: CardFrontSide;
    back: CardBackSide;
  }[];
}

export interface ActionAdd {
  type: 'add';
  word: string;
  date: string;
}
export interface ActionMove {
  type: 'move';
  word: string;
  fromLevel: number;
  toLevel: number;
  date: string;
}
export interface ActionTrash {
  type: 'trash';
  word: string;
  date: string;
}
export interface ActionEdit {
  type: 'edit';
  word: string;
  date: string;
}

export type ActionHistory = ActionAdd | ActionMove | ActionTrash | ActionEdit;

export interface LevelHistory {
  lengths: {
    length: number;
    date: string;
  }[];
}

export interface Model {
  currentLevel: number;
  history: {
    actions: (ActionAdd | ActionMove | ActionTrash | ActionEdit)[];
    levels: LevelHistory[];
  };
  levels: Level[];
}

const vars = {
  model: {} as Model,
  paths: {
    data: path.join(__dirname, '..', 'data'),
    currentFile: '',
  },
};

function addNewProperties(obj: Model) {
  if (!obj.history) {
    obj.history = {
      actions: [],
      levels: [
        { lengths: [] },
        { lengths: [] },
        { lengths: [] },
        { lengths: [] },
        { lengths: [] },
        { lengths: [] },
        { lengths: [] },
        { lengths: [] },
        { lengths: [] },
      ],
    };
  }
}

export function recordHistory(
  action: ActionAdd | ActionMove | ActionTrash | ActionEdit,
) {
  // vars.model.history.actions.push(action);
  // vars.model.history.levels.forEach((level, index) => {
  //     level.lengths.push({
  //         length: vars.model.levels[index].cards.length,
  //         date: new Date().toISOString()
  //     });
  // })
}

export function loadList({ item }: { item: string }) {
  let content;
  try {
    vars.paths.currentFile = path.join(vars.paths.data, `${item}`);
    content = fs.readFileSync(vars.paths.currentFile, 'utf-8');
  } catch (E) {
    // console.log(content)
    console.log(`data/${item} not found`);
    return;
  }

  try {
    vars.model = JSON.parse(content);
    addNewProperties(vars.model);
  } catch (E) {
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
  const jsonFiles = dataFiles.filter((file) => file.endsWith('.json'));
  return jsonFiles;
}
