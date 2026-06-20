import type { RecipeItem } from "../lib/types";

const handleOnAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  event.preventDefault();
  const newAmount = parseInt(event.target.value, 10);
  console.log(`Changing amount to: ${newAmount}`);
};

const handleOnItemRemove =
  (ingredientId: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log(`Removing item: ${ingredientId}`);
  };

function IngredientRow(recipeItem: RecipeItem) {
  const { ingredientId, grams } = recipeItem;
  return (
    <div className="ingredient-row flex flex-row gap-4">
      <div>
        <h3>{ingredientId}:</h3>
        <input
          id={ingredientId}
          type="number"
          value={grams}
          min="0"
          step="1"
          onChange={handleOnAmountChange}
        />
        <h3> grams</h3>
      </div>
      <div>
        <button onClick={handleOnItemRemove(ingredientId)}>X</button>
      </div>
    </div>
  );
}

export default IngredientRow;
