import { defaultTheme, type Theme } from "#/easyCli.ts";

export abstract class BaseElement {
  previousValue: string = "";
  theme: Theme = defaultTheme;
  init(theme: Theme) {
    this.theme = theme;
  }
  abstract render(elapsedTime: number): string | string[];
}

export type EasyElement = BaseElement;
