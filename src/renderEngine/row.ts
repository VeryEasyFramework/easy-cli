import type { Justify } from "#/renderEngine/renderEngineTypes.ts";
import type { Element } from "#/renderEngine/element.ts";
import type { StyleOptions } from "#/utils/colors.ts";

export class Row {
  justify: Justify;
  elements: Array<Element>;
  line: number;

  get width(): number {
    return this.elements.reduce((acc, element) => {
      return acc + element.length;
    }, 0);
  }

  constructor(
    options: { justify: Justify; elements: Array<Element>; line: number },
  ) {
    this.justify = options.justify;
    this.elements = options.elements;
    this.line = options.line;
  }

  getContentArray(
    containerWidth: number,
    offsetX = 0,
  ): {
    offsetStart: number;
    elements: Array<
      {
        content: string;
        padding: {
          padStart: number;
          padEnd: number;
        };
        style: StyleOptions;
        dynamic?: boolean;
        offsetX: number;
      }
    >;
  } {
    const elementCount = this.elements.length;

    switch (this.justify) {
      default: {
        let defaultLength = containerWidth / elementCount;
        let maxWidthElementCount = 0;
        let allLength = 0;
        let totalDiff = 0;
        let totalElLength = 0;
        this.elements.forEach((element) => {
          if (
            element.layout?.maxWidth && element.layout.maxWidth < defaultLength
          ) {
            maxWidthElementCount += 1;

            totalDiff += defaultLength - element.layout.maxWidth;
            allLength += element.layout.maxWidth;
          }
        });
        const defaultElementCount = elementCount - maxWidthElementCount;
        if (defaultElementCount > 0) {
          defaultLength += totalDiff /
            defaultElementCount;
        }

        const result = this.elements.map((element, index) => {
          let totalLength = defaultLength;
          if (
            element.layout?.maxWidth && element.layout.maxWidth < totalLength
          ) {
            totalLength = element.layout.maxWidth;
          }

          offsetX += totalLength;

          const padding = element.getContentPadding(totalLength);
          totalElLength += element.length + padding.padStart + padding.padEnd;
          let offset = offsetX - totalLength;
          if (offsetX > containerWidth) {
            offset--;
          }

          return {
            content: element.content as string,
            padding,
            style: element.style,
            dynamic: element.dynamic,
            offsetX: offset,
          };
        });
        const diff = containerWidth - totalElLength;
        let offset = 0;
        if (diff > 0) {
          offset = Math.floor(diff / 2);
        }

        return {
          elements: result,
          offsetStart: offset,
        };
      }
    }
  }
}
