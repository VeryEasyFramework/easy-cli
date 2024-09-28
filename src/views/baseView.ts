import type { InputListener } from "#/utils/inputListener.ts";
import type { RenderEngine } from "../renderEngine/render.ts";
import { type Char, keyMap, type KeyStroke } from "#/utils/keyMap.ts";
import { camelToTitleCase } from "@vef/string-utils";
import type { EasyCli, Theme } from "#/easyCli.ts";
import { ClockElement } from "#/elements/clockElement.ts";
import type { BasicBgColor, BasicFgColor } from "#/utils/colors.ts";
import { MouseEvent } from "#/utils/mouse.ts";

export abstract class BaseView {
  engine!: RenderEngine;
  clock?: ClockElement;
  listener!: InputListener;

  keyActions: Record<string, Array<() => void>> = {};
  charActions: Array<(char: Char) => void> = [];
  lineActions: Array<(line: string) => void> = [];
  mouseActions: Array<(event: MouseEvent) => void> = [];
  doneActions: Array<() => void> = [];

  cli!: EasyCli;
  get theme(): Theme {
    return this.cli.theme;
  }

  get themeStyle(): {
    color: BasicFgColor;
    bgColor: BasicBgColor;
  } {
    return {
      color: this.theme.primaryColor,
      bgColor: this.theme.backgroundColor,
    };
  }
  appName: string = "";

  title: string = "";
  description: string = "";
  get startRow(): number {
    if (this.description) {
      return 5;
    }
    return 3;
  }
  get menuTitle(): string {
    return `${this.appName} - ${this.title}`;
  }
  constructor(
    options?: {
      title?: string;
      description?: string;
      clock?: boolean;
    },
  ) {
    const { title, description, clock } = options || {};
    this.title = title ||
      camelToTitleCase(Object.getPrototypeOf(this).constructor.name);
    this.description = description || "";
    if (clock) {
      this.clock = new ClockElement();
    }
  }

  init(
    cli: any,
    renderEngine: RenderEngine,
    listener: InputListener,
    appName: string,
  ) {
    this.engine = renderEngine;
    this.listener = listener;
    this.appName = appName;
    this.cli = cli;
    this.setup();
  }

  private addListeners(): void {
    this.listener.doneActions.push(...this.doneActions);

    this.listener.charActions.push(...this.charActions);

    this.listener.lineActions.push(...this.lineActions);

    this.listener.mouseActions.push(...this.mouseActions);

    for (const [key, actions] of Object.entries(this.keyActions)) {
      actions.forEach((action) => {
        this.listener.keyActions[key] = this.listener.keyActions[key] || [];
        this.listener.keyActions[key].push(action);
      });
    }
  }
  /**
   * Build the view
   */
  abstract build(): void;

  /**
   * Setup the listeners
   */
  abstract setup(): void;

  hide() {
    this.listener.reset();
    this.engine.reset();
  }

  private _build() {
    if (this.clock) {
      this.engine.addElement(this.clock, {
        row: -2,
        justify: "end-edge",
      });
    }
    this.engine.createElement(
      this.menuTitle,
      {
        row: 1,
        align: "center",
        style: {
          color: "brightCyan",
          bold: true,
          underline: true,
        },
      },
    );
    if (this.description) {
      this.engine.createElement(
        this.description,
        {
          row: this.startRow - 2,
          align: "center",
          style: {
            color: "brightWhite",
            italic: true,
          },
        },
      );
    }
    this.build();
  }
  onInput(type: "special", key: KeyStroke, callback: () => void): void;
  onInput(type: "char", callback: (char: Char) => void): void;
  onInput(type: "line", callback: (line: string) => void): void;
  onInput(
    type: "special" | "char" | "line",
    keyOrCallback:
      | KeyStroke
      | ((line: string) => void)
      | ((char: Char) => void),
    callback?: () => void,
  ) {
    switch (type) {
      case "special": {
        const key = keyOrCallback as KeyStroke;
        if (!this.keyActions[keyMap[key]]) {
          this.keyActions[keyMap[key]] = [];
        }
        this.keyActions[keyMap[key]].push(callback!);
        break;
      }
      case "char":
        this.charActions.push(keyOrCallback as (char: Char) => void);
        break;
      case "line":
        this.lineActions.push(keyOrCallback as (line: string) => void);
        break;
    }
  }
  onMouseEvent(callback: (event: MouseEvent) => void) {
    this.mouseActions.push(callback);
  }
  show() {
    this.engine.reset();
    this.listener.reset();
    this.addListeners();
    this._build();
  }
}
