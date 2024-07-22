const keyMap = {
  up: "\x1b[A",
  down: "\x1b[B",
  left: "\x1b[D",
  right: "\x1b[C",
  enter: "\r",
  escape: "\x1b",
  backspace: "\x7f",
  ctrlC: "\x03",
  block: "\u2588",
};

function hideCursor() {
  console.log("\x1B[?25l");
}

function showCursor() {
  console.log("\x1B[?25h");
}
async function navigateList(options: {
  currentIndex: number;
  maxOptions: number | (() => number);
  onPrompt: () => Promise<void> | void;
  onNavigate: (updatedIndex: number) => void;
  onChar?: (char: string) => void;
  validateSelection?: () => boolean;
}) {
  const { onPrompt, onNavigate } = options;
  let { currentIndex } = options;
  const validateSelection = options.validateSelection || (() => true);
  const maxOptions = typeof options.maxOptions === "function"
    ? options.maxOptions()
    : options.maxOptions;
  hideCursor();
  Deno.stdin.setRaw(true);
  const input = Deno.stdin.readable.getReader();
  const res = await input.read();
  const key = res.value ? new TextDecoder().decode(res.value) : "";
  switch (key) {
    case keyMap.up:
      currentIndex -= 1;
      if (currentIndex < 0) {
        currentIndex = maxOptions - 1;
      }
      onNavigate(currentIndex);
      input.releaseLock();
      await onPrompt();
      break;
    case keyMap.down:
      currentIndex += 1;
      if (currentIndex >= maxOptions) {
        currentIndex = 0;
      }
      onNavigate(currentIndex);
      input.releaseLock();
      await onPrompt();
      break;
    case keyMap.enter:
      if (!validateSelection()) {
        input.releaseLock();
        await onPrompt();
        break;
      }
      break;
    case keyMap.ctrlC:
      Deno.exit();
      break;
    default:
      if (options.onChar) {
        options.onChar(key);
      }
      input.releaseLock();
      await onPrompt();
      break;
  }
  console.clear();
  input.releaseLock();
  Deno.stdin.setRaw(false);

  showCursor();
}

export function asyncPause(duration = 100) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export async function printTime(prefix: () => string) {
  while (true) {
    const date = new Date();
    const time = date.toLocaleTimeString();
    console.clear();
    if (prefix) {
      console.log(prefix());
    }
    console.log(time);
    await asyncPause(10);
  }
}

export function listenForInput(callback: (key: string) => void) {
  hideCursor();
  Deno.stdin.setRaw(true);
  const input = Deno.stdin.readable.getReader();
  input.read().then(async function processInput({ value, done }) {
    if (done) {
      return;
    }
    const key = value ? new TextDecoder().decode(value) : "";
    if (key === keyMap.ctrlC) {
      showCursor();
      Deno.exit();
    }
    callback(key);
    input.read().then(processInput);
  });
}

export { hideCursor, keyMap, navigateList, showCursor };
