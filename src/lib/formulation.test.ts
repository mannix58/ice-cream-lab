import { expect, test, vi } from "vitest";
import type { Recipe, MixStats } from "./types";

// Extend the real seed data with fixtures for branches it can't otherwise
// reach: a sugarKind with no matching coefficient, the unused
// fructose/invert/glucoseSyrup/lactose ingredients, and a deliberately
// invalid (>1) solids fraction to force negative water. Spreading `actual`
// keeps every real ingredient/coefficient intact for the rest of the tests.
vi.mock("./seedData", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./seedData")>();
  return {
    ...actual,
    INGREDIENTS: [
      ...actual.INGREDIENTS,
      {
        id: "fructose-syrup",
        name: "Fructose syrup",
        category: "sugar",
        fat: 0,
        msnf: 0,
        sugar: 1,
        otherSolids: 0,
        sugarKind: "fructose",
      },
      {
        id: "invert-sugar",
        name: "Invert sugar",
        category: "sugar",
        fat: 0,
        msnf: 0,
        sugar: 1,
        otherSolids: 0,
        sugarKind: "invert",
      },
      {
        id: "glucose-syrup",
        name: "Glucose syrup",
        category: "sugar",
        fat: 0,
        msnf: 0,
        sugar: 1,
        otherSolids: 0,
        sugarKind: "glucoseSyrup",
      },
      {
        id: "lactose-powder",
        name: "Lactose powder",
        category: "sugar",
        fat: 0,
        msnf: 0,
        sugar: 1,
        otherSolids: 0,
        sugarKind: "lactose",
      },
      {
        id: "mystery-sugar",
        name: "Mystery sugar (no matching coefficient)",
        category: "sugar",
        fat: 0,
        msnf: 0,
        sugar: 1,
        otherSolids: 0,
        sugarKind: "honey",
      },
      {
        id: "oversolid-fixture",
        name: "Oversolid fixture (forces negative water)",
        category: "stabilizer",
        fat: 0.61,
        msnf: 0.62,
        sugar: 0,
        otherSolids: 1 / 3,
      },
    ],
  };
});

const { INGREDIENTS, SUGAR_COEFFICIENTS } = await import("./seedData");
const formulation = (await import("./formulation")).default;
const { getIngredientById, getSugarCoefficientByKind, computeStats } =
  formulation;
test("getIngredientById returns the correct ingredients", () => {
  // Each Seed Ingredient
  const wholeMilk = INGREDIENTS.find((i) => i.id === "whole-milk");
  const heavyCream = INGREDIENTS.find((i) => i.id === "heavy-cream");
  const smp = INGREDIENTS.find((i) => i.id === "smp");
  const sucrose = INGREDIENTS.find((i) => i.id === "sucrose");
  const dextrose = INGREDIENTS.find((i) => i.id === "dextrose");
  const eggYolk = INGREDIENTS.find((i) => i.id === "egg-yolk");
  const stabilizer = INGREDIENTS.find((i) => i.id === "stabilizer");

  expect(getIngredientById("whole-milk")).toStrictEqual(wholeMilk);
  expect(getIngredientById("heavy-cream")).toStrictEqual(heavyCream);
  expect(getIngredientById("smp")).toStrictEqual(smp);
  expect(getIngredientById("sucrose")).toStrictEqual(sucrose);
  expect(getIngredientById("dextrose")).toStrictEqual(dextrose);
  expect(getIngredientById("egg-yolk")).toStrictEqual(eggYolk);
  expect(getIngredientById("stabilizer")).toStrictEqual(stabilizer);
  expect(getIngredientById("non-existent-id")).toStrictEqual(undefined);
  expect(getIngredientById("")).toStrictEqual(undefined);
});

test("getSugarCoefficientByKind returns the correct coefficients", () => {
  // Each Seed Sugar Coefficient
  const sucroseKind = SUGAR_COEFFICIENTS.find((s) => s.kind === "sucrose");
  const dextroseKind = SUGAR_COEFFICIENTS.find((s) => s.kind === "dextrose");
  const fructoseKind = SUGAR_COEFFICIENTS.find((s) => s.kind === "fructose");
  const invertKind = SUGAR_COEFFICIENTS.find((s) => s.kind === "invert");
  const glucoseSyrupKind = SUGAR_COEFFICIENTS.find(
    (s) => s.kind === "glucoseSyrup",
  );
  const lactoseKind = SUGAR_COEFFICIENTS.find((s) => s.kind === "lactose");
  expect(getSugarCoefficientByKind("sucrose")).toStrictEqual(sucroseKind);
  expect(getSugarCoefficientByKind("dextrose")).toStrictEqual(dextroseKind);
  expect(getSugarCoefficientByKind("lactose")).toStrictEqual(lactoseKind);
  expect(getSugarCoefficientByKind("invert")).toStrictEqual(invertKind);
  expect(getSugarCoefficientByKind("glucoseSyrup")).toStrictEqual(
    glucoseSyrupKind,
  );
  expect(getSugarCoefficientByKind("fructose")).toStrictEqual(fructoseKind);
  expect(getSugarCoefficientByKind("non-existent-kind")).toStrictEqual(
    undefined,
  );
  expect(getSugarCoefficientByKind("")).toStrictEqual(undefined);
});

test("computeStats returns the correct computation for the recipe", () => {
  // Test recipe with various ingredients
  let testRecipe: Recipe = {
    id: "test-gelato-1",
    name: "Test gelato base",
    style: "gelato",
    items: [
      { ingredientId: "whole-milk", grams: 632 },
      { ingredientId: "heavy-cream", grams: 130 },
      { ingredientId: "smp", grams: 25 },
      { ingredientId: "sucrose", grams: 120 },
      { ingredientId: "dextrose", grams: 60 },
      { ingredientId: "egg-yolk", grams: 30 },
      { ingredientId: "stabilizer", grams: 3 },
    ],
  };
  let mixResult: MixStats = {
    totalMass: 1000,
    water: 646.38,
    totalSolids: 353.62,
    fat: 77.49,
    msnf: 88.03,
    sugars: 180,
    otherSolids: 8.1,
    podMass: 162,
    pacMass: 234,
  };
  expect(computeStats(testRecipe)).toStrictEqual(mixResult);

  testRecipe = {
    id: "empty-recipe",
    name: "Empty recipe",
    style: "gelato",
    items: [],
  };

  mixResult = {
    totalMass: 0,
    water: 0,
    totalSolids: 0,
    fat: 0,
    msnf: 0,
    sugars: 0,
    otherSolids: 0,
    podMass: 0,
    pacMass: 0,
  };
  expect(computeStats(testRecipe)).toStrictEqual(mixResult);

  testRecipe = {
    id: "test-gelato-1",
    name: "Test gelato base",
    style: "gelato",
    items: [{ ingredientId: "non-existent-id", grams: 632 }],
  };

  mixResult = {
    totalMass: 0,
    water: 0,
    totalSolids: 0,
    fat: 0,
    msnf: 0,
    sugars: 0,
    otherSolids: 0,
    podMass: 0,
    pacMass: 0,
  };
  expect(computeStats(testRecipe)).toStrictEqual(mixResult);
});

test("computeStats accumulates duplicate ingredient entries instead of overwriting", () => {
  const duplicateRecipe: Recipe = {
    id: "duplicate-entries",
    name: "Duplicate entries",
    style: "gelato",
    items: [
      { ingredientId: "sucrose", grams: 60 },
      { ingredientId: "sucrose", grams: 60 },
    ],
  };
  const combinedRecipe: Recipe = {
    id: "combined-entry",
    name: "Combined entry",
    style: "gelato",
    items: [{ ingredientId: "sucrose", grams: 120 }],
  };
  expect(computeStats(duplicateRecipe)).toStrictEqual(
    computeStats(combinedRecipe),
  );
});

test("computeStats integrates fructose, invert, glucoseSyrup, and lactose coefficients", () => {
  const recipe: Recipe = {
    id: "all-sugar-kinds",
    name: "All sugar kinds",
    style: "gelato",
    items: [
      { ingredientId: "fructose-syrup", grams: 50 },
      { ingredientId: "invert-sugar", grams: 40 },
      { ingredientId: "glucose-syrup", grams: 30 },
      { ingredientId: "lactose-powder", grams: 20 },
    ],
  };

  // podMass = 50*1.7 + 40*1.25 + 30*0.5 + 20*0.16 = 85 + 50 + 15 + 3.2 = 153.2
  // pacMass = 50*1.9 + 40*1.9 + 30*0.8 + 20*1.0 = 95 + 76 + 24 + 20 = 215
  const result = computeStats(recipe);
  expect(result.totalMass).toBe(140);
  expect(result.sugars).toBe(140);
  expect(result.podMass).toBe(153.2);
  expect(result.pacMass).toBe(215);
});

test("computeStats skips sugar kinds with no matching coefficient", () => {
  const recipe: Recipe = {
    id: "missing-coefficient",
    name: "Missing coefficient",
    style: "gelato",
    items: [{ ingredientId: "mystery-sugar", grams: 40 }],
  };

  const result = computeStats(recipe);
  expect(result.totalMass).toBe(40);
  expect(result.sugars).toBe(40);
  expect(result.podMass).toBe(0);
  expect(result.pacMass).toBe(0);
});

test("computeStats preserves sign when rounding negative values", () => {
  const recipe: Recipe = {
    id: "negative-water",
    name: "Negative water",
    style: "gelato",
    items: [{ ingredientId: "oversolid-fixture", grams: 100 }],
  };

  // fat = 61, msnf = 62, otherSolids = 33.333... -> totalSolids = 156.33
  // water = 100 - 156.333... = -56.333... -> -56.33
  const result = computeStats(recipe);
  expect(result.totalSolids).toBe(156.33);
  expect(result.water).toBe(-56.33);
});
