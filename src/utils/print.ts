import { colorMe } from "@eveffer/color-me";
import { center } from "./format.ts";

export type Color = keyof typeof colorMe;

const encoder = new TextEncoder();

export function print(content: string, color?: Color) {
  let output = content;
  if (color) {
    output = colorMe[color](content);
  }
  Deno.stdout.write(encoder.encode(output));
}

export function println(content: string, color?: Color) {
  print(`${content}\n`, color);
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
