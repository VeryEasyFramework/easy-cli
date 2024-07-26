export const keyMap = {
  up: "\x1b[A",
  down: "\x1b[B",
  left: "\x1b[D",
  right: "\x1b[C",
  enter: "\r",
  escape: "\x1b",
  backspace: "\x7f",
  ctrlC: "\x03",
  block: "\u2588",
  ctrlB: "\x02",
  ctrlI: "\x09",
  ctrlU: "\x15",
};

export type KeyMap = typeof keyMap;

type ControlKeys = keyof Pick<KeyMap, "ctrlC" | "ctrlB" | "ctrlI" | "ctrlU">;
type NavigationKeys = keyof Pick<KeyMap, "up" | "down" | "left" | "right">;
type ActionKeys = keyof Pick<KeyMap, "enter" | "escape" | "backspace">;

export type KeyStroke = ControlKeys | NavigationKeys | ActionKeys;
