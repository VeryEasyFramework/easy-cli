import { type FieldKeyOption, ObjectPrompter } from "./objectPrompter.ts";
import { OptionSelector, type SelectorOption } from "./optionSelector.ts";

interface WizardStep {
  type: "prompt" | "selector";
  selectorOptions?: SelectorOption<string>[];
  promptOptions?: FieldKeyOption<string>[];
}

interface WizardInput {
  steps: WizardStep[];
}

/**
 * Work in progress!!
 */

export const createWizard = (input: WizardInput): {
  start: () => Promise<void>;
} => {
  return {
    async start() {
      for (const step of input.steps) {
        switch (step.type) {
          case "selector":
            console.log("selector");
            await new OptionSelector(step.selectorOptions!).prompt();
            break;
          case "prompt":
            console.log("prompt");
            break;
        }
        if (step.type === "selector") {
        } else if (step.type === "prompt") {
          const prompter = new ObjectPrompter(step.promptOptions!);
          prompter.prompt();
        }
      }
    },
  };
};
