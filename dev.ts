import { CliPrompter, EasyCli, OptionSelector } from "./mod.ts";
import { CliMenu } from "./src/cliMenu.ts";
import { Prompter } from "./src/prompter.ts";
import { createWizard } from "./src/wizard.ts";

function easyCliDemo() {
  const easyCli = new EasyCli("My CLI App");

  easyCli.addMenuItem({
    title: "Sample Menu Item",
    description: "This is a sample menu item",
    waitAfterAction: true,
  });
  easyCli.addSubMenu({
    title: "Sample Sub Menu",
    description: "This is a sample sub menu",
    subMenu: new CliMenu("Sample Sub Menu"),
  });
  easyCli.run();
}
function prompterDemo() {
  const prompter = new Prompter(
    [
      {
        key: "name",
        message: "What is your name?",
      },
      {
        key: "age",
        message: "How old are you?",
      },
      {
        key: "email",
        message: "What is your email?",
        default: "example@email.com",
      },
    ],
  );
  const result = prompter.prompt();
  console.log({ result });
}

async function optionSelectorDemo() {
  const selector = new OptionSelector([{
    name: "Option 1",
    description: "This is option 1",
    id: 1,
  }, {
    name: "Option 2",
    description: "This is option 2",
    id: 2,
  }]);
  const result = await selector.prompt();
  console.log(result);
}

function cliPrompterDemo() {
  // const prompter = new CliPrompter({});
}

function wizardDemo() {
  // const wizard = createWizard();
}
if (import.meta.main) {
  easyCliDemo();
  prompterDemo();
  await optionSelectorDemo();
  cliPrompterDemo();
  wizardDemo();
}
