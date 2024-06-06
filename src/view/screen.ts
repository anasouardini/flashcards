import blessed from 'blessed';
export const painter = blessed;

const vars = {
  screen: {} as blessed.Widgets.Screen,
  debugBox: {} as blessed.Widgets.BoxElement,
  debugLogsVisible: false,
};
const newScreenObj = newScreen({ title: 'flashcards' });
vars.screen = newScreenObj.screen;
vars.debugBox = newScreenObj.debugBox;

export function newScreen({ title }: { title?: string }) {
  const screen = painter.screen({
    smartCSR: true,
    title,
  });

  // debug box
  const debugBox = painter.box({
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

export function getScreen() {
  return vars.screen;
}

export function showDebug(msg: string) {
  const lines = vars.debugBox.content.split('\n');
  if (lines.length > 30) {
    lines.shift();
    vars.debugBox.content = lines.join('\n');
  }

  vars.debugBox.setContent(`${vars.debugBox.content}\n${msg}`);
  vars.screen.render();
}

export function toggleDebugLog() {
  if (vars.debugBox.hidden) {
    vars.debugBox.show();
    vars.debugLogsVisible = true;
  } else {
    vars.debugBox.hide();
    vars.debugLogsVisible = false;
  }

  vars.screen.render();
}
