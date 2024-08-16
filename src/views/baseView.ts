import type { InputListener } from "#/utils/inputListener.ts";
import type { RenderEngine } from "#/utils/render.ts";
import { Char, keyMap, KeyStroke } from "#/utils/keyMap.ts";

export abstract class BaseView {
  engine!: RenderEngine;
  listener!: InputListener;

  keyActions: Record<string, Array<() => void>> = {};
  charActions: Array<(char: Char) => void> = [];
  lineActions: Array<(line: string) => void> = [];
  doneActions: Array<() => void> = [];

  init(renderEngine: RenderEngine, listener: InputListener) {
    this.engine = renderEngine;
    this.listener = listener;
  }

  private addListeners() {
    this.listener.doneActions.push(() => {
      this.doneActions.forEach((action) => {
        action();
      });
    });

    this.listener.charActions.push((char) => {
      this.charActions.forEach((action) => {
        action(char);
      });
    });

    this.listener.lineActions.push((line) => {
      this.lineActions.forEach((action) => {
        action(line);
      });
    });

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
  show() {
    this.engine.reset();
    this.listener.reset();
    this.build();
  }
}
