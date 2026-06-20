import { INGREDIENTS, SUGAR_COEFFICIENTS } from "./seedData";
import type { Ingredient, SugarCoefficient, Recipe, MixStats } from "./types";

function getIngredientById(ingredientId: string): Ingredient | undefined {
  if (!ingredientId) return;
  const foundIngredient = INGREDIENTS.find((ing) => ingredientId == ing.id);
  return foundIngredient ? foundIngredient : undefined;
}

function getSugarCoefficientByKind(
  sugarKind: string,
): SugarCoefficient | undefined {
  if (!sugarKind) return;
  const foundCoefficient = SUGAR_COEFFICIENTS.find((c) => c.kind === sugarKind);
  return foundCoefficient ? foundCoefficient : undefined;
}

function roundToTwoDecimals(num: number) {
  // Handle negative numbers by preserving sign during calculation
  const sign = num < 0 ? -1 : 1;
  // Nudge, scale, round, and rescale
  return (sign * Math.round((Math.abs(num) + Number.EPSILON) * 100)) / 100;
}

function computeStats(
  recipe: Recipe,
  // coeffs: Record<SugarKind, SugarCoefficients>,
): MixStats {
  let totalMass = 0;
  let fat = 0;
  let msnf = 0;
  let sugars = 0;
  let otherSolids = 0;
  let podMass = 0;
  let pacMass = 0;

  // Aggregate the mix's composition by mass — walk each RecipeItem, look up its ingredient, and accumulate grams of each component
  for (const item of recipe.items) {
    const ingredient = getIngredientById(item.ingredientId);
    if (!ingredient) continue;

    totalMass += item.grams;
    fat += item.grams * ingredient.fat;
    msnf += item.grams * ingredient.msnf;
    sugars += item.grams * ingredient.sugar;
    otherSolids += item.grams * ingredient.otherSolids;

    // compute the two functional indices as sucrose-equivalent masses, by weighting each sugar-bearing ingredient's sugar by its coefficients
    if (ingredient.sugarKind) {
      const coefficient = getSugarCoefficientByKind(ingredient.sugarKind);
      if (!coefficient) continue;
      podMass += item.grams * ingredient.sugar * coefficient.pod;
      pacMass += item.grams * ingredient.sugar * coefficient.pac;
    }
  }

  const totalSolids = fat + msnf + sugars + otherSolids;
  const water = totalMass - totalSolids;

  const mix: MixStats = {
    totalMass: roundToTwoDecimals(totalMass),
    fat: roundToTwoDecimals(fat),
    msnf: roundToTwoDecimals(msnf),
    sugars: roundToTwoDecimals(sugars),
    water: roundToTwoDecimals(water),
    otherSolids: roundToTwoDecimals(otherSolids),
    totalSolids: roundToTwoDecimals(totalSolids),
    podMass: roundToTwoDecimals(podMass),
    pacMass: roundToTwoDecimals(pacMass),
  };

  return mix;
}

export default { getIngredientById, getSugarCoefficientByKind, computeStats };
