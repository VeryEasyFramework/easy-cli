import { ColorMe, type StyleOptions } from "#/utils/colors.ts";
import { generateRandomString } from "@vef/string-utils";
import type {
  ElementID,
  HorizontalAlignment,
} from "#/renderEngine/renderEngineTypes.ts";
import { getCharCount } from "#/utils/format.ts";

export class Element {
  id: ElementID;
  _content: string | (() => string | string[]) | string[];
  _style: StyleOptions | (() => StyleOptions) = {};
  row: number | undefined;
  dynamic?: boolean;
  layout?: {
    minWidth?: number;
    maxWidth?: number;
    justifyContent?: HorizontalAlignment;
  };
  previousContent: string | string[] = "";

  get length(): number {
    const content = this.content;
    if (Array.isArray(content)) {
      return content.length;
    }

    return getCharCount(content);
  }

  get content(): string | string[] {
    let content: string | string[] = "";
    if (typeof this._content === "function") {
      content = this._content();
    }
    if (Array.isArray(this._content)) {
      content = this._content;
    }
    if (typeof this._content === "string") {
      content = this._content;
    }

    return content;
  }

  set content(value: string | (() => string) | string[]) {
    this.dynamic = false;
    if (typeof value === "function") {
      this.dynamic = true;
    }
    this._content = value;
  }
  get style(): StyleOptions {
    if (typeof this._style === "function") {
      return this._style();
    }
    return this._style;
  }
  set style(value: StyleOptions | (() => StyleOptions)) {
    this._style = value;
  }

  resetChanged(): void {
    const content = this.content;
    if (Array.isArray(content)) {
      this.previousContent = content.join("");
    } else {
      this.previousContent = content;
    }
  }
  hasChanged(): boolean {
    const content = this.content;
    let stringContent = content as string;
    if (Array.isArray(content)) {
      stringContent = content.join("");
    } else {
      stringContent = content;
    }
    return stringContent !== this.previousContent;
  }
  getContentPadding(totalLength: number): {
    padStart: number;
    padEnd: number;
  } {
    const content = this.content;
    let stringContent = content as string;
    if (Array.isArray(content)) {
      stringContent = content.join("");
    } else {
      stringContent = content;
    }
    const justify = this.layout?.justifyContent || "start";
    const length = this.length;
    let padStart = 0;
    let padEnd = 0;
    switch (justify) {
      case "start": {
        padEnd = totalLength - length;
        break;
      }
      case "end": {
        padStart = totalLength - length;
        break;
      }
      case "center": {
        padStart = Math.floor((totalLength - length) / 2);
        padEnd = totalLength - length - padStart;
        break;
      }
    }

    return {
      padStart,
      padEnd,
    };
  }
  getFormattedContent(): string | string[] {
    const content = this.content;

    if (Array.isArray(content)) {
      for (let i = 0; i < content.length; i++) {
        const colorMe = ColorMe.chain().content(content[i]);
        for (const [key, value] of Object.entries(this.style)) {
          if (value) {
            colorMe[key as keyof StyleOptions](value);
          }
        }
        content[i] = colorMe.end();
      }
      return content;
    }
    const chain = ColorMe.chain().content(content);
    for (const [key, value] of Object.entries(this.style)) {
      if (value) {
        chain[key as keyof StyleOptions](value);
      }
    }
    return chain.end();
  }
  constructor(options: {
    content: string | (() => string | string[]) | string[];
    style?: StyleOptions | (() => StyleOptions);
    row?: number;
    maxContent?: boolean;
    minWidth?: number;
    maxWidth?: number;
    justifyContent?: HorizontalAlignment;
  }) {
    this.id = generateRandomString(8);
    this.dynamic = false;
    if (typeof options.content === "function") {
      this.dynamic = true;
    }
    this._content = options.content;
    this.row = options.row;
    this.style = options.style || {};
    const maxWidth = options.maxContent ? this.length : options.maxWidth;
    this.layout = {
      justifyContent: options.justifyContent || "start",
      minWidth: options.minWidth,
      maxWidth,
    };
  }
}
