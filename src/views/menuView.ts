import { InputListener } from "../utils/inputListener.ts";
import type { RenderEngine } from "../utils/render.ts";
import { BaseView } from "#/views/baseView.ts";

export class MenuView extends BaseView {
  currentSelection = 1;
  setup(): void {
    this.onInput("special", "up", () => {
      this.currentSelection--;
    });
  }
  build() {
    this.engine.createElement(() => {
      return "Menu View";
    }, {
      row: 1,
      align: "center",
      style: {
        color: "brightCyan",
        bold: true,
        underline: true,
      },
    });
  }
}
