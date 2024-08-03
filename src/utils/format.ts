import { colorMe } from "@vef/color-me";
import type { Color } from "./print.ts";

export function getConsoleWidth() {
  return Deno.consoleSize().columns;
}

export function getCenterOffset(content: string, width: number) {
  const controlCharacters = content.match(/\u001b\[[0-9;]*m/g) || [];
  let controlCharactersLength = controlCharacters.join("").length;

  if (controlCharactersLength < 0) {
    controlCharactersLength = 0;
  }
  const contentLength = content.length - controlCharactersLength;
  const result = (width - contentLength) / 2;
  // round to the nearest whole number
  return Math.round(result);
}
export function center(content: string, char?: string, options?: {
  contentColor?: Color;
  fillerColor?: Color;
  color?: Color;
}) {
  const repeatChar = char || " ";
  const width = getConsoleWidth();

  const controlCharacters = content.match(/\u001b\[[0-9;]*m/g) || [];
  let controlCharactersLength = controlCharacters.join("").length;

  if (controlCharactersLength < 0) {
    controlCharactersLength = 0;
  }

  const contentLength = content.length - controlCharactersLength;

  let filler = repeatChar.repeat(
    (width - contentLength - 2) / 2,
  );
  if (options?.color) {
    return colorMe[options.color](`${filler} ${content} ${filler}`);
  }
  if (options?.contentColor) {
    content = colorMe[options.contentColor](content);
  }
  if (options?.fillerColor) {
    filler = colorMe[options.fillerColor](filler);
  }
  return `${filler} ${content} ${filler}`;
}
