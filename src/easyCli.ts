import { RenderEngine } from "./renderEngine/render.ts";
import { InputListener } from "#/utils/inputListener.ts";
import type { BaseView } from "#/views/baseView.ts";
import type { BasicBgColor, BasicFgColor } from "#/utils/colors.ts";
import { clearScreen, goToTop } from "#/utils/print.ts";
import { MenuView } from "../mod.ts";

interface EasyCliOptions {
  appName?: string;
  description?: string;
  theme?: Partial<Theme>;
  engine?: {
    refreshRate?: number;
  };
  mainMenu?: BaseView;
}

export type LineStyle =
  | "standard"
  | "double"
  | "thick"
  | "dotted"
  | "block"
  | "doubleSingle";
export interface Theme {
  backgroundColor: BasicBgColor;
  primaryColor: BasicFgColor;
  lineStyle: LineStyle;
}

interface EasyAbortSignal extends AbortSignal {
  reason: {
    name: string;
    message: string;
  };
}

export const defaultTheme: Theme = {
  lineStyle: "thick",
  primaryColor: "brightCyan",
  backgroundColor: "bgBlack",
};
export class EasyCli {
  appName: string;
  theme: Theme;
  private renderEngine: RenderEngine;
  private listener: InputListener;
  private views: Record<string, BaseView> = {} as Record<string, BaseView>;
  mainMenu?: BaseView;
  abortController: AbortController;
  abortSignal: EasyAbortSignal;

  private currentView?: BaseView;
  constructor(options?: EasyCliOptions) {
    this.renderEngine = new RenderEngine({
      theme: options?.theme,
      refreshRate: options?.engine?.refreshRate,
    });
    this.theme = {
      ...defaultTheme,
      ...options?.theme,
    };
    this.abortController = new AbortController();

    this.abortSignal = this.abortController.signal;
    this.listener = new InputListener({
      abortController: this.abortController,
      hideCursor: true,
    });
    this.appName = options?.appName || "Easy CLI";
    this.mainMenu = options?.mainMenu || new MenuView();
  }
  addView(view: BaseView, key: string) {
    view.init(this, this.renderEngine, this.listener, this.appName);

    this.views[key] = view;
  }

  changeView(key: string) {
    this.currentView = this.views[key];
    this.currentView.show();
  }

  stop() {
    this.renderEngine.stop();
    this.listener.stop();
  }
  run() {
    this.abortSignal.addEventListener("abort", () => {
      this.stop();
      clearScreen();
      goToTop();
      switch (this.abortSignal.reason.name) {
        case "HardInterrupt":
          console.log("Exiting due to Ctrl+C");
          break;
        case "SoftInterrupt":
          console.log("Exiting due to Escape");
          break;
        default:
          console.log("Exiting due to unknown reason");
      }
      Deno.exit();
    });
    this.listener.listen();
    this.renderEngine.run();
  }
}
