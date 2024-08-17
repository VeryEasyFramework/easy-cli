import { BaseElement } from "#/elements/baseElement.ts";

export class ClockElement extends BaseElement {
  render(time: number): string {
    const date = new Date().toLocaleTimeString();
    return date;
  }
}
