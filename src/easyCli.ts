import { RenderEngine } from "./renderEngine/render.ts";
import { InputListener } from "#/utils/inputListener.ts";
import type { BaseView } from "#/views/baseView.ts";
import type { BasicBgColor, BasicFgColor } from "#/utils/colors.ts";

interface EasyCliOptions {
  appName?: string;
  description?: string;
  theme?: Partial<Theme>;
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

  private currentView?: BaseView;
  constructor(options?: EasyCliOptions) {
    this.renderEngine = new RenderEngine({
      theme: options?.theme,
    });
    this.theme = {
      ...defaultTheme,
      ...options?.theme,
    };
    this.listener = new InputListener();
    this.appName = options?.appName || "Easy CLI";
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
    this.listener.listen();
    this.renderEngine.run();
  }
}
