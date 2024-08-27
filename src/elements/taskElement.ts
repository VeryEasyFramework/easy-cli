import { BaseElement } from "#/elements/baseElement.ts";
import { type BasicFgColor, ColorMe } from "../../mod.ts";
import { symbol } from "#/utils/print.ts";
import { Loader, type LoaderStyle } from "#/animation/loader.ts";

type TaskStatus = "running" | "done" | "failed" | "pending";
interface TaskMessages {
  pending: string;
  running: string;
  done: string;
  failed: string;
}

export interface TaskElementOptions {
  style?: LoaderStyle;
  messages?: TaskMessages;
}
export class TaskElement extends BaseElement {
  taskName: string;
  messages: TaskMessages;
  progress: number = 0;

  loader: Loader;

  private _status: TaskStatus = "pending";

  private statusColorMap: Record<TaskStatus, BasicFgColor> = {
    running: "brightYellow",
    done: "brightGreen",
    failed: "brightRed",
    pending: "brightWhite",
  };
  private statusSymbolMap: Record<TaskStatus, keyof typeof symbol> = {
    running: "ellipsis",
    done: "check",
    failed: "cross",
    pending: "info",
  };

  get status(): TaskStatus {
    return this._status;
  }
  get statusSymbol(): string {
    const icon = symbol[this.statusSymbolMap[this._status]];
    return icon as string;
  }
  constructor(taskName: string, options?: TaskElementOptions) {
    super();
    this.loader = new Loader({
      style: options?.style || "loop",
      // customFrames: {
      //   base: "_",
      //   notch: "|",
      //   width: 10,
      // },
      speed: 1.5,
      easing: "linear",
      type: "loop",
    });
    this.messages = options?.messages || {
      pending: `Waiting to run ${taskName}`,
      running: `Running ${taskName}`,
      done: `${taskName} completed successfully`,
      failed: `There was an error running ${taskName}`,
    };
    this.taskName = taskName;
  }

  setup(): void {
  }

  render(elapsedTime: number): string {
    const statusSymbol = this.statusSymbol as string;
    const status = ColorMe.fromOptions(` ${statusSymbol} `, {
      color: this.statusColorMap[this._status],
      bgColor: this.theme.backgroundColor,
    });
    const frame = ColorMe.fromOptions(` ${this.loader.frame} `, {
      color: this.statusColorMap[this._status],
    });
    let output = "";
    switch (this._status) {
      case "running":
        this.loader.animate(elapsedTime);
        output = ColorMe.chain().content(this.messages.running)
          .bgColor(this.theme.backgroundColor)
          .color("yellow")
          .bold()
          .content(frame)
          .color("white")
          .end();
        break;
      case "done":
        output = ColorMe.chain().content(this.messages.done)
          .bgColor(this.theme.backgroundColor)
          .color("brightGreen")
          .content(status)
          .end();
        break;
      case "failed":
        output = ColorMe.chain().content(this.messages.failed)
          .bgColor(this.theme.backgroundColor)
          .color("red")
          .content(status)
          .end();
        break;
      case "pending":
        output = ColorMe.chain().content(this.messages.pending)
          .bgColor(this.theme.backgroundColor)
          .color("white")
          .end();
        break;
    }
    return output;
  }

  done() {
    this._status = "done";
  }
  fail() {
    this._status = "failed";
  }
  run() {
    this._status = "running";
  }
  pending() {
    this._status = "pending";
  }
}
