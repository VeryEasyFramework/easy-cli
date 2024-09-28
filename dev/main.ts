import { EasyCli } from "#/easyCli.ts";
import { MenuView } from "#/views/menuView.ts";

const cli = new EasyCli();
const menu = new MenuView();
menu.addAction({
  name: "Test",
  action: () => {},
  description: "Test the application",
});

menu.addAction({
  name: "Test 2",
  action: () => {},
  description: "Test the application",
});
cli.addView(menu, "main");

cli.run();

cli.changeView("main");
