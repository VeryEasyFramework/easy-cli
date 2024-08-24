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
    output: (data: string | string[]) => void;
    fail: () => void;
    progress: (progress: number) => void;
    success: () => void;
  }) => Promise<void> | void;
}
export class TaskView extends BaseView {
  output: string[] = [];
  outputElement = new OutputElement();

  tasks: Task[] = [];
  doneActions: Array<() => void> = [];

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
          progress: (progress: number) => {
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
  }
  onDone(callback: () => void) {
    this.doneActions.push(callback);
  }
  scroll: number = 0;
  done() {
    this.engine.createElement("All done! Press 'Enter' to continue...", {
      row: this.startRow + this.tasks.length + 1,
      align: "center",
      style: {
        color: "brightMagenta",
        bold: true,
      },
    });
    this.listener.on("down", () => {
      this.scroll++;
      this.outputElement.scrollDown();
    });
    this.listener.on("up", () => {
      this.scroll--;
      this.outputElement.scrollUp();
    });

    this.listener.on("enter", () => {
      this.doneActions.forEach((action) => {
        action();
      });
    });
  }

  calculateSize() {
  }
  setup(): void {
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
  build() {
    this.calculateSize();

    this.tasks.forEach((task, index) => {
      this.engine.addElement(task.element, {
        row: this.startRow + index,
      });
    });
    this.addOutputElement();
  }
}
