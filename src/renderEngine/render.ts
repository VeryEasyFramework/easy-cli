import { asyncPause, hideCursor } from "#/cliUtils.ts";
import {
  clearLine,
  clearScreen,
  goTo,
  goToTop,
  print,
  showCursor,
} from "#/utils/print.ts";

import { getCenterOffset, getCharCount } from "../utils/format.ts";
import { defaultTheme, type LineStyle, type Theme } from "#/easyCli.ts";
import { box } from "#/utils/box.ts";
import type { StyleOptions } from "#/utils/colors.ts";
import { Element } from "#/renderEngine/element.ts";
import { Row } from "#/renderEngine/row.ts";
import {
  CreateElementOptions,
  ElementContent,
  ElementID,
  HorizontalAlignment,
  Justify,
} from "#/renderEngine/renderEngineTypes.ts";
import { EasyElement } from "#/elements/baseElement.ts";
import { InputListener } from "#/utils/inputListener.ts";

export class RenderEngine {
  pixels: Array<Array<string>> = [];

  refreshRate = 50;
  contentPaddingTop = 3;
  contentPadding = 2;
  _height = 20;
  padChar = " ";

  startTime: number = -1;
  get elapsedTime(): number {
    return new Date().getTime() - this.startTime;
  }

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
  print(content: string, options?: StyleOptions) {
    options = {
      bgColor: this.theme.backgroundColor,
      ...options,
    };
    print(content, options);
  }
  stop(): void {
    this._finished = true;
  }
  get currentHeight(): number {
    return this.consoleSize.rows;
  }

  rows: Array<Row> = [];
  rawElements: Array<Element> = [];
  easyElements: Array<{
    row?: number;
    justify?: HorizontalAlignment;
    element: EasyElement;
  }> = [];
  populatedRows: number[] = [];
  theme: Theme;

  listener: InputListener;
  get width(): number {
    return this._width;
  }

  constructor(
    options?: {
      theme?: Partial<Theme>;
      refreshRate?: number;
      height?: number;
      width?: number;
      elements?: Array<Element>;
      listener?: InputListener;
    },
  ) {
    this._width = 0;
    this._height = options?.height || this.height;

    this.refreshRate = options?.refreshRate || this.refreshRate;

    this.listener = options?.listener || new InputListener();
    this.theme = {
      ...defaultTheme,
      ...options?.theme,
    };
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
  addElement(element: EasyElement, options: {
    row?: number;
    justify?: HorizontalAlignment;
  }): void {
    element.init(this.theme, this);
    this.easyElements.push({
      element,
      row: options.row,
      justify: options.justify,
    });
  }
  createElement(
    content: ElementContent,
    options: CreateElementOptions,
  ): string {
    const element = new Element({
      content,
      maxWidth: options.maxWidth,
      maxContent: options.maxContent,
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
      if (style) {
        element.style = style;
      }
    }
  }

  removeElement(id: ElementID): void {
    for (const row of this.rows) {
      row.elements = row.elements.filter((element) => element.id !== id);
    }
  }

  getRawElements(rowNumber: number): Element[] {
    return this.rawElements.filter((element) => element.row === rowNumber);
  }

  placeElements(): void {
    goToTop();
    this.renderRows();
    this.renderRawElements();
    this.renderEasyElements();
  }

  private renderElement(element: EasyElement, options: {
    row: number;
    justify?: HorizontalAlignment;
  }) {
    let row = options.row;
    const content = element.getContent(this.elapsedTime);
    // if (typeof content === "string") {
    //   this.populatedRows.push(row);
    //   const previousValue = element.previousValue;
    //   const shouldClear = content !== previousValue;
    //   if (shouldClear) {
    //     if (getCharCount(previousValue) > getCharCount(content)) {
    //       this.clearLine(row, {
    //         start: 2,
    //         end: this.consoleSize.columns - 1,
    //       });
    //     }
    //   }
    //   const justify = options.justify || "center";
    //   let offset = 0;

    //   if (justify === "center") {
    //     offset = getCenterOffset(content, this.consoleSize.columns);
    //   }
    //   goTo(row, offset);

    //   element.previousValue = content;
    //   this.print(content);
    // }
    if (Array.isArray(content)) {
      const justify = options.justify || "center";
      let offset = 0;

      for (const line of content) {
        this.populatedRows.push(row);
        const previousValue = element.previousValue;
        const shouldClear = line !== previousValue;
        if (shouldClear) {
          if (getCharCount(previousValue) > getCharCount(line)) {
            this.clearLine(row, {
              start: 2,
              end: this.consoleSize.columns - 1,
            });
          }
        }
        switch (justify) {
          case "center":
            offset = getCenterOffset(line, this.consoleSize.columns);
            break;
          case "start":
            offset = this.contentPadding;
            break;
          case "end":
            offset = this.consoleSize.columns - getCharCount(line) -
              this.contentPadding;
            break;
          case "start-edge":
            offset = 0;
            break;
          case "end-edge":
            offset = this.consoleSize.columns - getCharCount(line) + 1;
            break;
        }

        goTo(row, offset);
        this.print(line);
        row += 1;
      }
    }
  }
  private renderEasyElements() {
    const rowOffset = this.contentPaddingTop;
    for (const item of this.easyElements) {
      const row = rowOffset + (item.row || 1);
      this.renderElement(item.element, { row, justify: item.justify });
    }
  }
  private renderRows(): void {
    const { columns } = this.consoleSize;
    const startAndEnd = {
      start: 2,
      end: columns - 1,
    };
    const containerWidth = columns - (this.contentPadding * 2) - 2;
    for (const row of this.rows) {
      const currentLine = row.line + this.contentPaddingTop;

      const { elements, offsetStart } = row.getContentArray(
        containerWidth,
        this.contentPadding + startAndEnd.start,
      );

      for (
        const { offsetX, content, style, padding, dynamic } of elements
      ) {
        if (dynamic) {
          this.clearLine(currentLine, startAndEnd);
        }

        goTo(currentLine, offsetX + offsetStart);
        this.print(
          padding.padStart > 0 ? this.padChar.repeat(padding.padStart) : "",
        );

        this.print(content, style);
        this.print(
          padding.padEnd > 0 ? this.padChar.repeat(padding.padEnd) : "",
        );
      }
      if (!this.populatedRows.includes(currentLine)) {
        this.populatedRows.push(currentLine);
      }
    }
  }
  private renderRawElements(): void {
    const { columns } = this.consoleSize;
    const startAndEnd = {
      start: 2,
      end: columns - 1,
    };
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
            this.clearLine(row, startAndEnd);
          }

          goTo(
            row,
            getCenterOffset(line, columns) +
              this.contentPadding,
          );
          this.print(line);
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
        this.print(stringContent);
      }
      element.resetChanged();
    }
  }
  private clearLine(row: number, options: {
    start: number;
    end: number;
  }) {
    clearLine(row, {
      start: options.start,
      end: options.end,
      bgColor: this.theme.backgroundColor,
    });
  }
  private clearUnpopulatedRows(): void {
    const startAndEnd = {
      start: 2,
      end: this.consoleSize.columns - 1,
    };
    for (let i = 2; i < this.height; i++) {
      if (!this.populatedRows.includes(i)) {
        this.clearLine(i, startAndEnd);
      }
    }
    this.populatedRows = [];
  }
  drawBox(options: {
    width: number;
    height: number;
    startRow: number;
    startColumn: number;
    lineStyle?: LineStyle;
  }) {
    const style = options.lineStyle || this.theme.lineStyle;
    const { width, height, startRow, startColumn } = options;
    const endRow = startRow + height;
    const endColumn = startColumn + width;

    const top = box[style].horizontal.repeat(width - 2);
    const bottom = box[style].horizontal.repeat(width - 2);

    const printSection = (content: string) => {
      this.print(content, {
        color: this.theme.primaryColor,
      });
    };

    goTo(startRow, startColumn);

    printSection(box[style].topLeft + top + box[style].topRight);
    for (let i = startRow + 2; i < endRow; i++) {
      goTo(i, startColumn);
      printSection(box[style].vertical);
      goTo(i, endColumn);
      printSection(box[style].vertical);
    }
    goTo(endRow, startColumn);
    printSection(box[style].bottomLeft + bottom + box[style].bottomRight);
  }

  renderFrame(): void {
    const { columns } = this.consoleSize;

    this.drawBox({
      width: columns,
      height: this.height,
      startRow: 0,
      startColumn: 0,
    });
  }

  isResized(): boolean {
    const resizedWidth = this.currentWidth !== this.previousWidth;
    const resizedHeight = this.currentHeight !== this.previousHeight;
    return resizedWidth || resizedHeight;
  }
  clearScreen(): void {
    clearScreen();
    goToTop();
    const { columns } = this.consoleSize;
    const height = this.height;
    for (let i = 0; i < height; i++) {
      goTo(i, 0);
      this.print(this.padChar.repeat(columns));
    }
  }
  forceRender(): void {
    this.clearScreen();
    this.renderFrame();
    this.placeElements();
    this.clearUnpopulatedRows();
  }
  renderScreen(): void {
    goToTop();
    if (this.isResized()) {
      this.previousWidth = this.currentWidth;
      this.previousHeight = this.currentHeight;
      this._width = this.currentWidth;
      this.clearScreen();
      this.renderFrame();
    }

    // this.buildScreen();

    this.placeElements();
    this.clearUnpopulatedRows();
  }

  reset(): void {
    this.rows = [];
    this.rawElements = [];
    this.populatedRows = [];
    this.easyElements = [];
    this.clearScreen();
    this.renderFrame();
  }
  async run(): Promise<void> {
    await asyncPause(500);
    this.startTime = new Date().getTime();
    hideCursor();
    this.clearScreen();

    while (!this._finished) {
      this.renderScreen();
      await asyncPause(this.refreshRate);
    }
    clearScreen();
    goToTop();
    showCursor();
  }
}
