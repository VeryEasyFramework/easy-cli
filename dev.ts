import { EasyCli } from "./mod.ts";
import { MenuView } from "./src/views/menuView.ts";
import { OutputView } from "./src/views/outputView.ts";
import { TaskView } from "#/views/taskView.ts";
import { InputView } from "./src/views/inputView.ts";
import { AnimationView } from "#/views/animationView.ts";

if (import.meta.main) {
  const cli = new EasyCli({
    engine: {
      refreshRate: 30,
    },
  });
  const inputView = new InputView();
  const menuView = new MenuView(
    {
      clock: true,
    },
  );
  menuView.addAction({
    name: "Task",
    action: () => {
      cli.changeView("task");
    },
  });
  menuView.addAction({
    name: "Task",
    action: () => {
      cli.changeView("task");
    },
  });
  menuView.addAction({
    name: "Task",
    action: () => {
      cli.changeView("task");
    },
  });
  menuView.addAction({
    name: "Task",
    action: () => {
      cli.changeView("task");
    },
  });
  menuView.addAction({
    name: "Task",
    action: () => {
      cli.changeView("task");
    },
  });
  menuView.addAction({
    name: "Task",
    action: () => {
      cli.changeView("task");
    },
  });
  menuView.addAction({
    name: "Task",
    action: () => {
      cli.changeView("task");
    },
  });

  const animationView = new AnimationView({
    clock: false,
  });
  cli.addView(animationView, "animation");
  cli.addView(inputView, "input");
  cli.addView(menuView, "menu");
  cli.changeView("menu");
  cli.run();
}
