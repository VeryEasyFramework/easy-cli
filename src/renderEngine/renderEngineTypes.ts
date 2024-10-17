import type { StyleOptions } from "#/utils/colors.ts";

export type HorizontalAlignment =
  | "start"
  | "end"
  | "center"
  | "start-edge"
  | "end-edge";
export type Justify =
  | "start"
  | "end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";

export type ElementID = string;

export type ElementContent = string | (() => string | string[]) | string[];
export interface CreateElementOptions {
  maxWidth?: number;
  maxContent?: boolean;
  minWidth?: number;
  row?: number;
  style?: StyleOptions | (() => StyleOptions);
  raw?: boolean;
  align?: HorizontalAlignment;
}
