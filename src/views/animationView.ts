import { BaseView } from "#/views/baseView.ts";
import { Animation } from "#/animation/animate.ts";
import { AnimationElement } from "#/elements/animationElement.ts";

export class AnimationView extends BaseView {
  animation!: AnimationElement;
  build(): void {
    this.engine.addElement(this.animation, {
      justify: "center",
      row: this.startRow,
    });
  }
  setup(): void {
    this.animation = new AnimationElement();
    this.animation.onDone(() => {
      this.cli.stop();
      Deno.exit();
    });
    this.onInput("special", "escape", () => {
      this.cli.stop();
    });
  }
}
