import { BaseView } from "#/views/baseView.ts";
import { ClockElement } from "#/elements/clockElement.ts";
import {
  TaskElement,
  type TaskElementOptions,
} from "#/elements/taskElement.ts";
import { ColorMe } from "../../mod.ts";
import { OutputElement } from "#/elements/outputElement.ts";

interface Task {
  taskName: string;
  element: TaskElement;
  action: () => Promise<void> | void;
}

interface AddTaskOptions {
  action: (callbacks: {
    output: (data: string | string[]) => void;
    fail: () => void;
    success: () => void;
  }) => Promise<void> | void;
}
export class TaskView extends BaseView {
  output: string[] = [];
  outputElement = new OutputElement();

  tasks: Task[] = [];
  doneActions: Array<() => void> = [];
  addTask(taskName: string, options?: AddTaskOptions & TaskElementOptions) {
    const taskElement = new TaskElement(taskName, options);
    const task: Task = {
      taskName,
      element: taskElement,
      action: async () => {
        taskElement.run();
        await options?.action({
          output: (data) => {
            if (Array.isArray(data)) {
              for (const line of data) {
                this.outputElement.addContent(line);
              }
            } else {
              this.outputElement.addContent(data);
            }
          },
          fail: () => {
            taskElement.fail();
          },
          success: () => {
            taskElement.done();
          },
        });
      },
    };
    this.tasks.push(task);
  }
  start() {
    this.tasks.forEach(async (task) => {
      await task.action();
    });
  }
  onDone(callback: () => void) {
    this.doneActions.push(callback);
  }
  done() {
    this.engine.createElement("All Done! Press enter to continue...", {
      row: this.startRow + this.tasks.length + 1,
      align: "center",
      style: {
        color: "brightMagenta",
        bold: true,
      },
    });
    this.listener.on("enter", () => {
      this.doneActions.forEach((action) => {
        action();
      });
    });
  }
  setup(): void {
    this.outputElement.width = this.engine.currentWidth -
      this.engine.contentPadding - 4;
    this.outputElement.height = this.engine.currentHeight - 2 - this.startRow -
      this.engine.contentPadding - this.tasks.length - 4;
  }

  addOutputElement() {
    this.engine.addElement(this.outputElement, {
      row: this.startRow + this.tasks.length + 3,
      justify: "center",
    });
  }
  build() {
    this.engine.addElement(this.clock, {
      row: -2,
      justify: "end-edge",
    });
    this.tasks.forEach((task, index) => {
      this.engine.addElement(task.element, {
        row: this.startRow + index,
      });
    });
    this.addOutputElement();
  }
}
