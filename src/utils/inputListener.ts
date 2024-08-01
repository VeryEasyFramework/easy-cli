import { hideCursor, showCursor } from "../cliUtils.ts";
import { keyMap, type KeyStroke } from "./keyMap.ts";
import { println } from "./print.ts";

export class InputListener {
  hideCursor: boolean;
  decoder: TextDecoder = new TextDecoder();

  keyActions: Record<string, Array<() => void>> = {};
  charActions: Array<(char: string) => void> = [];
  lineActions: Array<(line: string) => void> = [];
  doneActions: Array<() => void> = [];

  lineBuffer: string = "";
  done: boolean = false;
  input: ReadableStreamDefaultReader<Uint8Array> | null = null;

  decode(data: Uint8Array): string {
    return this.decoder.decode(data);
  }

  constructor(hideCursor = true) {
    this.hideCursor = hideCursor;
    this.setUpListeners();
  }

  stop() {
    if (!this.input) {
      return;
    }

    this.input.releaseLock();
    this.done = true;
    this.doneActions.forEach((action) => {
      action();
    });
  }
  setUpListeners(): void {
    this.on("ctrlC", () => {
      showCursor();
      Deno.exit();
    });

    this.on("enter", () => {
      this.lineActions.forEach((action) => {
        action(this.lineBuffer);
      });
      this.lineBuffer = "";
    });

    this.on("backspace", () => {
      this.lineBuffer = this.lineBuffer.slice(0, -1);
    });

    this.onChar((char) => {
      this.lineBuffer += char;
    });
  }
  on(key: KeyStroke, action: () => void) {
    if (!this.keyActions[keyMap[key]]) {
      this.keyActions[keyMap[key]] = [];
    }
    this.keyActions[keyMap[key]].push(action);
  }
  onChar(action: (char: string) => void) {
    this.charActions.push(action);
  }
  onLine(action: (line: string) => void) {
    this.lineActions.push(action);
  }
  onDone(action: () => void) {
    this.doneActions.push(action);
  }

  private async readInput() {
    if (!this.input) {
      return;
    }
    if (this.done) {
      return;
    }

    const { value, done } = await this.input.read();
    if (done) {
      return;
    }
    const key = this.decode(value);

    if (key in this.keyActions) {
      for (const action of this.keyActions[key]) {
        action();
      }
    }

    // make sure we only call char actions for printable characters
    if (
      key.length === 1 && key.charCodeAt(0) >= 32 && key.charCodeAt(0) <= 126
    ) {
      this.charActions.forEach((action) => {
        action(key);
      });
    }

    await this.readInput();
  }

  async listen() {
    if (this.hideCursor) {
      hideCursor();
    }
    try {
      Deno.stdin.setRaw(true);
      this.input = Deno.stdin.readable.getReader();
      await this.readInput();
    } catch (e) {
      println("Error reading input", "brightRed");
      console.error(e);
    }
  }
}

export function listenerDemo() {
  const listener = new InputListener();
  const listener2 = new InputListener();
  listener.onLine((line) => {
    println(line, "brightBlue");
  });

  listener2.onLine((line) => {
    println(line, "brightYellow");
  });
  listener.on("down", () => {
    listener.stop();
  });

  listener.listen();

  console.log("Listening for input...");
}
