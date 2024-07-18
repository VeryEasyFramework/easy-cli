import { colorMe } from "@eveffer/color-me";

import { CliMenu } from "./cliMenu.ts";
import type { ActionMenuItem, SubMenuItem } from "./types.ts";

async function asyncPause(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * EasyCli is an easy-to-use CLI builder for interactive command-line applications
 */
export class EasyCli {
  private mainMenu = new CliMenu("Main Menu");

  constructor(title?: string) {
    this.mainMenu.menuName = title || "Main Menu";

    this.mainMenu.onBack({
      title: "Exit",
      description: "Quit the application",
      action: () => {
        Deno.exit();
      },
    });
  }

  /**
   * Add a menu item to the main menu
   */
  addMenuItem(menuItem: ActionMenuItem) {
    this.mainMenu.addMenuItem(menuItem);
  }

  /**
   * Add a submenu to the main menu
   */
  addSubMenu(subMenu: SubMenuItem) {
    this.mainMenu.addSubMenu(subMenu);
  }

  /**
   * Run the CLI
   */
  public async run(): Promise<void> {
    if (!this.mainMenu.menuItems.length) {
      console.error(
        colorMe.red("Oops! You need to add at least one menu item. Exiting..."),
      );
      Deno.exit();
    }
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
