import { BaseElement } from "#/elements/baseElement.ts";
import { Animation } from "#/animation/animate.ts";
import { ColorMe } from "../../mod.ts";
import { symbol, symbols } from "#/utils/print.ts";
import { ColorRGB } from "#/utils/colors.ts";

export class AnimationElement extends BaseElement {
  animation!: Animation;

  duration: number = 1500;

  pixelCount: number = 100;

  frames: Array<Array<string>> = [];
  fps: number = 60;

  buildFrames() {
    const frameCount = this.duration / 1000 * this.fps;
    const info = {
      width: this.engine.currentWidth - 10,
      height: this.engine.contentHeight - this.engine.contentPaddingTop -
        this.engine.contentPadding,
    };
    const { up, upRight, right, downRight, down, downLeft, left, upLeft } =
      symbol.arrows;

    const symbols = [
      "▓",
    ];
    // const repeat = 10;
    // for (let i = 0; i < repeat; i++) {
    //   symbols.push(this.color("█", i, repeat));
    // }
    this.frames = this.generateFrames(
      symbols,
      info.height,
      info.width,
      frameCount,
      frameCount / 2,
    );
    this.frames[0] = [];
  }
  rgbFromHsl(h: number, s: number, l: number): ColorRGB {
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255),
    ];
  }
  color(content: string, phase: number, max: number) {
    const h = phase / max;
    const s = 0.5;
    const l = 0.5;
    const [r, g, b] = this.rgbFromHsl(h, s, l);
    const rgb: ColorRGB = [r, g, b];
    return ColorMe.chain("rgb").content(content)
      .bgColor(this.theme.backgroundColor)
      .color(rgb).end(true);
  }
  generateFrames(
    symbols: string[],
    rows: number,
    cols: number,
    totalFrames: number,
    clearFrames: number,
  ) {
    const frames = [];
    const centerX = Math.floor(rows / 2);
    const centerY = Math.floor(cols / 2);
    const symbolCount = symbols.length;

    // Generate ripple frames
    for (let frame = 0; frame < totalFrames; frame++) {
      const grid = Array.from(
        { length: rows },
        () => " ".repeat(cols).split(""),
      );
      const radius = (frame / totalFrames) * Math.max(rows, cols);
      const phaseShift = frame % symbolCount;

      for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
          const distance = Math.sqrt(
            Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2),
          );
          const symbolIndex = (Math.floor(distance) + phaseShift) % symbolCount;

          if (distance <= radius) {
            grid[x][y] = this.color(symbols[symbolIndex], frame, totalFrames);
          }
        }
      }

      frames.push(grid.map((row) => row.join("")));
    }

    // Generate clearing frames
    for (let frame = 0; frame < clearFrames; frame++) {
      const grid = Array.from(
        { length: rows },
        () => " ".repeat(cols).split(""),
      );
      const radius = (frame / clearFrames) * Math.max(rows, cols);

      for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
          const distance = Math.sqrt(
            Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2),
          );

          // Clear the grid based on the distance from the center
          if (distance > radius) {
            grid[x][y] = symbols[
              (Math.floor(distance) + (totalFrames % symbolCount)) %
              symbolCount
            ];
          }
        }
      }

      frames.push(grid.map((row) => row.join("")));
    }

    return frames;
  }

  doneAction: () => void = () => {};
  setup(): void {
    this.pixelCount = this.engine.currentWidth * this.engine.contentHeight;
    this.buildFrames();
    this.animation = new Animation({
      duration: this.duration,
      type: "once",
      easing: "bezier",
      bezier: Animation.easingCurves.snapEase,
      maxFrames: this.frames.length,
    });
  }
  onDone(callback: () => Promise<void> | void) {
    this.doneAction = callback;
  }

  getFrameForTime(time: number) {
    const fps = this.fps;
    const frame = Math.floor((time / 1000) * fps);
    return frame;
  }

  startTime = 0;

  render(elapsedTime: number, diff: number): string | string[] {
    if (this.startTime === 0) {
      this.startTime = elapsedTime;
    }
    // const frameNumber = this.getFrameForTime(elapsedTime - this.startTime);
    this.animation.animate(elapsedTime);
    const frameNumber = this.animation.current;
    if (frameNumber >= this.frames.length - 1) {
      this.doneAction();
      return this.frames[this.frames.length - 1];
    }
    return this.frames[frameNumber];
  }
}
