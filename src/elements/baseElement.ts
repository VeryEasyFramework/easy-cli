import { defaultTheme, type Theme } from "#/easyCli.ts";
import { RenderEngine } from "#/renderEngine/render.ts";
import { box } from "#/utils/box.ts";
import { ColorMe } from "../../mod.ts";
import { getCharCount } from "#/utils/format.ts";
import { HorizontalAlignment } from "#/renderEngine/renderEngineTypes.ts";

export abstract class BaseElement {
  previousValue: string = "";
  theme: Theme = defaultTheme;
  width: number = 10;
  height: number = 10;
  engine!: RenderEngine;

  _content: string[] = [];

  getContent(elapsedTime: number) {
    const content = this.render(elapsedTime);
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
      height = options?.height || content.length;
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

        const rowContent = rawContent.padStart(
          offset + getCharCount(rawContent),
          " ",
        ).padEnd(width, " ");
        rows.push(`${vertical}${this.colorBgTheme(rowContent)}${vertical}`);
      }
    }
    rows.push(bottom);
    return rows;
  }
  init(theme: Theme, engine: RenderEngine) {
    this.theme = theme;
    this.engine = engine;
    this.setup();
  }
  abstract setup(): void;
  abstract render(elapsedTime: number): string | string[];
}

export type EasyElement = BaseElement;
