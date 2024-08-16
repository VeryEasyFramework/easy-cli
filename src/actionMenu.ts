import { colorMe } from "@vef/color-me";
import { CLIBase } from "./cliBase.ts";
import { symbol, symbols } from "./utils/print.ts";
import { StyleOptions } from "./utils/render.ts";

interface Action {
  name: string;
  description?: string;
  id: string;
  descriptionId: string;
  action: (...args: any[]) => Promise<void> | void;
}

interface AddActionOptions {
  name: string;
  description?: string;
  action: (...args: any[]) => void;
}
export class ActionMenu extends CLIBase<string> {
  currentSelection: number = 1;
  exitId!: string;
  actions: Action[] = [];

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
  get maxDescriptionLength() {
    let length = 0;
    this.actions.forEach((action) => {
      if (action.description && action.description.length > length) {
        length = action.description.length;
      }
    });
    return length;
  }
  get maxActionCharLength() {
    let length = 0;
    this.actions.forEach((action) => {
      if (action.name.length > length) {
        length = action.name.length;
      }
    });
    return length + 2;
  }
  get menuLength() {
    return this.actions.length;
  }

  setDescription(description: string) {
    this.description = description;
  }
  addAction(action: AddActionOptions) {
    const { name, description, action: actionFunction } = action;

    this.actions.push({
      name,
      description,
      action: actionFunction,
      id: "",
      descriptionId: "",
    });
  }

  buildMenu() {
    this.addAction({
      name: "Exit",
      description: "Exit the menu",
      action: async () => {
        await this.finish(true);
      },
    });

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
      const content = () => {
        if (this.currentSelection === index + 1) {
          return `> ${name}`;
        }
        return `  ${name}`;
      };
      action.id = this.renderEngine.createElement(content, {
        row,
        minWidth: this.maxActionCharLength,
        style,
      });
      this.addDivider(row);
      const description = action.description || "";
      action.descriptionId = this.renderEngine.createElement(
        description,
        {
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
      this.renderEngine.justifyContent(row, "start");
    });
  }
  private addDivider(row: number) {
    this.renderEngine.createElement(
      ` ${symbol.box.vertical} `,
      {
        row,
        maxWidth: 3,
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

  setup(): void {
    if (this.description) {
      this.setDescription(this.description);
    }
    this.instruction = {
      message: this.instructions,
      raw: true,
    };
    this.buildMenu();

    this.listener.on("up", () => {
      this.currentSelection--;
      if (this.currentSelection < 1) {
        this.currentSelection = this.menuLength;
      }
    });

    this.listener.on("down", () => {
      this.currentSelection++;
      if (this.currentSelection > this.menuLength) {
        this.currentSelection = 1;
      }
    });

    this.listener.on("enter", async () => {
      const action = this.actions[this.currentSelection - 1];
      await action.action();
    });
  }
}
