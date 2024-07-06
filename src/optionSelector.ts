import { colorMe } from "@eveffer/color-me";

const keyMap = {
  up: "\x1b[A",
  down: "\x1b[B",
  left: "\x1b[D",
  right: "\x1b[C",
  enter: "\r",
  escape: "\x1b",
  ctrlC: "\x03",
};
const reverseKeyMap = Object.fromEntries(
  Object.entries(keyMap).map(([key, value]) => [value, key]),
);
export type SelectorOption<T> = {
  name: string;
  id: T;
  description: string;
  action?: (...args: any) => Promise<void> | void;
};

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

  async selectOption(): Promise<T> {
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
    Deno.stdin.setRaw(true);
    const input = Deno.stdin.readable.getReader();
    const res = await input.read();
    // convert Uint8Array to string
    const option = res.value ? new TextDecoder().decode(res.value) : "";
    switch (option) {
      case keyMap.up:
        this.currentOption -= 1;
        if (this.currentOption < 0) {
          this.currentOption = this.options.length - 1;
        }
        input.releaseLock();
        await this.selectOption();
        break;
      case keyMap.down:
        this.currentOption += 1;
        if (this.currentOption >= this.options.length) {
          this.currentOption = 0;
        }
        input.releaseLock();
        await this.selectOption();
        break;
      // case keyMap.left:
      //   break;
      // case keyMap.right:
      //   break;
      case keyMap.enter:
        break;
      case keyMap.ctrlC:
        Deno.exit();
        break;
      default:
        input.releaseLock();
        await this.selectOption();
        break;
    }
    console.clear();
    input.releaseLock();
    Deno.stdin.setRaw(false);
    const currentOption = this.options[this.currentOption];
    currentOption?.action?.();
    return this.options[this.currentOption].id;
  }
}
