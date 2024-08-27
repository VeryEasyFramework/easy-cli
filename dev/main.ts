import { EasyCli } from "#/easyCli.ts";
import { MenuView } from "../mod.ts";

const cli = new EasyCli();

cli.addView(new MenuView(), "main");

cli.run();

cli.changeView("main");
