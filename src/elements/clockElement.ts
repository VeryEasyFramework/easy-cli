import { BaseElement } from "#/elements/baseElement.ts";

export class ClockElement extends BaseElement {
  setup() {
    this.width = 10;
    this.height = 1;
  }
  render(time: number): string[] {
    const date = new Date().toLocaleTimeString();

    const content = this.drawBox(date);

    return content;
  }
}
