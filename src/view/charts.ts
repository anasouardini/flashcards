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