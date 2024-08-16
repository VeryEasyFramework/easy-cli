import { center } from "./utils/format.ts";
import { RenderEngine, StyleOptions } from "./utils/render.ts";
import { InputListener } from "./utils/inputListener.ts";
import { showCursor } from "./cliUtils.ts";

export abstract class CLIBase<T> {
  title: string;

  instruction?: {
    message: string;
    raw?: boolean;
    style?: StyleOptions;
  };

  description?: string;
  renderEngine: RenderEngine;
  listener: InputListener;

  result!: T;

  get header(): string {
    return center(this.title, "=", {
      contentColor: "brightCyan",
      fillerColor: "brightWhite",
    });
  }

  constructor(title?: string, description?: string) {
    this.description = description;
    this.title = title || "Easy CLI";
    this.renderEngine = new RenderEngine();
    this.listener = new InputListener();
  }

  setHeader() {
    this.renderEngine.createElement(this.title, {
      row: 1,
      align: "center",
      style: {
        color: "brightCyan",
        bold: true,
        underline: true,
      },
    });
    //  / this.renderEngine.justifyContent(1, "center");

    if (this.description) {
      this.renderEngine.createElement(this.description, {
        row: 3,
        align: "center",
        style: {
          color: "brightWhite",
          italic: true,
        },
      });
    }
    if (this.instruction) {
      this.renderEngine.createElement(this.instruction.message, {
        row: this.description ? 5 : 3,
        align: "center",
        raw: this.instruction.raw,
        style: this.instruction.style,
      });
    }
  }

  async finish(stop?: boolean): Promise<void> {
    this.result = await this.finalizer();
    this.listener.on("escape", () => {
      this.listener.stop();
    });
    if (stop) {
      this.listener.stop();
    }
  }

  abstract finalizer(): Promise<T>;

  abstract setup(): void;

  run(): Promise<T> {
    this.setup();
    this.setHeader();
    const promise = new Promise<T>((resolve) => {
      this.listener.onDone(() => {
        this.renderEngine.stop();
        showCursor();
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
