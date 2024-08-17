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
  action: () => void;
}

interface AddTaskOptions {
  action: (callbacks: {
    output: (data: string) => void;
    fail: () => void;
    success: () => void;
  }) => void;
}
export class TaskView extends BaseView {
  clock: ClockElement = new ClockElement();

  output: string[] = [];
  outputElement = new OutputElement();
  tasks: Task[] = [];
  addTask(taskName: string, options?: AddTaskOptions & TaskElementOptions) {
    const taskElement = new TaskElement(taskName, options);
    const task: Task = {
      taskName,
      element: taskElement,
      action: () => {
        taskElement.run();
        options?.action({
          output: (data) => {
            this.outputElement.addContent(data);
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
    this.tasks.forEach((task) => {
      task.action();
    });
  }
  setup(): void {
  }

  addOutputElement() {
    this.outputElement.width = this.engine.currentWidth -
      this.engine.contentPadding * 5;
    this.outputElement.height = this.engine.currentHeight - 2 - this.startRow -
      this.engine.contentPadding;
    this.tasks.length;
    this.engine.addElement(this.outputElement, {
      row: this.startRow + this.tasks.length + 1,
    });
  }
  build() {
    this.engine.addElement(this.clock, {
      row: -1,
    });
    this.tasks.forEach((task, index) => {
      this.engine.addElement(task.element, {
        row: this.startRow + index,
      });
    });
    this.addOutputElement();
  }
}
