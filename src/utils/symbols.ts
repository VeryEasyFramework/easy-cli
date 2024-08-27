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

function symbolRange(start: number, end: number) {
  const symbols = [];
  let output = "";
  for (let i = start; i <= end; i++) {
    const char = toChar(i);
    output += char;

    symbols.push({
      code: i,
      char,
    });
  }
  return output;
}
function toChar(code: number): string {
  // console.log(code);
  return String.fromCodePoint(code);
}
