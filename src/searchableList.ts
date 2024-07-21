import { colorMe } from "@eveffer/color-me";
import { CLIBase } from "./cliBase.ts";
import { keyMap, navigateList } from "./cliUtils.ts";
import { center } from "./utils/format.ts";
import { print, println, symbols } from "./utils/print.ts";

class SearchableList extends CLIBase<string> {
  sourceList: string[];
  filteredList: string[];
  searchString: string;
  currentIndex: number;
  action?: (selection: string) => void;
  constructor(
    listItems: string[],
    options?: {
      title?: string;
      action?: (selection: string) => void;
    },
  ) {
    super(options?.title || "Searchable List");
    this.sourceList = listItems.sort();
    this.filteredList = [];
    this.action = options?.action;
    this.searchString = "";
    this.currentIndex = 0;
    this.search();
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

  renderContent() {
    const up = colorMe.brightGreen(symbols.upArrowAlt);
    const down = colorMe.brightGreen(symbols.downArrowAlt);
    const enter = colorMe.brightGreen(symbols.enter);
    println(
      center(
        `Type to search, ${up} or ${down} to navigate, ${enter} to select`,
      ),
    );
    println("");
    println(
      `${colorMe.brightYellow("Search:")} ${this.searchString}${keyMap.block}`,
    );
    println("");
    this.filteredList.forEach((item, index) => {
      if (index === this.currentIndex) {
        println(`${symbols.cursor} ${item}`, "brightMagenta");
      } else {
        println(`  ${item}`);
      }
    });
  }
  select(item: string) {
    if (this.action) {
      this.action(item);
    }
  }

  finalizer() {
    const selected = this.filteredList[this.currentIndex];
    if (this.action) {
      this.action(selected);
    }
    return selected;
  }
  async onPrompt() {
    await navigateList({
      currentIndex: this.currentIndex,
      maxOptions: () => this.filteredList.length,
      onPrompt: () => this.prompt(),
      onNavigate: (updatedIndex) => {
        this.currentIndex = updatedIndex;
      },
      validateSelection: () => {
        return this.filteredList.length > 0;
      },
      onChar: (char) => {
        switch (char) {
          case keyMap.backspace:
            this.searchString = this.searchString.slice(0, -1);
            break;
          default:
            this.searchString += char;
            break;
        }
        this.search();
      },
    });
  }
}

export { SearchableList };
