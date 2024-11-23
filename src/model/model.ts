import fs from 'fs';
import path from 'path';
import localVars from '../tools/vars';

import { exec } from 'child_process';
import { ClassProperties } from '../tools/ts-tools';
import { type SrsLevel, type SrsCardC, type SrsCardProps } from '../tools/srs-sm2';

export type CardSide = 'front' | 'back';
export interface CardFrontSide {
  content: string;
}
export interface CardBackSide {
  content: string | string[];
}

export interface Card {
  content: {
    front: CardFrontSide;
    back: CardBackSide;
  },
  srsProps: SrsCardProps
}

export type CardLevel = SrsLevel;
export interface ActionAdd {
  type: 'add';
  word: string | string[];
  date: string;
}
export interface ActionMove {
  type: 'move';
  word: string | string[];
  fromLevel: CardLevel;
  toLevel: CardLevel;
  date: string;
}
// export interface ActionIgnore {
//   type: 'ignore';
//   fromLevel: CardLevel;
//   word: string;
//   date: string;
// }
export interface ActionEdit {
  type: 'edit';
  word: string;
  date: string;
}

export type ActionHistory = ActionAdd | ActionMove | ActionEdit;
export type LengthHistory =
  Record<
    CardLevel,
    {
      length: number;
      date: string;
    }[]
  >;

export interface Model {
  currentCardId: string;
  currentCardSide: CardSide;
  currentBatchDate: string;
  cards: Record<string, Record<string, Card>>;// {'date': {'wordId': Card}}
  history: {
    actions: (ActionHistory)[];
    lengths: LengthHistory
  };
}

const vars = {
  model: {} as Model,
  paths: {
    data: localVars.storePath,
    currentFile: '',
  },
};

export function recordHistory(action: ActionHistory) {
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
  } else if (action.type === 'move') {
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

function fixLengths(model: Model) {
  let updatedLength: Record<CardLevel, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  updatedLength = Object.values(model.cards).reduce((acc, cardBatch) => {
    Object.values(cardBatch).forEach((card) => { acc[card.srsProps.level]++ });
    return acc;
  }, updatedLength)

  Object.entries(updatedLength).forEach(([level, value]) => {
    // @ts-ignore
    const lvl = level as SrsLevel;

    model.history.lengths[lvl].push({
      length: value,
      date: new Date().toISOString(),
    })
  })
}

function fixActions(model: Model) {
  const fixedActions = model.history.actions.filter((actionObj, index) => {
    if (actionObj.type == 'move') {
      if (actionObj.fromLevel == actionObj.toLevel) {
        return false;
      }

      actionObj.toLevel = Number(actionObj.toLevel) as SrsLevel;
    }

    return true;
  })

  model.history.actions = fixedActions;
}

function compressDates(model: Model) {
  model.history.actions.forEach((actionObj) => {
    actionObj.date = actionObj.date.split('T')[0];
  })
}

function compressActions(model: Model) {
  const compressedActions: ActionHistory[] = [];
  model.history.actions.forEach((current, index) => {
    let prior: ActionHistory | undefined = compressedActions.at(-1);

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
    } else if (current.type == 'add' && prior.type == 'add') {
      compressedActions.at(-1).word = [prior.word, current.word].flat();
    }
  })

  vars.model.history.actions = compressedActions;
}

export function loadList({ item }: { item: string }) {
  let content;
  vars.paths.currentFile = path.join(vars.paths.data, `${item}`);
  try {
    // console.log({
    //   path: vars.paths.currentFile,
    // })
    content = fs.readFileSync(vars.paths.currentFile, 'utf-8');
  } catch (E) {
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
  } catch (E) {
    console.log(`data/${item} is not valid`);
  }
}

export function saveList(model?: Model) {
  fs.writeFileSync(vars.paths.currentFile, JSON.stringify(model ?? vars.model, null, 2));
}

export function getModel() {
  return vars;
}

export function listCollections() {
  const dataFiles = fs.readdirSync(vars.paths.data);
  const jsonFiles = dataFiles.filter((file) => file.endsWith('.json'));
  return jsonFiles;
}
