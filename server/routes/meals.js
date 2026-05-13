import express from "express";

const router = express.Router();
const MEAL_API = "https://www.themealdb.com/api/json/v1/1";
const CATEGORIES = ["Beef", "Chicken", "Seafood", "Vegetarian", "Pasta", "Dessert", "Breakfast", "Lamb"];

// GET /api/meals — fetch all meals for all categories
router.get("/", async (req, res) => {
  try {
    const results = await Promise.all(
      CATEGORIES.map((cat) =>
        fetch(`${MEAL_API}/filter.php?c=${cat}`)
          .then((r) => r.json())
          .then((d) => (d.meals || []).map((m) => ({ ...m, strCategory: cat })))
      )
    );

    const merged = results.flat();

    // Shuffle on the server
    for (let i = merged.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [merged[i], merged[j]] = [merged[j], merged[i]];
    }

    res.json({ meals: merged });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch meals" });
  }
});

// GET /api/meals/random — fetch a random meal
router.get("/random", async (req, res) => {
  try {
    const data = await fetch(`${MEAL_API}/random.php`).then((r) => r.json());
    res.json({ meal: data.meals?.[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch random meal" });
  }
});

// GET /api/meals/:id — fetch full meal detail by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetch(`${MEAL_API}/lookup.php?i=${id}`).then((r) => r.json());
    const meal = data.meals?.[0];
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json({ meal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch meal detail" });
  }
});

export default router;