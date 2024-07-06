import { colorMe } from "@eveffer/color-me";

import { CliMenu, type MenuItem } from "./cliMenu.ts";

async function asyncPause(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
export class EasyCli {
  mainMenu = new CliMenu("Main Menu", {});

  constructor(options?: {
    menuItems?: MenuItem[];
    onNavBack?: () => void;
  }) {
    for (const item of options?.menuItems || []) {
      this.mainMenu.addMenuItem(item);
    }
  }

  addMenuItem(menuItem: MenuItem) {
    this.mainMenu.addMenuItem(menuItem);
  }

  public async run(): Promise<void> {
    try {
      await asyncPause(500);
      await this.mainMenu.show();
    } catch (e) {
      console.error(colorMe.red(e.message));
      await asyncPause(2000);
      await this.run();
    }
  }
}
