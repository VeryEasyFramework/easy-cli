import { BasicFgColor, ColorMe, StyleOptions } from "#/utils/colors.ts";

export function getConsoleWidth(): number {
  return Deno.consoleSize().columns;
}
export function getCharCount(content: string): number {
  const bytes = new TextEncoder().encode(content);
  let count = 0;
  let inAnsi = false;
  for (let i = 0; i < bytes.length; i++) {
    if (inAnsi) {
      if (bytes[i] == 109) {
        inAnsi = false;
      }
      continue;
    }
    if (bytes[i] == 0x1b) {
      inAnsi = true;
      continue;
    }
    if (bytes[i] >= 0x20 && bytes[i] <= 0x7e) {
      count++;
    }
  }

  return count;
}
export function getCenterOffset(content: string, width: number): number {
  const contentLength = getCharCount(content);
  const result = (width - contentLength) / 2;
  // round to the nearest whole number
  return Math.round(result);
}
export function center(content: string, char?: string, options?: {
  contentColor?: BasicFgColor;
  fillerColor?: BasicFgColor;
  color?: BasicFgColor;
}): string {
  const repeatChar = char || " ";
  const width = getConsoleWidth();

  const contentLength = getCharCount(content);
  let center = (width - contentLength - 2) / 2;
  if (center < 0) {
    center = 0;
  }
  let filler = repeatChar.repeat(
    center,
  );
  if (options?.color) {
    return ColorMe.standard().content(content).color(options.color).format();
  }
  if (options?.contentColor) {
    content = ColorMe.standard().content(content).color(options.contentColor)
      .format();
  }
  if (options?.fillerColor) {
    filler = ColorMe.standard().content(filler).color(options.fillerColor)
      .format();
  }
  return `${filler} ${content} ${filler}`;
}

export function fill(
  char: string,
  options?: StyleOptions,
): string {
  const width = getConsoleWidth();
  const line = char.repeat(width);
  if (options) {
    const color = options.color || "white";
    return ColorMe.fromOptions(line, { color, ...options });
  }
  return line;
}
