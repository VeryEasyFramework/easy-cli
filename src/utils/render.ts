import { colorMe, type ColorName, type ColorOptions } from "@vef/color-me";
import { asyncPause, hideCursor, keyMap, listenForInput } from "../cliUtils.ts";
import {
  clearLine,
  clearScreen,
  type Color,
  goTo,
  goToTop,
  print,
  println,
} from "./print.ts";

import { generateRandomString } from "@vef/string-utils";
import { getCenterOffset } from "./format.ts";

type HorizontalAlignment = "start" | "end" | "center";
type Justify =
  | "start"
  | "end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";
export type StyleOptions = ColorOptions & { color?: ColorName };

type ElementID = string;

class Row {
  justify: Justify;
  elements: Array<Element>;
  line: number;
  get width(): number {
    return this.elements.reduce((acc, element) => {
      return acc + element.length;
    }, 0);
  }

  constructor(
    options: { justify: Justify; elements: Array<Element>; line: number },
  ) {
    this.justify = options.justify;
    this.elements = options.elements;
    this.line = options.line;
  }

  private mapOffset(
    offset: number,
    offsetCalc: (offset: number, element: Element) => number,
  ) {
    return this.elements.map((element) => {
      offset = offsetCalc(offset, element);
      let content = "";
      if (Array.isArray(element.content)) {
        content = element.content.join("");
      } else {
        content = element.content;
      }
      return {
        content: element.content as string,
        style: element.style,
        offsetX: offset,
      };
    });
  }

  getContentArray(
    containerWidth: number,
    offsetX = 0,
  ): Array<
    {
      content: string;
      padding: {
        padStart: number;
        padEnd: number;
      };
      style: StyleOptions;
      dynamic?: boolean;
      offsetX: number;
    }
  > {
    const totalWidth = this.width;
    const elementCount = this.elements.length;

    const diff = totalWidth - containerWidth;

    switch (this.justify) {
      case "start": {
        return this.elements.map((element) => {
          const offset = offsetX;
          let totalLength = element.length;
          if (
            element.layout?.minWidth &&
            element.layout?.minWidth > element.length
          ) {
            totalLength = element.layout.minWidth;
          }

          offsetX += totalLength;
          return {
            content: element.content as string,
            padding: element.getContentPadding(totalLength),
            style: element.style,
            dynamic: element.dynamic,
            offsetX: offset,
          };
        });
      }
      case "end": {
        return this.elements.map((element) => {
          const offset = offsetX;
          let totalLength = element.length;
          if (
            element.layout?.minWidth &&
            element.layout?.minWidth > element.length
          ) {
            totalLength = element.layout.minWidth;
          }

          offsetX += totalLength;
          return {
            content: element.content as string,
            padding: element.getContentPadding(totalLength),
            style: element.style,
            dynamic: element.dynamic,
            offsetX: offset,
          };
        });
      }
      case "center": {
        const offsetCenter = Math.floor(diff / 2);
        offsetX += offsetCenter;
        return this.elements.map((element) => {
          const offset = offsetX;

          let totalLength = element.length;
          if (
            element.layout?.minWidth &&
            element.layout?.minWidth > element.length
          ) {
            totalLength = element.layout.minWidth;
          }

          offsetX += totalLength;
          return {
            content: element.content as string,
            padding: element.getContentPadding(totalLength),
            style: element.style,
            dynamic: element.dynamic,
            offsetX: offset,
          };
        });
      }
      case "space-between": {
        const spaceBetween = Math.floor(diff / (elementCount - 1));
        throw new Error("Not implemented");
      }
      case "space-around": {
        const spaceAround = Math.floor(diff / elementCount);

        throw new Error("Not implemented");
      }
      case "space-evenly": {
        let defaultLength = containerWidth / elementCount;
        let maxWidthElementCount = 0;
        this.elements.forEach((element) => {
          if (
            element.layout?.maxWidth && element.layout.maxWidth < defaultLength
          ) {
            maxWidthElementCount += 1;
            const diff = defaultLength - element.layout.maxWidth;
            defaultLength += diff / (elementCount - maxWidthElementCount);
          }
        });
        return this.elements.map((element, index) => {
          let totalLength = defaultLength;
          if (
            element.layout?.maxWidth && element.layout.maxWidth < totalLength
          ) {
            totalLength = element.layout.maxWidth;
          }

          offsetX += totalLength;
          return {
            content: element.content as string,
            padding: element.getContentPadding(totalLength),
            style: element.style,
            dynamic: element.dynamic,
            offsetX: offsetX - totalLength,
          };
        });
      }
    }
  }
}
class Element {
  id: ElementID;
  _content: string | (() => string | string[]) | string[];
  _style: StyleOptions | (() => StyleOptions) = {};
  row: number | undefined;
  dynamic?: boolean;
  layout?: {
    minWidth?: number;
    maxWidth?: number;
    justifyContent?: HorizontalAlignment;
  };
  previousContent: string | string[] = "";

  get length(): number {
    // get the length of the content characters. ignore control characters
    const content = this.content;
    if (Array.isArray(content)) {
      return content.length;
    }

    const controlCharacters = content.match(/\u001b\[[0-9;]*m/g) || [];
    let controlCharactersLength = controlCharacters.join("").length;
    if (controlCharactersLength < 0) {
      controlCharactersLength = 0;
    }
    return content.length - controlCharactersLength;
  }

  get content(): string | string[] {
    let content: string | string[] = "";
    if (typeof this._content === "function") {
      content = this._content();
    }
    if (Array.isArray(this._content)) {
      content = this._content;
    }
    if (typeof this._content === "string") {
      content = this._content;
    }

    return content;
  }

  set content(value: string | (() => string) | string[]) {
    this.dynamic = false;
    if (typeof value === "function") {
      this.dynamic = true;
    }
    this._content = value;
  }
  get style(): StyleOptions {
    if (typeof this._style === "function") {
      return this._style();
    }
    return this._style;
  }
  set style(value: StyleOptions | (() => StyleOptions)) {
    this._style = value;
  }
  resetChanged(): void {
    const content = this.content;
    if (Array.isArray(content)) {
      this.previousContent = content.join("");
    } else {
      this.previousContent = content;
    }
  }
  hasChanged(): boolean {
    const content = this.content;
    let stringContent = content as string;
    if (Array.isArray(content)) {
      stringContent = content.join("");
    } else {
      stringContent = content;
    }
    return stringContent !== this.previousContent;
  }
  getContentPadding(totalLength: number): {
    padStart: number;
    padEnd: number;
  } {
    const content = this.content;
    let stringContent = content as string;
    if (Array.isArray(content)) {
      stringContent = content.join("");
    } else {
      stringContent = content;
    }
    const justify = this.layout?.justifyContent || "start";

    let padStart = 0;
    let padEnd = 0;
    switch (justify) {
      case "start": {
        padEnd = totalLength - stringContent.length;
        break;
      }
      case "end": {
        padStart = totalLength - stringContent.length;
        break;
      }
      case "center": {
        padStart = Math.floor((totalLength - stringContent.length) / 2);
        padEnd = totalLength - stringContent.length - padStart;
        break;
      }
    }

    return {
      padStart,
      padEnd,
    };
  }
  getFormattedContent(): string | string[] {
    const content = this.content;
    let output = "";

    const color = this.style.color || "brightWhite";
    if (Array.isArray(content)) {
      for (let i = 0; i < content.length; i++) {
        content[i] = colorMe[color](content[i], this.style);
      }
      return content;
    }
    return colorMe[color](content, this.style);
  }
  constructor(options: {
    content: string | (() => string | string[]) | string[];
    style?: StyleOptions | (() => StyleOptions);
    row?: number;
    minWidth?: number;
    maxWidth?: number;
    justifyContent?: HorizontalAlignment;
  }) {
    this.id = generateRandomString(8);
    this.dynamic = false;
    if (typeof options.content === "function") {
      this.dynamic = true;
    }
    this._content = options.content;
    this.row = options.row;
    this.style = options.style || {};
    this.layout = {
      justifyContent: options.justifyContent || "start",
      minWidth: options.minWidth,
      maxWidth: options.maxWidth,
    };
  }
}
interface LineOptions extends ColorOptions {
  color?: ColorName;
  center?: boolean;
}
export class RenderEngine {
  pixels: Array<Array<string>> = [];

  refreshRate = 50;
  contentPaddingTop = 3;
  contentPadding = 2;
  _height = 20;

  get height(): number {
    return this.consoleSize.rows;
  }
  get contentHeight(): number {
    return this.height - this.contentPaddingTop;
  }

  get currentWidth(): number {
    return this.consoleSize.columns;
  }

  private previousWidth = 0;
  private _width: number;
  private previousHeight = 0;

  private _finished = false;

  stop(): void {
    this._finished = true;
  }
  get currentHeight(): number {
    return this.consoleSize.rows;
  }

  rows: Array<Row> = [];
  rawElements: Array<Element> = [];
  populatedRows: number[] = [];

  get width(): number {
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
    this._height = options?.height || this.height;
  }

  get consoleSize(): {
    columns: number;
    rows: number;
  } {
    return Deno.consoleSize();
  }
  justifyContent(row: number, justify: Justify): void {
    const rowElements = this.rows.filter((r) => r.line === row);
    if (rowElements.length) {
      rowElements[0].justify = justify;
    }
  }
  createElement(
    content: string | (() => string | string[]) | string[],
    options: {
      maxWidth?: number;
      minWidth?: number;
      row?: number;
      style?: StyleOptions | (() => StyleOptions);
      raw?: boolean;
      align?: HorizontalAlignment;
    },
  ): string {
    const element = new Element({
      content,
      maxWidth: options.maxWidth,
      minWidth: options.minWidth,
      row: options.row,
      style: options.style,
      justifyContent: options.align,
    });
    if (options.raw) {
      this.rawElements.push(element);
      return element.id;
    }
    this.addElementToRow(element, options.row || this.getLastRow());
    return element.id;
  }

  getLastRow(): number {
    this.rows.sort((a, b) => a.line - b.line);
    return this.rows[this.rows.length - 1]?.line || 0;
  }
  addElementToRow(element: Element, row: number): void {
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

  getElement(id: string): Element | undefined {
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
  ): void {
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

  removeElement(id: ElementID): void {
    for (const row of this.rows) {
      row.elements = row.elements.filter((element) => element.id !== id);
    }
  }

  printFiller(char?: string, color?: Color): void {
    const { columns } = this.consoleSize;
    const filler = char || " ";
    println(filler.repeat(columns), color);
  }

  getRowContent(rowNumber: number, columnSize: number):
    | Array<{
      content: string;
      style: StyleOptions;
      dynamic?: boolean;
      offsetX: number;
    }>
    | undefined {
    const row = this.rows.find((r) => r.line === rowNumber);
    if (row) {
      return row.getContentArray(columnSize);
    }
  }
  getRawElements(rowNumber: number): Element[] {
    return this.rawElements.filter((element) => element.row === rowNumber);
  }

  placeElements(): void {
    goToTop();
    const { columns } = this.consoleSize;
    let currentRow = this.contentPaddingTop;
    const startAndEnd = {
      start: 2,
      end: columns - 1,
    };
    const containerWidth = columns - (this.contentPadding * 2) - 2;
    for (const row of this.rows) {
      const currentLine = row.line + this.contentPaddingTop;

      const rowContent = row.getContentArray(
        containerWidth,
        this.contentPadding + startAndEnd.start,
      );
      for (const { offsetX, content, style, padding, dynamic } of rowContent) {
        if (dynamic) {
          clearLine(currentLine, startAndEnd);
        }

        goTo(currentLine, offsetX);
        print(padding.padStart > 0 ? " ".repeat(padding.padStart) : "");

        print(content, style?.color, style);
        print(padding.padEnd > 0 ? " ".repeat(padding.padEnd) : "");
      }
      if (!this.populatedRows.includes(currentLine)) {
        this.populatedRows.push(currentLine);
      }
    }
    for (const element of this.rawElements) {
      const content = element.getFormattedContent();
      const shouldClear = element.hasChanged();

      element.previousContent = element.content;
      let row = element.row || 1;
      row += this.contentPaddingTop;
      if (!this.populatedRows.includes(row)) {
        this.populatedRows.push(row);
      }
      if (Array.isArray(element.content)) {
        for (const line of content) {
          if (!line) {
            continue;
          }
          if (shouldClear) {
            clearLine(row, startAndEnd);
          }

          goTo(
            row,
            getCenterOffset(line, columns) +
              this.contentPadding,
          );
          print(line);
          row += 1;
          if (!this.populatedRows.includes(row)) {
            this.populatedRows.push(row);
          }
        }
      } else {
        const stringContent = content as string;
        goTo(
          row,
          getCenterOffset(stringContent, columns) +
            this.contentPadding,
        );
        print(stringContent);
      }
      element.resetChanged();
    }
  }

  private clearUnpopulatedRows(): void {
    const startAndEnd = {
      start: 2,
      end: this.consoleSize.columns - 1,
    };
    for (let i = 2; i < this.height; i++) {
      if (!this.populatedRows.includes(i)) {
        clearLine(i, startAndEnd);
      }
    }
    this.populatedRows = [];
  }

  renderFrame(): void {
    const { columns, rows } = this.consoleSize;
    const top = colorMe.bgBrightBlue(" ".repeat(columns));
    const bottom = colorMe.bgBrightBlue(" ".repeat(columns));
    goTo(0, 0);
    print(top);
    for (let i = 1; i < this.height; i++) {
      goTo(i, 0);
      print(colorMe.bgBrightBlue(" "));
      goTo(i, columns);
      print(colorMe.bgBrightBlue(" "));
    }
    goTo(this.height, 0);
    print(bottom);
  }

  isResized(): boolean {
    const resizedWidth = this.currentWidth !== this.previousWidth;
    const resizedHeight = this.currentHeight !== this.previousHeight;
    return resizedWidth || resizedHeight;
  }
  renderScreen(): void {
    goToTop();
    if (this.isResized()) {
      this.previousWidth = this.currentWidth;
      this.previousHeight = this.currentHeight;
      this._width = this.currentWidth;
      clearScreen();
      this.renderFrame();
    }

    // this.buildScreen();

    this.placeElements();
    this.clearUnpopulatedRows();
    // const outputLines = this.pixels.map((line) => line.join("")).join("\n");
    // print(outputLines);
    // this.printFiller(" ", "bgBrightBlue");
    // if (this.consoleSize.rows > this.height) {
    //     const diff = this.consoleSize.rows - this.height;
    //     for (let i = 1; i < diff - 2; i++) {
    //         clearLine(this.height + i + 2);
    //     }
    // }
  }

  reset(): void {
    this.rows = [];
    this.rawElements = [];
    this.populatedRows = [];
    clearScreen();
  }
  async run(): Promise<void> {
    await asyncPause(500);
    hideCursor();
    clearScreen();

    while (!this._finished) {
      this.renderScreen();
      await asyncPause(this.refreshRate);
    }
    this.reset();
    goToTop();
  }
}
