import { colorMe } from "@eveffer/color-me";
import { camelToSnakeCase, toTitleCase } from "@eveffer/string-utils";

interface Field<K extends PropertyKey, T extends keyof FieldTypesMap> {
  key: K;
  required?: boolean;
  type: T;
  message?: string;
  defaultValue?: string;
}

interface FieldTypesMap {
  string: string;
  number: number;
  boolean: boolean;
  object: object;
  array: string[];
}

type ExtractFieldType<F extends Field<any, any>> = F extends
  Field<infer K, infer T> ? { key: K; type: T } : never;

type TypedObjectResponse<F extends Array<Field<any, any>>> = {
  [P in F[number] as ExtractFieldType<P>["key"]]:
    FieldTypesMap[ExtractFieldType<P>["type"]];
};

/**
 * TypedObjectPrompter is a class that prompts the user for input based on the fields provided.
 * Each field has a key, type, and optional message, required, and defaultValue.
 * The prompt method will return a promise that resolves to an object with the keys as the field keys and the values as the user input.
 * The returned values will be typed based on the field type specified.
 *
 * You can also provide a callback function that will be called with the resulting object after the user has entered all the data.
 */
export class TypedObjectPrompter<
  K extends PropertyKey,
  T extends keyof FieldTypesMap,
  F extends Array<Field<K, T>>,
> {
  fields: F;
  callback?: (result: TypedObjectResponse<F>) => Promise<void> | void;

  constructor(options: {
    fields: F;
    onGotData?: (result: TypedObjectResponse<F>) => Promise<void> | void;
  }) {
    this.fields = options.fields;
    this.callback = options.onGotData;
  }

  private renderAnswered(field: Field<K, T>, value: string) {
    const param = colorMe.brightCyan(
      toTitleCase(camelToSnakeCase(field.key as string)),
    );
    return `${param}: ${value}`;
  }

  private renderUnanswered(field: Field<K, T>) {
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
  private refresh(
    currentIndex: number,
    data: Record<PropertyKey, any>,
    errorMessage: string,
  ) {
    console.clear();
    for (const [index, field] of this.fields.entries()) {
      if (index > currentIndex) return;
      if (index < currentIndex) {
        console.log(this.renderAnswered(field, data[field.key]));
      } else {
        console.log(this.renderUnanswered(field));
        console.log(colorMe.red(errorMessage));
      }
    }
  }

  private validateValue<F extends Field<any, any>>(
    value: string,
    type: F["type"],
  ): { result: FieldTypesMap[ExtractFieldType<F>["type"]]; error: string } {
    let result;
    let error: string = "";
    value = value.trim();
    switch (type) {
      case "string":
        result = value;
        break;
      case "number":
        value = value.replace(/[^0-9.]/g, "");
        if (!value) {
          error = "Invalid number";
          break;
        }
        result = Number(value);
        if (isNaN(result)) {
          error = "Invalid number";
        }
        break;
      case "boolean":
        result = ["true", "1", "yes", "y"].includes(value.toLocaleLowerCase());
        break;
      case "object":
        try {
          result = JSON.parse(value);
        } catch (_e) {
          error = "Invalid JSON";
        }
        break;
      case "array":
        if (!value.includes(",")) {
          error = "Array must be comma separated";
          break;
        }
        result = value.split(",").map((v) => v.trim());
        break;
    }

    return {
      result,
      error,
    };
  }

  /**
   * Prompts the user for input based on the fields provided.
   */
  async prompt(): Promise<TypedObjectResponse<F>> {
    const data: Record<PropertyKey, any> = {};
    let errorMessage = "";

    // iterate over fields with index
    for (const [index, field] of this.fields.entries()) {
      const getUserInput =
        (): FieldTypesMap[ExtractFieldType<typeof field>["type"]] => {
          this.refresh(index, data, errorMessage);
          const message = field.message || `Enter ${String(field.key)}`;
          errorMessage = "";
          let userResponse: string | null = null;
          switch (field.required) {
            case true:
              while (!userResponse) {
                userResponse = prompt(message);
                if (!userResponse) {
                  userResponse = field.defaultValue || null;
                }
                if (!userResponse) {
                  errorMessage = "This field is required";
                  this.refresh(index, data, errorMessage);
                }
              }
              break;
            default:
              userResponse = prompt(message);
          }
          console.clear();
          if (!userResponse) {
            userResponse = field.defaultValue || "";
          }
          const { result, error } = this.validateValue<typeof field>(
            userResponse,
            field.type,
          );
          if (error) {
            errorMessage = error;
            return getUserInput();
          }
          return result;
        };

      data[field.key] = getUserInput();
    }

    if (this.callback) {
      await this.callback(data as TypedObjectResponse<F>);
    }
    return data as TypedObjectResponse<F>;
  }
}
