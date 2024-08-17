import { BaseElement } from "#/elements/baseElement.ts";
import { box } from "#/utils/box.ts";
export class OutputElement extends BaseElement {
  height: number = 10;
  width: number = 10;

  drawBorder() {
    const top = "┌" + "─".repeat(this.width - 2) + "┐";
    const bottom = "└" + "─".repeat(this.width - 2) + "┘";
    const middle = "│" + " ".repeat(this.width - 2) + "│";
    return {
      top,
      bottom,
      middle,
    };
  }
  addContent(content: string) {
    this.contentRows.push(content);
  }
  contentRows: string[] = [];
  setup(): void {}

  buildEmptyContent() {
    const outputBox = box[this.theme.lineStyle];
    const top = `${outputBox.topLeft}${
      outputBox.horizontal.repeat(this.width - 2)
    }${outputBox.topRight}`;
    const bottom = `${outputBox.bottomLeft}${
      outputBox.horizontal.repeat(this.width - 2)
    }${outputBox.bottomRight}`;
    const content = [top];
    for (let i = 1; i < this.height - 2; i++) {
      content.push(
        outputBox.vertical.padEnd(this.width - 1, " ") + outputBox.vertical,
      );
    }
    content.push(bottom);
    return content;
  }
  render(elapsedTime: number): string[] {
    const content = this.buildEmptyContent();
    for (let i = 0; i < this.contentRows.length; i++) {
      content[i + 2] = this.contentRows[i];
    }
    return content;
  }
}
