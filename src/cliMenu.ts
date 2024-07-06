import { colorMe } from "@eveffer/color-me";
import { cliFormatter } from "./cliUtils.ts";
import type { ActionMenuItem, MenuItem, SubMenuItem } from "./types.ts";

const keyMap = {
  up: "\x1b[A",
  down: "\x1b[B",
  left: "\x1b[D",
  right: "\x1b[C",
  enter: "\r",
  escape: "\x1b",
  ctrlC: "\x03",
};

export class CliMenu {
  menuItems: Array<MenuItem>;
  menuName: string = "Menu";
  output: string = "";
  private formattedHeader: string = "";
  private goBack: () => Promise<void> | void = Deno.exit;
  private activeItemIndex: number = 0;
  private goBackItem: ActionMenuItem = {
    title: "Back",
    description: "Go back to the previous menu",
    action: () => {},
    returnWhenDone: true,
  };

  constructor(name: string, options?: {
    backTitle?: string;
    backDescription?: string;
  }) {
    this.menuItems = [];
    this.menuName = name || "Menu";
    if (options?.backTitle || options?.backDescription) {
      this.onBack(
        {
          title: options.backTitle || "Back",
          description: options.backDescription ||
            "Go back to the previous menu",
          action: () => {},
        },
      );
      return;
    }

    // this.onBack(
    //   {
    //     title: options.backTitle || "Exit",
    //     description: options.backDescription || "Quit the application",
    //     action: this.goBack,
    //   },
    // );
  }

  get menuHeader(): string {
    return this.formattedHeader;
  }

  set menuHeader(value: string) {
    value = value || this.menuName;
    const filler = cliFormatter.makeFiller("=", value);
    this.formattedHeader = `${filler} ${value} ${filler}`;
  }

  onBack(options: {
    title: string;
    description: string;
    action: () => Promise<void> | void;
  }) {
    this.goBackItem = {
      title: options.title,
      description: options.description,
      action: options.action,
      returnWhenDone: true,
    };
  }

  private print(content: string) {
    console.info(content);
  }

  addMenuItem(menuItem: ActionMenuItem) {
    this.menuItems.push({
      title: menuItem.title,
      description: menuItem.description || "",
      action: menuItem.action,
      returnWhenDone: menuItem.returnWhenDone || false,
      waitAfterAction: menuItem.waitAfterAction || false,
    });
  }
  addSubMenu(subMenu: SubMenuItem) {
    this.menuItems.push({
      ...subMenu,
    });
  }

  async show() {
    this.activeItemIndex = 0;
    await this.refresh();
  }

  private async refresh() {
    console.clear();
    this.showMenu();
    await this.waitForKey();
  }

  private showMenu() {
    this.menuHeader = this.menuName;
    const choices = this.menuItems.map((menuItem, index) => {
      let title = menuItem.title;
      if (menuItem.subMenu) {
        title = colorMe.brightGreen(title);
      } else {
        title = colorMe.brightBlue(title);
      }
      let out = `${index + 1}. ${title}`;
      if (index === this.activeItemIndex) {
        return colorMe.brightMagenta(`> `) + colorMe.brightCyan(out) +
          colorMe.gray(` - ${menuItem.description}`);
      }
      return `  ${index + 1}. ${title}`;
    });
    const goBack = this.goBackItem.title;
    if (this.activeItemIndex === this.menuItems.length) {
      choices.push(
        colorMe.brightMagenta(`> `) + colorMe.yellow(`${goBack}`) +
          colorMe.gray(` - ${this.goBackItem.description}`),
      );
    } else {
      choices.push(`  ${this.goBackItem.title}`);
    }
    this.print(this.menuHeader);
    this.print(`Select an option:\n${choices.join("\n")}`);
    this.print(`\n${colorMe.cyan("Output:")}\n${colorMe.white(this.output)}`);
  }

  async waitForKey() {
    Deno.stdin.setRaw(true);
    const input = Deno.stdin.readable.getReader();
    const res = await input.read();
    const isBack = this.activeItemIndex === this.menuItems.length;
    const keyStroke = res.value ? new TextDecoder().decode(res.value) : "";
    const currentItem = this.menuItems[this.activeItemIndex];
    const action = isBack
      ? this.goBackItem.action
      : this.menuItems[this.activeItemIndex].action;
    const subMenu = this.menuItems[this.activeItemIndex]?.subMenu
      ? this.menuItems[this.activeItemIndex].subMenu
      : undefined;
    const returnWhenDone = isBack
      ? true
      : this.menuItems[this.activeItemIndex]?.returnWhenDone;
    switch (keyStroke) {
      case keyMap.up:
        this.activeItemIndex -= 1;
        if (this.activeItemIndex < 0) {
          this.activeItemIndex = this.menuItems.length - 1;
        }
        break;
      case keyMap.down:
        this.activeItemIndex += 1;
        if (this.activeItemIndex >= this.menuItems.length + 1) {
          this.activeItemIndex = 0;
        }
        break;
      // case keyMap.left:
      //   break;
      // case keyMap.right:
      //   break;
      case keyMap.enter:
        console.clear();
        input.releaseLock();
        if (subMenu) {
          await subMenu.show();
        }
        if (action) {
          if (!isBack) {
            this.print(`Running action: ${currentItem.title}...\n\n`);
          }
          const result = await action();
          this.output = JSON.stringify(result, null, 2) || "";
          if (currentItem?.waitAfterAction) {
            prompt(colorMe.green("Press any key to continue..."));
          }
          if (returnWhenDone) {
            input.releaseLock();
            Deno.stdin.setRaw(false);
            return;
          }
        }
        break;
      case keyMap.ctrlC:
        console.log("ctrlC");
        Deno.exit();
        break;
      default:
        break;
    }
    input.releaseLock();
    await this.refresh();
  }
}
