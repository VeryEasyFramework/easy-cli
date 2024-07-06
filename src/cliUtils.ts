import { colorMe } from "@eveffer/color-me";

function getConsoleWidth() {
  return Deno.consoleSize().columns;
}

function makeFiller(char: string, content: string, wrapSpace: number = 1) {
  const width = getConsoleWidth();
  const filler = char.repeat(
    ((width - content.toString().length) / 2) - wrapSpace,
  );
  return filler;
}

function fillRow(content: string, char: string) {
  colorMe;
  const width = getConsoleWidth();
  const filler = char.repeat((width - content.toString().length) / 2);
  return `${filler} ${content} ${filler}`;
}

export const cliFormatter = {
  makeFiller,
  fillRow,
  getConsoleWidth,
};
