# Eigos Project Rules

## Svelte 5 Reactivity
* ALWAYS use the `$derived.by(() => { ... })` rune when a derived state requires a multi-line block or complex logic. Never use `$derived` for multi-line functions.
* When referencing these derived variables in the Svelte HTML markup, do not append parentheses `()`.

## Type Checking & Documentation
* This project utilizes strict TypeScript checking over standard JavaScript files.
* You MUST write JSDoc annotations (e.g., `/** @type {...} */` or `/** @param {...} @returns {...} */`) above all variables, function declarations, and reactive `$state()` initializations to prevent `implicit any` or `never` type errors from the language server.