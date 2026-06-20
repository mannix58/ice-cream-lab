type IngredientCategory =
  | "dairy"
  | "sugar"
  | "fat"
  | "egg"
  | "stabilizer"
  | "flavor";
type SugarKind =
  | "sucrose"
  | "dextrose"
  | "fructose"
  | "invert"
  | "glucoseSyrup"
  | "lactose";
// All composition fields are fractions of the ingredient's OWN mass (0..1).
// They should sum to ~1 with water as the remainder.

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  fat: number;
  msnf: number; // milk solids non-fat
  sugar: number; // total sugars by mass
  otherSolids: number; // egg proteins, stabilizer, etc.
  sugarKind?: SugarKind; // present iff this ingredient's sugar has coefficients
}
// Sweetness (POD) and anti-freeze (PAC) relative to sucrose = 1.0

export interface SugarCoefficient {
  kind: string;
  pod: number;
  pac: number;
}
interface RecipeItem {
  ingredientId: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  style: Style;
  items: RecipeItem[];
}

type Style = "gelato" | "iceCream";

export interface MixStats {
  totalMass: number;
  water: number;
  totalSolids: number;
  fat: number;
  msnf: number;
  sugars: number;
  otherSolids: number;
  podMass: number;
  pacMass: number;
}
interface Band {
  min: number;
  max: number;
}

interface StyleTargets {
  totalSolids: Band;
  fat: Band;
  msnf: Band;
  sugars: Band;
  pod: Band;
  pac: Band;
}
