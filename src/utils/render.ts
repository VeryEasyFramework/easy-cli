import { colorMe, ColorName, ColorOptions } from "@eveffer/color-me";
import { asyncPause, hideCursor } from "../cliUtils.ts";
import { Color, print, println } from "./print.ts";
import { center } from "./format.ts";

interface LineOptions extends ColorOptions {
  color?: ColorName;
  center?: boolean;
}
class Renderer {
  title = "Clock";
  lines: Array<Array<string>> = [];
  refreshRate = 50;
  height = 20;
  constructor() {
  }

  get consoleSize() {
    return Deno.consoleSize();
  }

  buildScreen() {
    const { columns, rows } = this.consoleSize;
    this.height = rows - 4;

    for (let i = 0; i < this.height; i++) {
      const line = new Array(columns).fill(" ");
      line[0] = "|";
      line[columns - 1] = "|";
      this.lines.push(line);
    }
  }
  printFiller(char?: string) {
    const { columns } = this.consoleSize;
    const filler = char || " ";
    println(filler.repeat(columns));
  }
  setPixel(x: number, y: number, value: string, options?: LineOptions) {
    if (options?.color) {
      value = colorMe[options.color](value, options);
    } else {
      value = colorMe.white(value, options);
    }
    if (x <= 0) {
      x = 1;
    }
    this.lines[y][x] = value;
  }

  setPixelColor(x: number, y: number, color: Color) {
    this.lines[y][x] = colorMe[color](this.lines[y][x]);
  }

  setPixels(
    x: number,
    y: number,
    values: Array<string>,
    options?: LineOptions,
  ) {
    if (x <= 0) {
      x = 1;
    }
    for (let i = 0; i < values.length; i++) {
      this.setPixel(x + i, y, values[i], options);
    }
  }

  setLine(lineNumber: number, value: string, options?: LineOptions) {
    const chars = value.split("");
    let offset = 0;
    if (options?.center) {
      const { columns } = this.consoleSize;
      const diff = columns - chars.length;
      offset = Math.floor(diff / 2);
    }
    this.setPixels(offset, lineNumber, chars, options);
  }

  renderScreen() {
    console.clear();
    const time = new Date().toLocaleTimeString();

    this.printFiller("=");
    this.setLine(0, this.title, {
      center: true,
      color: "brightGreen",
      underline: true,
      bold: true,
    });
    this.setLine(1, time);
    const outputLines = this.lines.map((line) => line.join("")).join("\n");
    print(outputLines);
    this.printFiller("=");
  }

  async run() {
    await asyncPause(500);
    this.buildScreen();
    hideCursor();

    while (true) {
      this.renderScreen();
      await asyncPause(this.refreshRate);
    }
  }
}

if (import.meta.main) {
  const renderer = new Renderer();
  renderer.run();
  await asyncPause(2000);
  renderer.title = "New Clock";
}
