import { InputListener } from "../utils/inputListener.ts";
import { RenderEngine } from "../utils/render.ts";
import { BaseView } from "#/views/baseView.ts";

export class OutputView extends BaseView {
  build() {
    this.engine.createElement(() => {
      return "Output View";
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
