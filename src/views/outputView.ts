import { BaseView } from "#/views/baseView.ts";
import { ClockElement } from "#/elements/clockElement.ts";
import { TaskElement } from "#/elements/taskElement.ts";

export class OutputView extends BaseView {
  clock: ClockElement = new ClockElement();

  tasks: TaskElement[] = [
    new TaskElement("Task 1", {
      style: "lineBounce",
    }),
    new TaskElement("Task 2", {
      style: "loop",
    }),
    new TaskElement("Task 3"),
  ];
  setup(): void {
    this.engine.addElement(this.clock, {
      row: -1,
    });
    this.tasks.forEach((task, index) => {
      this.engine.addElement(task, {
        row: this.startRow + index,
      });
    });
  }
  build() {
  }
}
