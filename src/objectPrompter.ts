import { colorMe } from "@eveffer/color-me";

export type FieldKeyOption<T> = {
  message: string;
  key: T;
  default?: string;
  // action: (...args: any) => void;
};

export class ObjectPrompter<T extends PropertyKey> {
  keys: FieldKeyOption<T>[];
  result: Record<T, string> = {} as Record<T, string>;

  constructor(keys: FieldKeyOption<T>[]) {
    this.keys = keys;
  }

  prompt(): Record<T, string> {
    console.clear();
    for (const key of this.keys) {
      const defaultText = key.default ? `(${colorMe.yellow(key.default)})` : "";
      const result = prompt(`${key.message}${defaultText}`);
      this.result[key.key] = result || key.default || "";
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
