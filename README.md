# Easy CLI

A CLI library for Deno that allows you to create an interactive CLI application
with ease.

## Installation

```bash
deno add @eveffer/easy-cli
```

## Usage

```typescript
import { EasyCLI } from "@eveffer/easy-cli";

const easyCli = new EasyCli("My CLI App");

easyCli.addMenuItem({
  title: "Sample Menu Item",
  description: "This is a sample menu item",
  action: () => {
    console.log("This is a sample action");
  },
  waitAfterAction: true,
});

easyCli.addMenuItem({
  title: "Another Menu Item",
  description: "This is another sample menu item",
  action: () => {
    console.log("This is another sample action");
  },
});

if (import.meta.main) {
  easyCli.run();
}
```

## EasyCLI

## CliPrompter

## OptionSelector
