import { colorMe } from "@vef/color-me";
import { keyMap, navigateList } from "./cliUtils.ts";

export interface SelectorOption<T> {
  name: string; // The name of the option
  id: T;
  description: string;
  action?: () => Promise<void> | void;
}

/**
 * A simple CLI option selector that prompts the user to select an option from a list.
 * Returns the id of the selected option.
 */
export class OptionSelector<T extends PropertyKey> {
  options: SelectorOption<T>[];
  currentOption: number = 0;

  constructor(options: SelectorOption<T>[]) {
    this.options = options;
    this.currentOption = 0;
  }

  render() {
    console.clear();
    const options = this.options.map((option, index) => {
      const out = `${index + 1}. # ${option.name}`;
      if (index === this.currentOption) {
        return colorMe.brightMagenta(`> `) + colorMe.brightCyan(out) +
          colorMe.gray(` - ${option.description}`);
      }
      return `  ${out}`;
    });
    console.log(`Select an option:\n${options.join("\n")}`);
  }

  finalizer(): T {
    const currentOption = this.options[this.currentOption];
    currentOption?.action?.();
    return this.options[this.currentOption].id;
  }
  async prompt(): Promise<void> {
    this.render();
    await navigateList({
      currentIndex: this.currentOption,
      maxOptions: this.options.length,
      onPrompt: () => this.prompt(),
      onNavigate: (updatedIndex) => {
        this.currentOption = updatedIndex;
      },
    });
  }

  async run(): Promise<T> {
    await this.prompt();
    return this.finalizer();
  }
}
