import { colorMe, type ColorOptions } from "@vef/color-me";

export type Color = keyof typeof colorMe;

const encoder = new TextEncoder();

export function print(content: string, color?: Color, options?: ColorOptions) {
  let output = content;

  if (color) {
    output = colorMe[color](content, options);
  }
  if (!color && options) {
    output = colorMe.white(content, options);
  }
  Deno.stdout.write(encoder.encode(output));
}

export function println(content: string, color?: Color) {
  print(`${content}\n`, color);
}

export function goToTop() {
  print("\x1b[H");
}
export function goTo(row: number, column: number) {
  print(`\x1b[${row};${column}H`);
}

export function goToColumn(column: number) {
  print(`\x1b[${column}G`);
}

export function clearScreen() {
  print("\x1b[2J");
}

export function clearCurrentLine() {
  print("\x1b[2K");
}
export function clearLine(line: number, options?: {
  start: number;
  end: number;
}) {
  goTo(line, options?.start || 0);
  if (options?.end) {
    print(" ".repeat(options.end - options.start));
    return;
  }
  clearCurrentLine();
}

export function clearLines(start: number, end: number) {
  for (let i = start; i <= end; i++) {
    clearLine(i);
  }
}

export function clear() {
  goToTop();
  clearScreen();
}

export const symbols = {
  block: "█",
  upArrow: "▲",
  upArrowAlt: "↑",
  downArrow: "▼",
  downArrowAlt: "↓",
  enter: "↵",
  cursor: "❯",
};
