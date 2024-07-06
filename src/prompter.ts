import { colorMe } from "@eveffer/color-me";
import { camelToSnakeCase, toTitleCase } from "@eveffer/string-utils";
type FieldType = "string" | "number" | "boolean" | "object" | "array";

export type PrompterOption<T> = {
  message: string;
  key: T;
  default?: string;
  action: (...args: any) => void;
};

export class Prompter<T extends PropertyKey> {
  options: PrompterOption<T>[];
  result: Record<T, string> = {} as Record<T, string>;

  /**
   * Prompts the user to select an option from a list
   * @param options
   */
  constructor(options: PrompterOption<T>[]) {
    this.options = options;
  }

  prompt() {
    console.clear();
    for (const option of this.options) {
      const defaultText = option.default
        ? `(${colorMe.yellow(option.default)})`
        : "";
      const result = prompt(`${option.message}${defaultText}`);
      this.result[option.key] = result || option.default || "";
      this.printResults();
    }
    return this.result;
  }

  printResults() {
    console.clear();
    for (const key in this.result) {
      console.log(`${key}: ${this.result[key as T]}`);
    }
  }
}

export class CliPrompter {
  data: Record<string, {
    required: boolean;
    type: FieldType;
    defaultValue?: string;
  }> = {};
  callback?: (data: Record<string, any>) => Promise<void> | void;

  /**
   * Prompts the user to enter data for a list of fields
   * @param options
   */
  constructor(options: {
    data: Record<string, {
      required: boolean;
      type: FieldType;
      defaultValue?: any;
    }>;
    onGotData?: (data: Record<string, any>) => Promise<void> | void;
  }) {
    this.data = options.data;
    this.callback = options.onGotData;
  }

  async prompt() {
    console.clear();
    const renderAnswered = (key: string, value: string) => {
      const param = colorMe.brightCyan(
        toTitleCase(camelToSnakeCase(key)),
      );
      return `${param}: ${value}`;
    };
    const renderUnanswered = (
      key: string,
      required: boolean,
      type: FieldType,
    ) => {
      const param = colorMe.brightCyan(
        toTitleCase(camelToSnakeCase(key)),
      );
      const reqd = required
        ? colorMe.brightRed("Required")
        : colorMe.blue("Optional");
      const defaultValue = this.data[key].defaultValue
        ? `Default: ${this.data[key].defaultValue}`
        : "";
      const dataType = colorMe.brightMagenta(type);
      return `${param} - ${dataType}\n${reqd} ${defaultValue}\n`;
    };
    let data: Record<string, any> = {};
    const keys = Object.keys(this.data);
    keys.forEach((key, index) => {
      keys.forEach((k, i) => {
        if (i > index) return;
        if (i < index) {
          console.log(renderAnswered(k, data[k]));
        } else {
          console.log(
            renderUnanswered(k, this.data[k].required, this.data[k].type),
          );
        }
      });
      let result: string | null = null;
      if (this.data[key].required) {
        while (!result) {
          result = prompt("Enter value: ");
          if (!result) {
            result = this.data[key].defaultValue || null;
          }
        }
      } else {
        result = prompt("Enter value: ");
      }
      console.clear();
      data[key] = result || this.data[key].defaultValue || "";
    });
    if (this.callback) {
      await this.callback(data);
    }
    return data;
  }
}
