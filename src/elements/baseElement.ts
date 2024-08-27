import { defaultTheme, type Theme } from "#/easyCli.ts";
import { RenderEngine } from "#/renderEngine/render.ts";
import { box } from "#/utils/box.ts";
import { ColorMe } from "../../mod.ts";
import { getCharCount } from "#/utils/format.ts";
import { HorizontalAlignment } from "#/renderEngine/renderEngineTypes.ts";
import { InputListener } from "#/utils/inputListener.ts";

type TypeOrFunc<T> = T | (() => T);
function typeOrFunction<T extends string | number>(
  value: T | (() => T),
): T {
  if (typeof value === "function") {
    return value() as T;
  }
  return value as T;
}
export abstract class BaseElement {
  previousValue: string = "";
  previousTime: number = 0;
  theme: Theme = defaultTheme;
  _width: TypeOrFunc<number> = 10;
  set width(value: TypeOrFunc<number>) {
    this._width = value;
  }

  get width(): number {
    return typeOrFunction(this._width);
  }

  _height: TypeOrFunc<number> = 10;
  set height(value: TypeOrFunc<number>) {
    this._height = value;
  }
  get height(): number {
    return typeOrFunction(this._height);
  }

  engine!: RenderEngine;
  listener?: InputListener;

  _content: string[] = [];

  getContent(elapsedTime: number) {
    const content = this._render(elapsedTime);
    switch (typeof content) {
      case "string":
        this._content = [content];
        break;
      default:
        this._content = content;
        break;
    }
    return this._content;
  }
  get contentWidth() {
    return Math.max(...this._content.map((c) => getCharCount(c)));
  }

  private colorTheme(content: string) {
    return ColorMe.standard().content(content).color(
      this.theme.primaryColor,
    ).bgColor(this.theme.backgroundColor).end();
  }
  private colorBgTheme(content: string) {
    return ColorMe.standard().content(content).bgColor(
      this.theme.backgroundColor,
    ).end();
  }

  drawBox(content?: string | string[], options?: {
    height?: number;
    width?: number;
    justify?: HorizontalAlignment;
  }) {
    let width = options?.width || this.width + 2;
    let height = options?.height || this.height;
    if (content) {
      if (typeof content === "string") {
        content = [content];
      }
      height = height || content.length;
      width = options?.width ||
        Math.max(...content.map((c) => getCharCount(c))) + 2;
    }
    const style = this.theme.lineStyle;

    const horizontal = box[style].horizontal.repeat(width);
    const top = this.colorTheme(
      `${box[style].topLeft}${horizontal}${box[style].topRight}`,
    );
    const vertical = this.colorTheme(
      box[style].vertical,
    );
    const bottom = this.colorTheme(
      `${box[style].bottomLeft}${horizontal}${box[style].bottomRight}`,
    );

    const rows: string[] = [];
    rows.push(top);
    for (let i = 0; i < height; i++) {
      if (content && content[i]) {
        const rawContent = content[i].slice(0, width - 2);
        let offset = 0;
        switch (options?.justify) {
          case "center":
            offset = (width - getCharCount(rawContent)) / 2;
            break;
          case "end":
            offset = width - getCharCount(rawContent);
            break;
          default:
            offset = 1;
            break;
        }

        const startPadding = this.colorBgTheme(" ".repeat(offset));
        const charCount = getCharCount(rawContent);
        const endPadding = this.colorBgTheme(
          " ".repeat(width - charCount - offset),
        );
        const rowContent = `${startPadding}${
          this.colorBgTheme(rawContent)
        }${endPadding}`;
        rows.push(`${vertical}${rowContent}${vertical}`);
        continue;
      }
      rows.push(
        `${vertical}${this.colorBgTheme(" ".repeat(width))}${vertical}`,
      );
    }
    rows.push(bottom);
    return rows;
  }
  init(theme: Theme, engine: RenderEngine) {
    this.theme = theme;
    this.engine = engine;
    this.listener = engine.listener;
    this.setup();
  }
  abstract setup(): void;
  abstract render(elapsedTime: number, diff: number): string | string[];

  _render(elapsedTime: number): string | string[] {
    const diff = elapsedTime - this.previousTime;
    this.previousTime = elapsedTime;
    return this.render(elapsedTime, diff);
  }
}

export type EasyElement = BaseElement;
