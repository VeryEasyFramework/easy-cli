import { hideCursor, showCursor } from "../cliUtils.ts";
import { Char, keyMap, type KeyStroke } from "./keyMap.ts";
import { println } from "./print.ts";

export class InputListener {
  hideCursor: boolean = true;
  decoder: TextDecoder = new TextDecoder();
  abortController: AbortController;

  keyActions: Record<string, Array<() => void>> = {};
  charActions: Array<(char: Char) => void> = [];
  lineActions: Array<(line: string) => void> = [];
  doneActions: Array<() => void> = [];

  lineBuffer: string = "";
  done: boolean = false;
  input: ReadableStreamDefaultReader<Uint8Array> | null = null;

  decode(data: Uint8Array): string {
    return this.decoder.decode(data);
  }

  constructor(options?: {
    hideCursor?: boolean;
    abortController?: AbortController;
  }) {
    if (options?.hideCursor === false) {
      this.hideCursor = false;
    }
    this.abortController = options?.abortController || new AbortController();
    this.setUpListeners();
  }

  stop() {
    if (!this.input) {
      return;
    }

    this.input.releaseLock();
    showCursor();
    this.done = true;
    this.doneActions.forEach((action) => {
      action();
    });
  }
  setUpListeners(): void {
    this.on("ctrlC", () => {
      this.abortController.abort({
        name: "HardInterrupt",
        message: "User pressed Ctrl+C to exit the program",
      });
    });
    this.on("escape", () => {
      this.abortController.abort(
        {
          name: "SoftInterrupt",
          message: "User pressed escape to exit the program",
        },
      );
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

  private clearListeners() {
    this.keyActions = {};
    this.charActions = [];
    this.lineActions = [];
    this.doneActions = [];
  }
  reset() {
    this.lineBuffer = "";
    this.done = false;
    this.clearListeners();
    this.setUpListeners();
  }
  on(key: KeyStroke, action: () => void) {
    if (!this.keyActions[keyMap[key]]) {
      this.keyActions[keyMap[key]] = [];
    }
    this.keyActions[keyMap[key]].push(action);
  }
  onChar(action: (char: Char) => void) {
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
        action(key as Char);
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
      this.setUpListeners();
      await this.readInput();
    } catch (e) {
      println("Error reading input", "brightRed");
      console.error(e);
    }
  }
}
