import { colorMe } from "@eveffer/color-me";
import { CLIBase } from "./cliBase.ts";

import { symbols } from "./utils/print.ts";

class SearchableList extends CLIBase<string> {
  sourceList: string[];
  filteredList: string[];
  output: string;
  get searchString(): string {
    return this._searchString;
  }
  set searchString(value: string) {
    this._searchString = value;
  }

  get instructions(): string {
    const up = colorMe.brightGreen(symbols.upArrowAlt);
    const down = colorMe.brightGreen(symbols.downArrowAlt);
    const enter = colorMe.brightGreen(symbols.enter);
    return `Type to search, ${up} or ${down} to navigate, ${enter} to select`;
  }

  addInstructions() {
    const row = 3;
    const options = {
      row,
      style: {
        color: "brightWhite",
        bold: true,
      },
    } as const;
    const symbolOptions = {
      style: {
        color: "brightGreen",
        bold: true,
      },
      row,
    } as const;
    this.renderEngine.createElement("Type to search, ", options);
    this.renderEngine.createElement(symbols.upArrowAlt, symbolOptions);
    this.renderEngine.createElement(" or ", options);
    this.renderEngine.createElement(symbols.downArrowAlt, symbolOptions);
    this.renderEngine.createElement(" to navigate, ", options);
    this.renderEngine.createElement(symbols.enter, symbolOptions);
    this.renderEngine.createElement(" to select", options);
  }
  private _searchString: string;
  searchStringLength: number;
  currentIndex: number;
  action?: (
    selection: string,
    setOutput: (data: string) => void,
  ) => Promise<void>;
  constructor(
    listItems: string[],
    options?: {
      title?: string;
      action?: (
        selection: string,
        setOutput: (data: string) => void,
      ) => Promise<void>;
    },
  ) {
    super(options?.title || "Searchable List");
    this.sourceList = listItems.sort();
    this.filteredList = [];
    this.action = options?.action;
    this._searchString = "";
    this.currentIndex = 0;
    this.searchStringLength = 0;
    this.search();
    this.output = "";
  }
  search() {
    if (this.searchString === "") {
      this.filteredList = this.sourceList;
      return;
    }
    this.filteredList = this.sourceList.filter((item) =>
      item.toLowerCase().includes(this.searchString.toLowerCase())
    ).sort();
    if (this.currentIndex >= this.filteredList.length) {
      this.currentIndex = 0;
    }
  }

  getRenderedList(): string {
    return this.filteredList.join("\n");
  }

  async finalizer(): Promise<string> {
    const selected = this.filteredList[this.currentIndex];
    this.renderEngine.rows = [];
    this.renderEngine.rawElements = [];
    this.renderEngine.createElement(
      `Selected: ${selected}`,
      {
        row: 5,
        style: {
          color: "brightGreen",
          bold: true,
        },
      },
    );
    const outputId = this.renderEngine.createElement(() => {
      return this.output;
    }, {
      align: "center",
      row: 7,
      style: {
        color: "brightWhite",
      },
    });
    if (this.action) {
      await this.action(selected, (data) => {
        this.output = data;
      });
    }
    this.renderEngine.updateElement(outputId, {
      content: "All done! Press escape to exit...",
      style: {
        color: "brightYellow",
      },
    });
    return selected;
  }
  setup(): void {
    this.renderEngine.createElement("Search: ", {
      row: 5,
      style: {
        color: "brightWhite",
        bold: true,
      },
    });
    this.renderEngine.createElement(
      () => this.searchString,
      {
        row: 6,
        style: {
          color: "brightWhite",
        },
      },
    );
    // this.addInstructions();

    this.renderEngine.createElement(
      this.instructions,
      {
        row: 3,
        raw: true,
      },
    );

    this.renderEngine.createElement(
      () => {
        const height = this.renderEngine.height;
        const offset = 15;

        const listHeight = height - offset;
        const list = this.filteredList.slice(0, listHeight);
        const styled = list.map((item, index) => {
          const selected = this.currentIndex === index;

          if (selected) {
            return colorMe.brightMagenta(`> ${item}`, {
              underline: true,
              bold: true,
            });
          }
          return colorMe.white(`  ${item}`);
        });
        return styled;
      },
      {
        row: 7,
        raw: true,
        style: {
          color: "brightWhite",
        },
        align: "center",
      },
    );

    this.listener.on("up", () => {
      this.currentIndex -= 1;
      if (this.currentIndex < 0) {
        this.currentIndex = this.filteredList.length - 1;
      }
    });

    this.listener.on("down", () => {
      this.currentIndex += 1;
      if (this.currentIndex >= this.filteredList.length) {
        this.currentIndex = 0;
      }
    });
    this.listener.on("backspace", () => {
      this.searchString = this.searchString.slice(0, -1);

      this.search();
    });

    this.listener.on("enter", () => {
      this.finish();
    });

    this.listener.onChar((char) => {
      this.searchString = this.searchString + char;

      // this.renderEngine.updateElement(searchElementID, {
      //   content: this.searchString,
      // });
      this.search();
    });
  }
}

export { SearchableList };
