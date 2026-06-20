# Gelato Lab

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

> Balance a gelato or ice-cream base in real time. Enter your ingredients by weight and Gelato Lab computes the mix's composition — fat, solids, sugars, sweetness, and freezing power — then tells you at a glance what's in range and what needs adjusting.

## Overview

A good frozen dessert is a balancing act: enough fat and solids for body, enough sugar for flavor, and the right freezing-point depression so it stays soft enough to scoop without turning to soup. Those quantities pull against each other, and dialing them in by trial and error wastes a lot of cream.

Gelato Lab turns that into a live readout. You build a recipe from a small ingredient database, and the app continuously recomputes the mix's composition by mass and flags any metric that falls outside the target band for the style you're making. It started as a React + TypeScript exercise and grew into a genuinely useful little instrument.

## Features

- Build a recipe from an ingredient database, entering each component by grams
- Live balance panel: six headline metrics recomputed on every edit
- In-range / near-edge / out-of-range flags on each metric, at a glance
- Gelato / ice-cream style toggle that swaps the target bands
- Light and dark themes

## How it works

Every ingredient carries its composition as a fraction of its own mass. `computeStats` walks the recipe, resolves each item against the ingredient catalog, and accumulates grams of each component — then derives two functional indices from the sugars.

| Metric       | What it measures                                               |
| ------------ | -------------------------------------------------------------- |
| Total solids | Everything that isn't water                                    |
| Fat          | Richness and body                                              |
| MSNF         | Milk proteins + lactose; structure (too high turns it sandy)   |
| Sugars       | Total sugar by mass                                            |
| POD          | Perceived sweetness, sucrose-equivalent (sucrose = 100)        |
| PAC          | Freezing-point depression — how soft it scoops (sucrose = 100) |

POD and PAC are what make the tool worth having: different sugars sweeten and depress the freezing point by different amounts (dextrose is less sweet than sucrose but a stronger anti-freeze), so the app lets you trade them off — softer scoop without making it cloying.

Each computed value is checked against a target band for the selected style. Gelato and ice cream differ mainly in fat and serving temperature, so they carry different bands; the bands ship as sensible starting points and are meant to be calibrated to your own freezer.

## Tech stack

- **React** + **TypeScript** for the UI and the typed domain model
- **Vite** for dev/build tooling, **Vitest** for the formulation tests
- Plain CSS custom properties for theming (no UI framework)

## Project structure

```
gelato-lab/
├─ src/
│  ├─ lib/
│  │  └─ formulation.ts      # types, seed data, computeStats (pure, tested first)
│  ├─ components/
│  │  ├─ App.tsx             # owns recipe state (useReducer)
│  │  ├─ RecipeBuilder.tsx   # ingredient rows + add control
│  │  ├─ IngredientRow.tsx   # name, grams input, remove
│  │  ├─ AddIngredient.tsx   # append an ingredient from the catalog
│  │  ├─ BalancePanel.tsx    # runs computeStats, renders the metrics
│  │  └─ MetricRow.tsx       # one metric + its range indicator
│  ├─ hooks/
│  │  └─ useTheme.ts         # light/dark toggle, persisted
│  ├─ styles/
│  │  └─ tokens.css          # semantic color tokens (light + dark)
│  └─ main.tsx
├─ index.html
└─ README.md
```

## Data model

Recipes are normalized: an item stores a reference and a quantity, not a copy of the ingredient's composition.

```ts
type SugarKind =
  | "sucrose"
  | "dextrose"
  | "fructose"
  | "invert"
  | "glucoseSyrup"
  | "lactose";

// composition fields are fractions of the ingredient's own mass (0..1)
interface Ingredient {
  id: string;
  name: string;
  category: "dairy" | "sugar" | "fat" | "egg" | "stabilizer" | "flavor";
  fat: number;
  msnf: number;
  sugar: number;
  otherSolids: number;
  sugarKind?: SugarKind;
}

interface RecipeItem {
  ingredientId: string;
  grams: number;
}
interface Recipe {
  id: string;
  name: string;
  style: "gelato" | "iceCream";
  items: RecipeItem[];
}
```

The math lives in one pure function:

```ts
computeStats(recipe, ingredients, coeffs): MixStats
```

It resolves the recipe's references against the ingredient catalog and the sugar-coefficient table, and returns the mix in **grams**. Percentages are derived in the UI, so `MixStats` stays the single source of truth.

## Key design decisions

- **Normalized recipes.** Items hold `ingredientId` + `grams`, not embedded composition. Edit an ingredient once and every recipe using it updates, and recipes stay lean and trivially serializable.
- **One pure function for the math.** `computeStats` takes its data as arguments rather than reaching for module state, which keeps it dependency-free and easy to unit-test.
- **Store grams, derive percentages.** Nothing redundant is held in state; the headline `%` values are computed at render time.
- **Semantic color tokens.** Components reference token names (`--surface`, `--ink`, `--accent`), never raw hex, so theming is a single attribute flip. The brand accent is deliberately kept off the status hues so green/amber/red keep their meaning.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm test         # run the formulation tests
```

> Assumes a Vite + Vitest setup; adjust the script names to match your scaffold.

## Testing

The formulation math is covered by unit tests against a known-good recipe: a balanced 1000 g gelato base whose expected composition is computed by hand. Because the inputs and expected outputs are fixed, any regression in `computeStats` surfaces immediately. The intended build order is to write and test `lib/formulation.ts` before wiring up any UI — the function is the heart of the app, and everything else is presentation on top of it.

Use `toBeCloseTo` rather than exact equality in assertions; floating-point math (`632 * 0.0325` and friends) won't land on exact decimals.

## Theming

Light and dark are both defined as semantic CSS custom properties in `tokens.css`. Components never name a color directly — they reference tokens — so switching themes only swaps the values behind those tokens. `useTheme` handles the toggle, persists the choice, and falls back to the system preference.

## Roadmap

- [ ] Batch scaling to a target mass
- [ ] Save / load named recipes (localStorage)
- [ ] JSON import / export of recipes
- [ ] Unit toggle (g / oz) and metric view (% / g)
- [ ] Editable ingredient database
- [ ] Range-bar / radar visualization of the metrics
- [ ] MSNF → PAC lactose refinement for more accurate freezing power

## License

MIT
