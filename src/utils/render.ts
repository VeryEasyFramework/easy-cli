import { colorMe, ColorName, ColorOptions } from "@eveffer/color-me";
import { asyncPause, hideCursor, keyMap, listenForInput } from "../cliUtils.ts";
import { Color, print, println } from "./print.ts";

import { generateRandomString } from "@eveffer/string-utils";

type HorizontalAlignment = "left" | "right" | "center";
type Justify =
  | "start"
  | "end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";
type StyleOptions = ColorOptions & { color?: ColorName };

type ElementID = string;

class Row {
  justify: Justify;
  elements: Array<Element>;
  line: number;
  get width() {
    return this.elements.reduce((acc, element) => {
      return acc + element.content.length;
    }, 0);
  }

  constructor(
    options: { justify: Justify; elements: Array<Element>; line: number },
  ) {
    this.justify = options.justify;
    this.elements = options.elements;
    this.line = options.line;
  }

  getContentArray(
    containerWidth: number,
  ): Array<
    {
      content: Array<string>;
      style: StyleOptions;
      offsetX: number;
    }
  > {
    const totalWidth = this.width;
    const elementCount = this.elements.length;
    const space = " ".repeat(containerWidth - totalWidth);
    const diff = containerWidth - totalWidth;
    let offsetX = 0;

    switch (this.justify) {
      case "start": {
        return this.elements.map((element) => {
          const content = element.content.split("");
          const style = element.style;
          const result = {
            content,
            style,
            offsetX,
          };
          offsetX += element.content.length;
          return result;
        });
      }
      case "end": {
        return this.elements.map((element) => {
          const content = element.content.split("");
          const style = element.style;
          const result = {
            content,
            style,
            offsetX: offsetX + diff,
          };
          offsetX += element.content.length;
          return result;
        });
      }
      case "center": {
        const offset = Math.floor(diff / 2);
        return this.elements.map((element) => {
          const content = element.content.split("");
          const style = element.style;
          const result = {
            content,
            style,
            offsetX: offsetX + offset,
          };
          offsetX += element.content.length;
          return result;
        });
      }
      case "space-between": {
        const spaceBetween = Math.floor(diff / (elementCount - 1));
        return this.elements.map((element) => {
          const content = element.content.split("");
          const style = element.style;
          const result = {
            content,
            style,
            offsetX,
          };
          offsetX += element.content.length + spaceBetween;
          return result;
        });
      }
      case "space-around": {
        const spaceAround = Math.floor(diff / elementCount);

        return this.elements.map((element) => {
          const content = element.content.split("");
          const style = element.style;
          const result = {
            content,
            style,
            offsetX,
          };
          offsetX += element.content.length + spaceAround;
          return result;
        });
      }
      case "space-evenly": {
        const spaceEvenly = Math.floor(diff / (elementCount + 1));
        offsetX += spaceEvenly;
        return this.elements.map((element) => {
          const content = element.content.split("");
          const style = element.style;
          const result = {
            content,
            style,
            offsetX,
          };
          offsetX += element.content.length + spaceEvenly;
          return result;
        });
      }
    }
  }
}
class Element {
  id: ElementID;
  _content: string | (() => string);
  style: StyleOptions;

  get content(): string {
    return typeof this._content === "function"
      ? this._content()
      : this._content;
  }
  set content(value: string | (() => string)) {
    this._content = value;
  }
  constructor(options: {
    content: string | (() => string);
    style?: StyleOptions;
    horizontalAlignment?: HorizontalAlignment;
  }) {
    this.id = generateRandomString(8);
    this._content = options.content;

    this.style = options.style || {};
  }
}
interface LineOptions extends ColorOptions {
  color?: ColorName;
  center?: boolean;
}
class Renderer {
  title = "Clock";
  pixels: Array<Array<string>> = [];

  refreshRate = 50;
  height = 20;
  private _width: number;

  rows: Array<Row> = [];

  get width() {
    return this._width;
  }

  constructor(
    options?: {
      refreshRate?: number;
      height?: number;
      width?: number;
      elements?: Array<Element>;
    },
  ) {
    this._width = 0;
    this.height = options?.height || this.height;
  }

  get consoleSize() {
    return Deno.consoleSize();
  }

  buildScreen() {
    this.pixels = [];
    const { columns, rows } = this.consoleSize;
    this._width = columns;

    for (let i = 0; i < this.height; i++) {
      const line = new Array(columns).fill(" ");
      line[0] = colorMe.bgBrightBlue("|");
      line[columns - 1] = colorMe.bgBrightBlue("|");
      this.pixels.push(line);
    }
  }

  createElement(
    content: string | (() => string),
    row?: number,
    style?: StyleOptions,
    horizontalAlignment?: HorizontalAlignment,
  ) {
    const element = new Element({
      content,
      style,
    });
    this.addElementToRow(element, row || this.getLastRow());
    return element.id;
  }

  getLastRow() {
    this.rows.sort((a, b) => a.line - b.line);
    return this.rows[this.rows.length - 1]?.line || 0;
  }
  addElementToRow(element: Element, row: number) {
    const existingRow = this.rows.find((r) => r.line === row);
    if (existingRow) {
      existingRow.elements.push(element);
    } else {
      this.rows.push(
        new Row({
          justify: "space-evenly",
          elements: [element],
          line: row,
        }),
      );
    }
  }

  getElement(id: string) {
    for (const row of this.rows) {
      const element = row.elements.find((element) => element.id === id);
      if (element) {
        return element;
      }
    }
  }

  updateElement(
    id: ElementID,
    options: {
      line?: number;
      content?: string;
      style?: StyleOptions;
      horizontalAlignment?: HorizontalAlignment;
    },
  ) {
    const element = this.getElement(id);
    if (element) {
      const { content, style } = options;
      element.content = content || element.content;
      element.style = {
        ...element.style,
        ...style,
      };
    }
  }

  removeElement(id: ElementID) {
    for (const row of this.rows) {
      row.elements = row.elements.filter((element) => element.id !== id);
    }
  }

  printFiller(char?: string, color?: Color) {
    const { columns } = this.consoleSize;
    const filler = char || " ";
    println(filler.repeat(columns), color);
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
    this.pixels[y][x] = value;
  }

  setPixelColor(x: number, y: number, color: Color) {
    this.pixels[y][x] = colorMe[color](this.pixels[y][x]);
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

  placeElements() {
    const { columns } = this.consoleSize;
    const rows = this.rows.sort((a, b) => a.line - b.line);
    for (const row of rows) {
      const rowContent = row.getContentArray(columns);
      for (const { offsetX, content, style } of rowContent) {
        this.setPixels(offsetX, row.line, content, style);
      }
    }
  }
  renderScreen() {
    console.clear();

    this.buildScreen();

    // this.buildScreen();

    this.printFiller(" ", "bgBrightBlue");

    this.placeElements();
    const outputLines = this.pixels.map((line) => line.join("")).join("\n");
    print(outputLines);
    this.printFiller(" ", "bgBrightBlue");
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
  const helloElementID = renderer.createElement("Hello", 5, {
    color: "red",
    bold: true,
  });
  renderer.createElement("World", 5, {
    color: "green",
    italic: true,
  });
  renderer.createElement("Worlsd", 5, {
    color: "blue",
    italic: true,
  });

  renderer.createElement("tt", 5, {
    color: "yellow",
    italic: true,
  });
  renderer.createElement(
    () => new Date().toLocaleTimeString(),
    10,
    {},
    "center",
  );
  renderer.run();
  await asyncPause(1000);

  let someString = "";

  listenForInput((key) => {
    const element = renderer.getElement(helloElementID);
    if (!element) {
      return;
    }

    switch (key) {
      case keyMap.down:
        // renderer.updateElement(helloElementID, {
        //   line: element.line + 1,
        // });
        break;
      case keyMap.up:
        // renderer.updateElement(helloElementID, {
        //   line: element.line - 1,
        // });
        break;
      case keyMap.left:
        // renderer.updateElement(helloElementID, {
        //   horizontalAlignment: element.horizontalAlignment === "right"
        //     ? "center"
        //     : "left",
        // });
        break;
      case keyMap.right:
        // renderer.updateElement(helloElementID, {
        //   horizontalAlignment: element.horizontalAlignment === "left"
        //     ? "center"
        //     : "right",
        // });
        break;
      case keyMap.ctrlB:
        renderer.updateElement(helloElementID, {
          style: {
            bold: !element.style.bold,
          },
        });
        break;
      case keyMap.ctrlI:
        renderer.updateElement(helloElementID, {
          style: {
            italic: !element.style.italic,
          },
        });
        break;
      case keyMap.ctrlU:
        renderer.updateElement(helloElementID, {
          style: {
            underline: !element.style.underline,
          },
        });
        break;
    }
  });

  // renderer.title = "New Clock";
}
