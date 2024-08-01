import { center } from "./utils/format.ts";
import { RenderEngine } from "./utils/render.ts";
import { InputListener } from "./utils/inputListener.ts";

export abstract class CLIBase<T> {
  title: string;
  renderEngine: RenderEngine;
  listener: InputListener;

  result!: T;

  get header(): string {
    return center(this.title, "=", {
      contentColor: "brightCyan",
      fillerColor: "brightWhite",
    });
  }

  constructor(title?: string) {
    this.title = title || "Easy CLI";
    this.renderEngine = new RenderEngine();
    this.listener = new InputListener();
    this.setHeader();
  }

  setHeader() {
    this.renderEngine.createElement(this.title, {
      row: 1,
      style: {
        color: "brightCyan",
        bold: true,
        underline: true,
      },
    });
  }

  async finish(): Promise<void> {
    this.result = await this.finalizer();
    this.listener.on("escape", () => {
      this.listener.stop();
    });
  }

  abstract finalizer(): Promise<T>;

  abstract setup(): void;

  run(): Promise<T> {
    this.setup();
    const promise = new Promise<T>((resolve) => {
      this.listener.onDone(() => {
        this.renderEngine.stop();

        resolve(this.result);
        // this.renderEngine.stop();
      });
    });
    this.renderEngine.run();

    this.listener.listen();
    // await this.prompt();
    return promise;
  }
}
