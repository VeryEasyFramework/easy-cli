import { OptionSelector, type SelectorOption } from "./optionSelector.ts";
import { Prompter, type PrompterOption } from "./prompter.ts";

interface WizardStep {
  type: "prompt" | "selector";
  selectorOptions?: SelectorOption<string>[];
  promptOptions?: PrompterOption<string>[];
}

interface WizardInput {
  steps: WizardStep[];
}

/**
 * Work in progress!!
 * @param input
 * @returns
 */

const createWizard = (input: WizardInput) => {
  return {
    async start() {
      for (const step of input.steps) {
        switch (step.type) {
          case "selector":
            console.log("selector");
            await new OptionSelector(step.selectorOptions!).selectOption();
            break;
          case "prompt":
            console.log("prompt");
            break;
        }
        if (step.type === "selector") {
        } else if (step.type === "prompt") {
          const prompter = new Prompter(step.promptOptions!);
          prompter.prompt();
        }
      }
    },
  };
};
