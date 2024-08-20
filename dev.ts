import { colorMe } from "@vef/color-me";
import { EasyCli } from "./mod.ts";
import { MenuView } from "./src/views/menuView.ts";
import { OutputView } from "./src/views/outputView.ts";
import { print, printLines, println, symbol } from "#/utils/print.ts";
import { getCharCount, getConsoleWidth } from "#/utils/format.ts";
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
  // const cli = new EasyCli({
  //   appName: "My App",

  //   description: "This is a description",
  //   theme: {
  //     primaryColor: "brightCyan",
  //     lineStyle: "thick",
  //   },
  //   engine: {
  //     refreshRate: 5,
  //   },
  // });

  // const menuView = new MenuView();
  // menuView.addAction({
  //   name: "Action 1",
  //   description: "This is the first action",
  //   action: () => {
  //     console.log("Action 1");
  //   },
  // });
  // cli.addView(menuView, "menu");
  // const taskView = new TaskView();
  // taskView.addTask("Pull Git", {
  //   action: ({ fail, output, success }) => {
  //     setTimeout(() => {
  //       output("Pulling Git...");
  //       setTimeout(() => {
  //         output("Git Pulled!");
  //         success();
  //       }, 3000);
  //     }, 3000);
  //   },
  //   style: "loop",
  // });
  // cli.addView(taskView, "task");
  // cli.run();

  // cli.changeView("task");
  // taskView.start();

  // console.log(toBytes(8529));
  // console.log(toBytes(8529));
  const stuff = symbolRange(0x0080, 0x036F);
  const arrows = symbolRange(0x2190, 0x21FF);
  const numberForms = symbolRange(0x2150, 0x218F);
  const mathOperators = symbolRange(0x2200, 0x22FF);
  const miscTechnical = symbolRange(0x2300, 0x23FF);
  const miscSymbols = symbolRange(0x2600, 0x26FF);
  const enclosed = symbolRange(0x2460, 0x24FF);
  const dingbats = symbolRange(0x2700, 0x27BF);
  const geometricShapes = symbolRange(0x25A0, 0x25FF);
  const boxDrawing = symbolRange(0x2500, 0x257F);

  const blockElements = symbolRange(0x2580, 0x259F);
  const brailePatterns = symbolRange(0x2800, 0x28FF);
  const supplementalArrows = symbolRange(0x2B00, 0x2BFF);
  const supplementalArrowsB = symbolRange(0x2900, 0x297F);
  const miscellaneousSymbolsAndArrows = symbolRange(0x2B00, 0x2BFF);
  const emoji = symbolRange(0x1F600, 0x1F64F);

  // console.log("Arrows");
  // console.log(arrows);
  // console.log("Number Forms");
  // console.log(numberForms);
  // console.log("Math Operators");
  // console.log(mathOperators);
  // console.log("Misc Technical");
  // console.log(miscTechnical);
  // console.log("Misc Symbols");
  // console.log(miscSymbols);
  // console.log("Enclosed");
  // console.log(enclosed);
  // console.log("Dingbats");
  // console.log(dingbats);
  // console.log("Geometric Shapes");
  // console.log(geometricShapes);
  // console.log("Box Drawing");
  // console.log(boxDrawing);
  // console.log("Block Elements");
  // console.log(blockElements);
  // console.log("Braile Patterns");
  // console.log(brailePatterns);
  // console.log("Supplemental Arrows");
  // console.log(supplementalArrows);
  // console.log("Supplemental Arrows B");
  // console.log(supplementalArrowsB);
  // console.log("Miscellaneous Symbols And Arrows");
  // console.log(miscellaneousSymbolsAndArrows);
  // console.log("Emoji");
  // console.log(emoji);
  // console.log("All");
  const color = (rgb: [number, number, number]) => {
    const thing = ColorMe.standard("rgb").content("█").color(rgb).end();
    print(thing);
  };
  let out = "";
  for (let i = 0; i < 256; i++) {
    color([i, 0, 0]);
  }
  for (let i = 0; i < 256; i++) {
    color([255, i, 0]);
  }

  for (let i = 255; i > 0; i--) {
    color([i, 255, 0]);
  }

  for (let i = 0; i < 256; i++) {
    color([0, 255, i]);
  }
  for (let i = 255; i > 0; i--) {
    color([0, i, 255]);
  }

  for (let i = 0; i < 256; i++) {
    color([i, 0, 255]);
  }

  for (let i = 0; i < 256; i++) {
    color([255, i, 255]);
  }
}

function printSymbolRange(start: number, end: number) {
  for (let i = start; i <= end; i++) {
    const hex = toBytes(i);
    const char = toChar(i);
    const bytes = hex.match(/.{1,2}/g);
    const output = `${hex} ${char}`;
    console.log(output);
  }
}
function symbolRange(start: number, end: number) {
  const symbols = [];
  let output = "";
  for (let i = start; i <= end; i++) {
    const hex = toBytes(i);
    const char = toChar(i);
    output += char;
    const bytes = hex.match(/.{1,2}/g);

    symbols.push({
      code: i,
      hex,
      char,
    });
  }
  return output;
}

function toChar(code: number): string {
  // console.log(code);
  return String.fromCodePoint(code);
}

function toBytes(code: number): string {
  const bytes = [];
  let codePoint = code;
  while (codePoint > 0) {
    const byte = codePoint & 0xff;
    bytes.unshift(byte);
    codePoint >>= 8;
  }
  return bytes.map((byte) => toHex(byte)).join("");
}
