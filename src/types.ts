import type { CliMenu } from "./cliMenu.ts";

export type Action = () =>
  | (Promise<void | Record<string, any> | string | number>)
  | (void | Record<string, any> | string | number);
export interface ActionMenuItem {
  title: string;
  description?: string;
  action?: Action;
  returnWhenDone?: boolean;
  waitAfterAction?: boolean;
}

export interface SubMenuItem {
  title: string;
  description?: string;
  subMenu: CliMenu;
}

export interface MenuItem {
  title: string;
  description?: string;
  action?: Action;
  returnWhenDone?: boolean;
  waitAfterAction?: boolean;
  subMenu?: CliMenu;
}
