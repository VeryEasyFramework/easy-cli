import type { CliMenu } from "./cliMenu.ts";

export interface ActionMenuItem {
  title: string;
  description?: string;
  action?: () => Promise<void | Record<string, any>> | void;
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
  action?: () => Promise<void | Record<string, any>> | void;
  returnWhenDone?: boolean;
  waitAfterAction?: boolean;
  subMenu?: CliMenu;
}
