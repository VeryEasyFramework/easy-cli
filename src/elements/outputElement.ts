import { BaseElement } from "#/elements/baseElement.ts";
import { box } from "#/utils/box.ts";
import { Animation } from "#/animation/animate.ts";
export class OutputElement extends BaseElement {
  addContent(content: string, replace?: boolean): void {
    if (replace) {
      this.contentRows[this.contentRows.length - 1] = content;
      return;
    }
    this.contentRows.push(content);
  }
  contentRows: string[] = [];

  maxScroll: number = 20;
  setup(): void {
    this.message = "Scrolling";
    this.listener?.on("down", () => {
      this.message = "Scrolling down";
      this.scrollDown();
    });

    this.listener?.on("up", () => {
      this.scrollUp();
    });
  }
  scroll: number = 0;
  visibleRows: {
    start: number;
    end: number;
  } = {
    start: 0,
    end: 0,
  };
  get contentHeight(): number {
    return this.contentRows.length;
  }

  direction: "up" | "down" = "up";

  scrolling: boolean = false;
  scrollDown() {
    if (this.scrolling) return;
    this.resetScroll();
    this.direction = "down";
  }
  resetScroll(): void {
    this.scrolling = true;
    this.animate.current = 0;
    this.animate.startTime = 0;
  }
  scrollUp(): void {
    if (this.scrolling) return;

    this.resetScroll();
    this.direction = "up";
  }
  message: string = "sdf";
  duration: number = 1000;
  offset: number = 0;
  scrollSpeed: number = 1;
  getSpeed(multiplier: number): number {
    return 1 * multiplier;
  }
  startTime: number = 0;

  setScroll(): void {
    if (this.direction === "down") {
      if (
        this.scroll + this.animate.current >= this.contentHeight - this.height
      ) {
        this.scroll = this.contentHeight - this.height;
        this.offset += this.animate.current;
        this.scrolling = false;
        return;
      }
      this.scroll = this.offset + this.animate.current;
    }
    if (this.direction === "up") {
      if (this.scroll - this.animate.current < 0) {
        this.scroll = 0;
        this.offset = 0;
        this.scrolling = false;
        return;
      }
      this.scroll = this.offset - this.animate.current;
    }
  }
  handleScroll() {
    if (
      this.animate.current >= this.animate.maxFrames - 1
    ) {
      this.scrolling = false;
      // this.scroll = this.offset;
      if (this.direction === "down") {
        this.offset += this.animate.current;
      }
      if (this.direction === "up") {
        this.offset -= this.animate.current;
      }
      // this.offset += this.animate.current;
      return;
      // this.scrollDown();
    }
    this.setScroll();
  }
  elapsedTime: number = 0;

  animate: Animation = new Animation({
    duration: this.duration,
    easing: "bezier",

    type: "once",
    bezier: Animation.easingCurves.smooth,
    maxFrames: this.maxScroll,
  });
  hasPlayed: boolean = false;
  render(elapsedTime: number, diff: number): string[] {
    this.elapsedTime = elapsedTime;
    this.animate.maxFrames = this.height - 1;
    if (this.scrolling) {
      this.animate.animate(elapsedTime);
      this.handleScroll();
    }

    // if (!this.hasPlayed) {
    //   this.hasPlayed = true;
    //   setTimeout(() => {
    //     this.scrollDown();
    //   }, 3000);
    // }
    this.startTime += diff;
    this.scrollSpeed = (diff / 1000) + 1;
    let rows: string[] = [];

    if (this.startTime > this.duration) {
      this.startTime = 0;
      this.message = "Scrolling";
    }

    rows = this.contentRows.slice(this.scroll, this.scroll + this.height);

    const content = this.drawBox(rows, {
      width: this.width,
      height: this.height,
      justify: "start",
    });

    return content;
  }
}
