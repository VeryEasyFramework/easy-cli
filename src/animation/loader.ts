import { Animation } from "#/animation/animate.ts";
import { symbol } from "#/utils/print.ts";

export type LoaderStyle = keyof typeof Loader.styles;
export class Loader extends Animation {
  static easing = {
    bezier: [0.4, 0.0, 0.2, 1],
    snapEase: [0.75, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    linear: [0, 0, 1, 1],
  } as Record<string, [number, number, number, number]>;
  static styles = {
    loop: {
      frames: [
        "⠋",
        "⠙",
        "⠹",
        "⠸",
        "⠼",
        "⠴",
        "⠦",
        "⠧",
        "⠇",
        "⠏",
      ],
    },

    dots: {
      frames: [
        "..........",
        ":.........",
        ".:........",
        "..:.......",
        "...:......",
        "....:.....",
        ".....:....",
        "......:...",
        ".......:..",
        "........:.",
        ".........:",
        "..........",
      ],
    },
    lineBounce: {
      frames: [
        ".. .  .   .    .",
        "….. .  .   .    ",
        "↘….. .  .   .   ",
        "═↘….. .  .   .  ",
        "↗═↘….. .  .   . ",
        "…↗═↘….. .  .   .",
        ".…↗═↘….. .  .   ",
        "..…↗═↘….. .  .  ",
        " ..…↗═↘….. .  . ",
        ". ..…↗═↘….. .  .",
        " . ..…↗═↘….. .  ",
        "  . ..…↗═↘….. . ",
        ".  . ..…↗═↘….. .",
        " .  . ..…↗═↘….. ",
        "  .  . ..…↗═↘…..",
        "   .  . ..…↗═↘….",
        ".   .  . ..…↗═↘…",
        " .   .  . ..…↗═↘",
        "  .   .  . ..…↗═",
        "   .   .  . ..…↗",
        "    .   .  . ..…",
        ".    .   .  . ..",
      ],
    },
    moon: {
      frames: [
        "🌑",
        "🌒",
        "🌓",
        "🌔",
        "🌕",
        "🌖",
        "🌗",
        "🌘",
        "🌑",
      ],
    },
    arrows: {
      frames: [
        "←",
        "↖",
        "↑",
        "↗",
        "→",
        "↘",
        "↓",
        "↙",
      ],
    },
    forward: {
      frames: [
        symbol.box.thick.horizontalDown,
        symbol.box.thick.verticalLeft,
        symbol.box.thick.horizontalUp,
        symbol.box.thick.verticalRight,
      ],
    },
  };
  constructor(options?: {
    style?: LoaderStyle;
    customFrames?: {
      base: string;
      notch: string;
      width: number;
    };
    easing?:
      | "bezier"
      | "snapEase"
      | "easeIn"
      | "easeOut"
      | "easeInOut"
      | "linear";
    type?: "loop" | "bounce" | "reverse";
    speed?: number;
  }) {
    const style = options?.style || "lineBounce";
    const type = options?.type || "loop";
    const easing = options?.easing || "bezier";
    const speed = options?.speed || 1;
    let frames = Loader.styles[style].frames;
    if (options?.customFrames) {
      frames = [];
      const { base, notch, width } = options.customFrames;
      for (let i = 0; i < width; i++) {
        frames.push(base.repeat(i) + notch + base.repeat(width - i - 1));
      }
    }
    super({
      duration: 1000 / speed,
      frames: frames,
      type: type,
      bezier: Loader.easing[easing],
      easing: "bezier",
    });
  }
}
