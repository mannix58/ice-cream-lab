import BalancePanel from "./BalancePanel";
import RecipeBuilder from "./RecipeBuilder";

function App() {
  return (
    <>
      <header className="flex flex-row gap-4 align-items-center">
        <h1>Ice Cream Lab</h1>
      </header>
      <div className="flex flex-row gap-4 align-items-center">
        <RecipeBuilder />
        <BalancePanel />
      </div>
    </>
  );
}

export default App;
