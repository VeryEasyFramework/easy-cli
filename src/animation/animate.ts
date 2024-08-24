export class Animation {
  duration: number;
  previousTime: number;
  frames?: string[];
  current: number;
  type: "loop" | "bounce" | "reverse" | "once" = "loop";
  bezier: [number, number, number, number];
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "bezier";
  direction: "forward" | "backward" = "forward";
  startTime: number = 0;

  maxFrames: number;
  static easingCurves = {
    bezier: [0.4, 0.0, 0.2, 1],
    snapEase: [0.75, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    smooth: [0.30, 0, 0.05, 1],
    linear: [0, 0, 1, 1],
  } as Record<
    | "bezier"
    | "snapEase"
    | "easeIn"
    | "easeOut"
    | "easeInOut"
    | "linear"
    | "smooth",
    [number, number, number, number]
  >;
  constructor(
    options: {
      duration: number;
      frames?: string[];
      maxFrames?: number;
      type?: "loop" | "bounce" | "reverse" | "once";
      bezier?: [number, number, number, number];
      easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "bezier";
    },
  ) {
    this.duration = options.duration;
    this.previousTime = 0;
    this.direction = "forward";
    this.bezier = options.bezier || [0, 0, 1, 1];
    this.maxFrames = options.maxFrames || options.frames?.length || 0;
    this.frames = options.frames;
    this.current = 0;
    this.easing = options.easing || "linear";
    this.type = options.type || "loop";
    if (this.type === "bounce" && this.frames) {
      const reversed = this.frames.slice(0, -1).reverse();
      this.frames = [...this.frames, ...reversed];
    }
  }

  calculateFrame(elapsedTime: number) {
    if (this.easing === "bezier") {
      return this.bezierEasing(elapsedTime);
    }
    return elapsedTime / this.duration;
  }

  bezierEasing(elapsedTime: number) {
    const [x1, y1, x2, y2] = this.bezier;
    const t = elapsedTime / this.duration;
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;

    // Use Newton's method to find the t value for the given x
    const epsilon = 1e-6; // Precision
    let x = t;
    let t2, t3, xCalc, dx;
    for (let i = 0; i < 10; i++) { // Limit iterations to prevent infinite loop
      t2 = x * x;
      t3 = t2 * x;
      xCalc = ax * t3 + bx * t2 + cx * x;
      dx = 3 * ax * t2 + 2 * bx * x + cx;
      if (Math.abs(xCalc - t) < epsilon) break;
      x -= (xCalc - t) / dx;
    }

    // Calculate the y value using the found t
    t2 = x * x;
    t3 = t2 * x;
    return ay * t3 + by * t2 + cy * x;
  }
  time = 0;
  private _done = false;
  animate(elapsedTime: number) {
    if (this.startTime === 0) {
      this.playForward(elapsedTime);
    }
    this.time = elapsedTime - this.startTime;

    // switch (this.type) {
    //   case "bounce": {
    //     time = time % (this.duration * 2);
    //     if (time > this.duration) {
    //       time = this.duration - (time - this.duration);
    //     }
    //     break;
    //   }
    //   case "reverse": {
    //     time = time % (this.duration * 2);

    //     if (time > this.duration) {
    //       time = this.duration - (time - this.duration);
    //     }
    //     break;
    //   }
    //   case "loop": {
    //     time = time % this.duration;
    //     break;
    //   }
    // }
    if (this.time > this.duration) {
      if (this.type === "once") {
        this._done = true;
        return this.current;
      }
      this.startTime = elapsedTime;
      this.time = 0;
      // this.direction = this.direction === "forward" ? "backward" : "forward";
    }
    const progress = this.calculateFrame(this.time);
    const frameCount = this.maxFrames;
    const frame = Math.floor(progress * frameCount);
    if (this.direction === "forward") {
      this.current = frame % frameCount;
    } else {
      this.current = frameCount - (frame % frameCount) - 1;
    }
  }
  playForward(elapsedTime: number) {
    this.startTime = elapsedTime;
    this.direction = "forward";
  }

  get done() {
    return this.current >= this.maxFrames - 1 || this._done;
  }
  get frame() {
    return this.frames ? [this.current] : this.current;
  }
}
