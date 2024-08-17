import { colorMe } from "@vef/color-me";
import { EasyCli } from "./mod.ts";
import { MenuView } from "./src/views/menuView.ts";
import { OutputView } from "./src/views/outputView.ts";
import { print, println, symbol } from "#/utils/print.ts";
import { getCharCount } from "#/utils/format.ts";
import { ColorMe } from "#/utils/colors.ts";
import { TaskView } from "#/views/taskView.ts";

function toHex(byte: number): string {
  return "0x" + byte.toString(16).padStart(2, "0") + " ";
}

function hexToRgb(hex: string): number[] {
  const result = [];
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    result.push(byte);
  }
  return result;
}

function colorHex(content: string, hex: string) {
  const rgb = hexToRgb(hex);
  const prefiz = "\x1b[38;2;";
  const separator = ";";
  const suffix = "m";
  const reset = "\x1b[0m";
  const color = rgb.join(";");
  return prefiz + color + suffix + content + reset;
}
function colorRgb(
  content: string,
  c: number,
) {
  const prefiz = "\x1b[38;2;";
  const separator = ";";
  const suffix = "m";
  const reset = "\x1b[0m";
  const color = c.toString();
  return prefiz + color + suffix + content + reset;
}
function colors() {
  let output = "";
  for (let i = 0; i < 256; i++) {
    output += colorRgb(symbol.cursors.block, i);
  }
  console.log(output);
}

const thing = "⅑"; //"━";

const encoded = new TextEncoder().encode(thing);
console.log(encoded);
console.log(getCharCount(thing));

for (const byte of encoded) {
  console.log(toHex(byte));
}

console.log(thing.charCodeAt(0));
if (import.meta.main) {
  // // colors();
  // const output = ColorMe.chain("rgb").content("hellos!")
  //   .color([150, 200, 0])
  //   .bold()
  //   .blink()
  //   .content("world!")
  //   .end();
  // console.log(output);
  // const output2 = ColorMe.standard().content("hellos!")
  //   .color("brightCyan")
  //   .bgColor("bgBlack")
  //   .bold()
  //   .content("world!")
  //   .end();
  // console.log(output2);
  // console.log(colorHex("Hello, World!", "61A8BC"));
  const cli = new EasyCli({
    appName: "My App",

    description: "This is a description",
    theme: {
      primaryColor: "brightCyan",
      lineStyle: "thick",
    },
    engine: {
      refreshRate: 5,
    },
  });

  const menuView = new MenuView();
  menuView.addAction({
    name: "Action 1",
    description: "This is the first action",
    action: () => {
      console.log("Action 1");
    },
  });
  cli.addView(menuView, "menu");
  const taskView = new TaskView();
  taskView.addTask("Pull Git", {
    action: ({ fail, output, success }) => {
      setTimeout(() => {
        output("Pulling Git...");
        setTimeout(() => {
          output("Git Pulled!");
          success();
        }, 3000);
      }, 3000);
    },
  });
  cli.addView(taskView, "task");
  cli.run();

  cli.changeView("task");
  taskView.start();
}
