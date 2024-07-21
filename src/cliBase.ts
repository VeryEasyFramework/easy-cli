import { colorMe } from "@eveffer/color-me";
import { asyncPause } from "./cliUtils.ts";
import { center } from "./utils/format.ts";
import { print, println } from "./utils/print.ts";

export abstract class CLIBase<T> {
  title: string;

  get header() {
    return center(this.title, "=", {
      contentColor: "brightCyan",
      fillerColor: "brightWhite",
    });
  }

  constructor(title?: string) {
    this.title = title || "EasyCLI";
  }

  abstract onPrompt(): Promise<void>;
  abstract finalizer(): T;

  abstract renderContent(): void;
  async prompt() {
    this.render();
    await this.onPrompt();
  }
  render() {
    console.clear();
    println(this.header);
    this.renderContent();
  }

  async run(): Promise<T> {
    await asyncPause(500);
    await this.prompt();
    return this.finalizer();
  }
}
