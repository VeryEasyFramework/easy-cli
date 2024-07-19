import {
  CliMenu,
  createWizard,
  EasyCli,
  ObjectPrompter,
  OptionSelector,
  TypedObjectPrompter,
} from "./mod.ts";
import { runCommand } from "./src/runCommand.ts";

function easyCliDemo() {
  const easyCli = new EasyCli("My CLI App");

  easyCli.addMenuItem({
    title: "Sample Menu Item",
    description: "This is a sample menu item",
    action: () => {
      console.log("This is a sample menu item");
    },

    waitAfterAction: true,
  });
  easyCli.addMenuItem({
    title: "list files",
    description: "list files in the current directory",

    action: async () => {
      const response = await runCommand("ls");
      return response.stdout;
    },
  });
  easyCli.addSubMenu({
    title: "Sample Sub Menu",
    description: "This is a sample sub menu",
    subMenu: new CliMenu("Sample Sub Menu"),
  });
  easyCli.run();
}
function prompterDemo() {
  const prompter = new ObjectPrompter(
    [
      {
        key: "name",
        message: "What is your name?",
        default: "John Doe",
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

async function typedPrompterDemo() {
  const prompter = new TypedObjectPrompter({
    fields: [
      {
        key: "name",
        message: "What is your name?",
        type: "string",
        required: true,
      },
      {
        key: "age",
        message: "How old are you?",
        type: "number",
      },
      {
        key: "email",
        message: "What is your email?",
        type: "string",
        defaultValue: "example@example.com",
      },
      {
        key: "isStudent",
        message: "Are you a student?",
        type: "boolean",
        required: true,
      },
      {
        key: "hobbies",
        message: "What are your hobbies?",
        type: "array",
        required: true,
      },
    ],
  });
  const result = await prompter.prompt();
  const age = result.age;

  console.log(result);
}

function wizardDemo() {
  // const wizard = createWizard();
}
if (import.meta.main) {
  easyCliDemo();
  // typedPrompterDemo();
  // await runCommand("python3");
}
