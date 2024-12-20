import { BaseView } from "#/views/baseView.ts";
import { symbol, symbols } from "#/utils/print.ts";
import { box } from "#/utils/box.ts";
import { ColorMe, type StyleOptions } from "#/utils/colors.ts";
interface Action {
  name: string;
  description?: string;
  id: string;
  descriptionId: string;
  dividerId?: string;
  action: (...args: any[]) => Promise<void> | void;
}

interface AddActionOptions {
  name: string;
  description?: string;
  action: (...args: any[]) => void;
}
export class MenuView extends BaseView {
  private currentSelection = 1;
  private maxActionCharLength: number = 0;
  private maxDescriptionCharLength: number = 0;
  get actionStartRow(): number {
    return this.startRow + 2;
  }
  actions: Action[] = [];

  private get instructions(): string {
    const chain = ColorMe.chain("basic");
    chain.content("Use ")
      .bgColor(this.theme.backgroundColor)
      .color("white")
      .content(symbols.upArrowAlt)
      .color("brightGreen")
      .content(" and ")
      .color("brightWhite")
      .content(symbols.downArrowAlt)
      .color("brightGreen")
      .content(" to navigate, ")
      .color("brightWhite")
      .content(symbols.enter)
      .color("brightGreen")
      .content(" to select")
      .color("brightWhite");
    return chain.end();
  }

  private exitAction: Action = {
    name: "Exit",
    id: "",
    descriptionId: "",
    description: "Exit the application",
    action: () => {
      this.cli.stop();
    },
  };
  setExitAction(action: AddActionOptions) {
    this.exitAction = {
      name: action.name,
      description: action.description,
      action: action.action,
      id: "",
      descriptionId: "",
    };
  }
  private setMaxCharsLength() {
    let actionLength = 0;
    let descriptionLength = 0;
    this.actions.forEach((action) => {
      if (action.name.length > actionLength) {
        actionLength = action.name.length;
      }
      if (
        action.description && action.description.length > descriptionLength
      ) {
        descriptionLength = action.description.length;
      }
    });
    if (this.exitAction.name.length > actionLength) {
      actionLength = this.exitAction.name.length;
    }
    if (
      this.exitAction.description &&
      this.exitAction.description.length > descriptionLength
    ) {
      descriptionLength = this.exitAction.description.length;
    }

    this.maxActionCharLength = actionLength + 2;
    this.maxDescriptionCharLength = descriptionLength + 2;
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

  private addDivider(row: number) {
    return this.engine.createElement(
      `  ${box[this.theme.lineStyle].vertical}  `,
      {
        row,
        maxContent: true,
        align: "center",
        style: {
          color: this.theme.primaryColor,
        },
      },
    );
  }

  private setActiveItem(index: number, prevIndex: number) {
    const arrow = symbol.arrows.alt2Right;

    const action = index === this.menuLength - 1
      ? this.exitAction
      : this.actions[index];

    const prevAction = prevIndex === this.menuLength - 1
      ? this.exitAction
      : this.actions[prevIndex];

    if (prevAction) {
      this.engine.updateElement(prevAction.id, {
        content: `  ${prevAction.name}`,
        style: {
          color: "brightYellow",
          bold: true,
        },
      });
      this.engine.updateElement(prevAction.descriptionId, {
        style: {
          color: "white",
          dim: true,
          italic: true,
        },
      });
    }
    this.engine.updateElement(action.id, {
      content: `${arrow} ${action.name}`,
      style: {
        color: "brightMagenta",
        bold: true,
      },
    });
    this.engine.updateElement(action.descriptionId, {
      style: {
        color: "brightWhite",
        bold: true,
        italic: true,
      },
    });
  }
  private get menuLength() {
    return this.actions.length + 1;
  }
  setup(): void {
    const up = () => {
      const prevAction = this.currentSelection - 1;
      this.currentSelection--;
      if (this.currentSelection < 1) {
        this.currentSelection = this.menuLength;
      }
      const action = this.currentSelection - 1;
      this.setActiveItem(action, prevAction);
    };

    const down = () => {
      const prevAction = this.currentSelection - 1;
      this.currentSelection++;
      if (this.currentSelection > this.menuLength) {
        this.currentSelection = 1;
      }
      const action = this.currentSelection - 1;
      this.setActiveItem(action, prevAction);
    };
    const select = async () => {
      const action = this.currentSelection - 1;
      if (action === this.menuLength - 1) {
        await this.exitAction.action();
      } else {
        await this.actions[action].action();
      }
    };
    this.onInput("special", "up", up);
    let eventCount = 0;
    this.onMouseEvent(async (event) => {
      switch (event.event) {
        case "scrollDown":
          down();
          break;
        case "scrollUp":
          up();
          break;
        case "leftDown": {
          eventCount++;
          const selectedRow = event.position.y - this.actionStartRow - 2;

          if (selectedRow < 1 || selectedRow > this.actions.length + 1) {
            break;
          }
          if (selectedRow == this.currentSelection) {
            await select();
            break;
          }
          if (selectedRow > this.currentSelection) {
            while (selectedRow > this.currentSelection) {
              down();
            }
            break;
          }
          if (selectedRow < this.currentSelection) {
            while (selectedRow < this.currentSelection) {
              up();
            }
            break;
          }

          break;
        }

        default:
          break;
      }
    });

    this.onInput("special", "down", down);

    this.onInput("special", "enter", select);
  }
  build() {
    this.currentSelection = 1;
    this.setMaxCharsLength();
    this.engine.createElement(
      this.instructions,
      {
        row: this.startRow,
        align: "center",
      },
    );

    this.actions.forEach((action, index) => {
      const row = index + this.startRow + 2;
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

      action.id = this.engine.createElement(`  ${name}`, {
        row,
        maxWidth: this.maxActionCharLength,
        style,
      });
      action.dividerId = this.addDivider(row);
      const description = action.description || "";
      action.descriptionId = this.engine.createElement(
        description,
        {
          maxWidth: this.maxDescriptionCharLength,
          row,
          style: () => {
            if (this.currentSelection === index + 1) {
              return {
                bold: true,
                italic: true,
              };
            }
            return {
              dim: true,
              italic: true,
            };
          },
        },
      );
    });
    this.exitAction.id = this.engine.createElement(
      `  ${this.exitAction.name}`,
      {
        row: this.startRow + this.actions.length + 2,
        maxWidth: this.maxActionCharLength,
        style: {
          color: "brightYellow",
          bold: true,
        },
      },
    );

    this.exitAction.dividerId = this.addDivider(
      this.startRow + this.actions.length + 2,
    );
    const exitDescription = this.exitAction.description || "";
    this.exitAction.descriptionId = this.engine.createElement(exitDescription, {
      row: this.startRow + this.actions.length + 2,
      maxWidth: this.maxDescriptionCharLength,
      style: {
        dim: true,
        italic: true,
      },
    });
    this.setActiveItem(0, this.currentSelection);
  }
}
