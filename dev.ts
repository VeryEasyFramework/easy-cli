import { InputListener } from "./src/utils/inputListener.ts";
import { RenderEngine } from "./src/utils/render.ts";
import { BaseView } from "#/views/baseView.ts";
import { MenuView } from "./src/views/menuView.ts";
import { OutputView } from "./src/views/outputView.ts";

interface EasyCliOptions {
  appName?: string;
  description?: string;
}
class EasyCli<V extends PropertyKey = PropertyKey> {
  appName: string;
  private renderEngine: RenderEngine;
  private listener: InputListener;
  private views: Record<V, BaseView> = {} as Record<V, BaseView>;

  private currentView?: BaseView;
  constructor(options?: EasyCliOptions) {
    this.renderEngine = new RenderEngine();
    this.listener = new InputListener();
    this.appName = options?.appName || "Easy CLI";
  }
  addView(view: BaseView, key: V) {
    view.init(this.renderEngine, this.listener);
    this.views[key] = view;
  }

  changeView(key: V) {
    this.currentView = this.views[key];
    this.currentView.show();
  }

  run() {
    this.listener.listen();
    this.renderEngine.run();
  }
}

if (import.meta.main) {
  const cli = new EasyCli();

  const menuView = new MenuView();
  const outputView = new OutputView();
  cli.addView(menuView, "menu");
  cli.addView(outputView, "output");

  cli.run();

  cli.changeView("menu");
  setTimeout(() => {
    cli.changeView("output");
  }, 2000);

  setTimeout(() => {
    cli.changeView("menu");
  }, 4000);
}
