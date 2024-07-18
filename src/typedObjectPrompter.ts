import { colorMe } from "@eveffer/color-me";
import { camelToSnakeCase, toTitleCase } from "@eveffer/string-utils";
type FieldType = "string" | "number" | "boolean" | "object" | "array";

interface Field<K extends PropertyKey> {
  key: K;
  required?: boolean;
  type: FieldType;
  message?: string;
  defaultValue?: string;
}

type FieldMap<K extends PropertyKey> = Record<K, Field<K>>;

type FieldMapValues<K extends PropertyKey> = {
  [key in K]: Field<K>;
};

type ResponseMap<F extends Array<Field<any>>> = {
  [key in F[number]["key"]]: string;
};

/**
 * TypedObjectPrompter is a CLI prompter that prompts the user to enter values for a typed object.
 * The object is defined by a Record of keys and their types.
 */
export class TypedObjectPrompter<
  K extends PropertyKey,
  F extends Array<Field<K>>,
> {
  fields: F;
  callback?: (data: Record<string, any>) => Promise<void> | void;

  constructor(options: {
    fields: F;
    onGotData?: (data: Record<string, any>) => Promise<void> | void;
  }) {
    this.fields = options.fields;
    this.callback = options.onGotData;
  }

  private renderAnswered(field: Field<K>, value: string) {
    const param = colorMe.brightCyan(
      toTitleCase(camelToSnakeCase(field.key as string)),
    );
    return `${param}: ${value}`;
  }

  private renderUnanswered(field: Field<K>) {
    const param = colorMe.brightCyan(
      toTitleCase(camelToSnakeCase(field.key as string)),
    );
    const reqd = field.required
      ? colorMe.brightRed("Required")
      : colorMe.blue("Optional");
    const defaultValue = field.defaultValue
      ? `Default: ${field.defaultValue}`
      : "";
    const dataType = colorMe.brightMagenta(field.type);
    return `${param} - ${dataType}\n${reqd} ${defaultValue}\n`;
  }
  private refresh(currentIndex: number, data: ResponseMap<F>) {
    console.clear();
    for (const [index, field] of this.fields.entries()) {
      if (index > currentIndex) return;
      if (index < currentIndex) {
        console.log(this.renderAnswered(field, data[field.key]));
      } else {
        console.log(this.renderUnanswered(field));
      }
    }
  }
  async prompt() {
    let data: ResponseMap<F> = {} as ResponseMap<F>;

    // iterate over fields with index
    for (const [index, field] of this.fields.entries()) {
      this.refresh(index, data);
      let result: string | null = null;
      switch (field.required) {
        case true:
          while (!result) {
            result = prompt("Enter value: ");
            if (!result) {
              result = field.defaultValue || null;
            }
          }
          break;
        case false:
          result = prompt("Enter value: ");
          break;
      }
      console.clear();
      data[field.key] = result || field.defaultValue || "";
    }

    if (this.callback) {
      await this.callback(data);
    }
    return data;
  }
}
