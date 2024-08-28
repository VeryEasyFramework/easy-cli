import { BaseView } from "#/views/baseView.ts";
import {
  TaskElement,
  type TaskElementOptions,
} from "#/elements/taskElement.ts";
import { OutputElement } from "#/elements/outputElement.ts";

interface Task {
  taskName: string;
  element: TaskElement;
  action: () => Promise<void> | void;
}

interface AddTaskOptions {
  action: (callbacks: {
    output: (data: string | string[], replace?: boolean) => void;
    fail: () => void;
    progress: (progress: number, total: number, message: string) => void;
    success: () => void;
  }) => Promise<void> | void;
}
export class TaskView extends BaseView {
  output: string[] = [];
  outputElement: OutputElement = new OutputElement();
  status: "pending" | "running" | "done" = "pending";

  tasks: Task[] = [];
  doneActions: Array<() => Promise<void> | void> = [];

  messageElement: string = "";

  startActions: Array<() => Promise<void> | void> = [];

  onStart(callback: () => Promise<void> | void) {
    this.startActions.push(callback);
  }

  constructor(options?: {
    title?: string;
    description?: string;
    clock?: boolean;
  }) {
    super({
      title: "Task View",
      description: "Running tasks",
      clock: true,
      ...options,
    });
  }
  addTask(taskName: string, options?: AddTaskOptions & TaskElementOptions) {
    const taskElement = new TaskElement(taskName, options);
    const task: Task = {
      taskName,
      element: taskElement,
      action: async () => {
        taskElement.run();
        await options?.action({
          output: (data, replace) => {
            if (Array.isArray(data)) {
              for (const line of data) {
                this.outputElement.addContent(line);
              }
            } else {
              this.outputElement.addContent(data, replace);
            }
          },
          fail: () => {
            taskElement.fail();
          },
          progress: (progress: number, total: number) => {
            taskElement.progress = progress;
          },
          success: () => {
            taskElement.done();
          },
        });
      },
    };
    this.tasks.push(task);
  }
  async start() {
    for (const action of this.startActions) {
      await action();
    }
    for (const task of this.tasks) {
      await task.action();
    }
    this.done();
  }
  onDone(callback: () => void) {
    this.doneActions.push(callback);
  }
  scroll: number = 0;
  done() {
    this.status = "done";
    this.updateMessage("All done! press enter to continue");

    this.outputElement.scroll = 0;
  }

  calculateSize() {
  }
  setup(): void {
    this.onInput("special", "up", () => {
      this.outputElement.scrollUp();
    });
    this.onInput("special", "down", () => {
      this.outputElement.scrollDown();
    });
    this.onInput("special", "enter", () => {
      switch (this.status) {
        case "pending":
          this.status = "running";
          this.updateMessage("Running tasks");
          this.start();
          break;
        case "done":
          if (!this.doneActions.length) {
            this.cli.stop();
            Deno.exit(0);
          }
          this.doneActions.forEach(async (action) => {
            await action();
          });
          this.reset();
          break;
      }
    });
  }
  reset() {
    this.status = "pending";
    this.tasks.forEach((task) => {
      task.element.reset();
    });
    this.outputElement.contentRows = [];
    this.updateMessage("");
  }
  addOutputElement() {
    this.outputElement.width = (): number => {
      return this.engine.currentWidth -
        this.engine.contentPadding - 4;
    };
    this.outputElement.height = (): number => {
      return this.engine.currentHeight - 2 - this.startRow -
        this.engine.contentPadding - this.tasks.length - 4;
    };
    this.engine.addElement(this.outputElement, {
      row: this.startRow + this.tasks.length + 3,
      justify: "center",
    });
  }

  updateMessage(content: string) {
    this.engine.updateElement(this.messageElement, {
      content,
    });
  }
  build() {
    this.calculateSize();

    this.tasks.forEach((task, index) => {
      this.engine.addElement(task.element, {
        row: this.startRow + index,
      });
    });
    this.messageElement = this.engine.createElement("", {
      row: this.startRow + this.tasks.length + 1,
      align: "center",
      style: {
        color: "brightMagenta",
        bold: true,
      },
    });
    this.addOutputElement();
    this.updateMessage("Press enter to start");
  }
}
