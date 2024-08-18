import { BaseElement } from "#/elements/baseElement.ts";
import { box } from "#/utils/box.ts";
export class OutputElement extends BaseElement {
  addContent(content: string) {
    this.contentRows.push(content);
  }
  contentRows: string[] = [];
  setup(): void {
  }

  render(elapsedTime: number): string[] {
    if (this.contentRows.length > this.height - 2) {
      this.contentRows = this.contentRows.splice(0, this.height - 2);
    }
    const content = this.drawBox(this.contentRows, {
      width: this.width,
      height: this.height,
      justify: "start",
    });

    return content;
  }
}
