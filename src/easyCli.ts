import { colorMe } from "@vef/color-me";
import { CLIBase } from "./cliBase.ts";
import { symbol, symbols } from "./utils/print.ts";
import { StyleOptions } from "./utils/render.ts";
import { toCamelCase } from "@vef/string-utils";

interface Action {
  name: string;
  description?: string;
  id: string;
  descriptionId: string;
  dividerId?: string;
  action: (...args: any[]) => Promise<void> | void;
}
export interface AddMenuOptions {
  menuName: string;
  description?: string;
  actions: AddActionOptions[];
  exitAction?: AddActionOptions;
}
export interface AddActionOptions {
  name: string;
  description?: string;
  action: (...args: any[]) => void;
}
export class EasyCli extends CLIBase<string> {
  currentSelection: number = 1;
  exitId!: string;
  actions: Action[] = [];

  baseTitle: string = "Easy CLI";

  set menuTitle(title: string) {
    this.title = `${this.baseTitle} - ${title}`;
  }
  set startingMenu(menu: string) {
    this._startingMenu = toCamelCase(menu);
  }

  private _startingMenu: string = "";
  menus: Record<string, AddMenuOptions> = {};
  private get startRow(): number {
    if (this.description) {
      return 7;
    }
    return 5;
  }
  private get instructions(): string {
    const up = colorMe.brightGreen(symbols.upArrowAlt);
    const down = colorMe.brightGreen(symbols.downArrowAlt);
    const enter = colorMe.brightGreen(symbols.enter);
    return `Use ${up} and ${down} to navigate, ${enter} to select`;
  }
  private exitAction: AddActionOptions = {
    name: "Exit",
    description: "Exit the menu",
    action: async () => {
      await this.finish(true);
    },
  };
  get maxDescriptionLength() {
    let length = 0;
    this.actions.forEach((action) => {
      if (action.description && action.description.length > length) {
        length = action.description.length;
      }
    });
    return length;
  }

  maxActionCharLength: number = 0;
  maxDescriptionCharLength: number = 0;

  setMaxCharsLength() {
    let actionLength = 0;
    let descriptionLength = 0;
    for (const menu in this.menus) {
      const actions = this.menus[menu].actions;
      actions.forEach((action) => {
        if (action.name.length > actionLength) {
          actionLength = action.name.length;
        }
        if (
          action.description && action.description.length > descriptionLength
        ) {
          descriptionLength = action.description.length;
        }
      });
    }

    this.maxActionCharLength = actionLength + 2;
    this.maxDescriptionCharLength = descriptionLength + 2;
  }
  get menuLength() {
    return this.actions.length;
  }

  setDescription(description: string) {
    this.description = description;
  }
  addAction(action: AddActionOptions) {
    this.setMaxCharsLength();
    const { name, description, action: actionFunction } = action;

    this.actions.push({
      name,
      description,
      action: actionFunction,
      id: "",
      descriptionId: "",
    });
  }

  addMenu(options: AddMenuOptions) {
    const key = toCamelCase(options.menuName);
    this.menus[key] = options;
  }

  private setActiveMenu(menu: AddMenuOptions) {
    this.addActions(menu.actions);
    this.addAction(menu.exitAction || this.exitAction);
    this.setDescription(menu.description || "");
    this.menuTitle = menu.menuName;
    this.currentSelection = 1;
  }
  changeMenu(groupName: string) {
    const key = toCamelCase(groupName);
    const menu = this.menus[key];
    if (menu) {
      this.removeActions();
      this.setActiveMenu(menu);
      this.buildMenu();
      this.renderEngine.forceRender();
    }
  }

  addActions(actions: AddActionOptions[]) {
    actions.forEach((action) => {
      this.addAction(action);
    });
  }
  private removeActions() {
    if (!this.actions.length) {
      return;
    }
    this.actions.forEach((action) => {
      this.renderEngine.removeElement(action.id);
      this.renderEngine.removeElement(action.descriptionId);
      if (action.dividerId) {
        this.renderEngine.removeElement(action.dividerId);
      }
    });
    this.actions = [];
  }
  buildMenu() {
    this.actions.forEach((action, index) => {
      const row = index + this.startRow;
      const style = (): StyleOptions => {
        if (this.currentSelection === index + 1) {
          return {
            color: "brightMagenta",
            bold: true,
          };
        }
        return {
          color: "brightYellow",
          bold: true,
        };
      };

      const name = action.name;

      action.id = this.renderEngine.createElement(`  ${name}`, {
        row,
        maxWidth: this.maxActionCharLength,
        style,
      });
      action.dividerId = this.addDivider(row);
      const description = action.description || "";
      action.descriptionId = this.renderEngine.createElement(
        description,
        {
          maxWidth: this.maxDescriptionCharLength,
          row,
          style: () => {
            if (this.currentSelection === index + 1) {
              return {
                color: "white",
                bold: true,
                italic: true,
              };
            }
            return {
              color: "gray",
              italic: true,
            };
          },
        },
      );
      // this.renderEngine.justifyContent(row, "start");
    });
    this.setActiveItem(0, 0);
  }
  private addDivider(row: number) {
    return this.renderEngine.createElement(
      `  ${symbol.box.vertical}  `,
      {
        row,
        maxContent: true,
        align: "center",
        style: {
          color: "cyan",
        },
      },
    );
  }
  async finalizer(): Promise<string> {
    return "exit";
  }

  setActiveItem(index: number, prevIndex: number) {
    const arrow = symbol.arrows.alt2Right;
    const action = this.actions[index];
    const prevAction = this.actions[prevIndex];
    this.renderEngine.updateElement(prevAction.id, {
      content: `  ${prevAction.name}`,
    });
    this.renderEngine.updateElement(action.id, {
      content: `${arrow} ${action.name}`,
    });
  }
  setup(): void {
    // this.setDebug();
    this.baseTitle = this.title;
    if (this.description) {
      this.setDescription(this.description);
    }
    this.instruction = {
      message: this.instructions,
      raw: true,
    };
    this._startingMenu;
    const menu = this.menus[this._startingMenu];
    if (menu) {
      this.setActiveMenu(menu);
    }
    this.buildMenu();
    const arrow = symbol.arrows.alt2Right;

    this.listener.on("up", () => {
      const prevAction = this.currentSelection - 1;
      this.currentSelection--;
      if (this.currentSelection < 1) {
        this.currentSelection = this.menuLength;
      }
      const action = this.currentSelection - 1;
      this.setActiveItem(action, prevAction);
    });

    this.listener.on("down", () => {
      const prevAction = this.currentSelection - 1;
      this.currentSelection++;
      if (this.currentSelection > this.menuLength) {
        this.currentSelection = 1;
      }
      const action = this.currentSelection - 1;
      this.setActiveItem(action, prevAction);
    });

    this.listener.on("enter", async () => {
      const action = this.actions[this.currentSelection - 1];
      await action.action();
    });
  }
}
