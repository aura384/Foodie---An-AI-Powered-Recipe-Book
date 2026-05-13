import { useEffect, useState, useCallback, useRef } from "react";
import "./App.css";
import girlImg from "./image.png";
import logoImg from "./foodie.png";
import ReyChat from "./ReyChat";
import AuthPage from "./AuthPage";

const CATEGORIES = ["All", "Beef", "Chicken", "Seafood", "Vegetarian", "Pasta", "Dessert", "Breakfast", "Lamb"];
const API_BASE = "http://localhost:3001/api";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function getIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({ ingredient: ingredient.trim(), measure: measure?.trim() || "" });
    }
  }
  return ingredients;
}

function Hero({ onBrowse }) {
  return (
    <section className="hero">
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />

      <div className="hero-inner">
        <div className="hero-text">
          <p className="hero-eyebrow">Hold your drink and</p>
          <h1 className="hero-title">
            <span className="hero-word w1">Let's</span>
            <span className="hero-word w2">Cook!</span>
          </h1>
          <button className="hero-cta" onClick={onBrowse}>
            Browse All Recipes
            <span className="cta-arrow">↓</span>
          </button>
        </div>

        <div className="hero-img-wrap">
          <div className="img-blob-bg" />
          <img src={girlImg} alt="Foodie" className="hero-girl" />
          <span className="sparkle sp1">✦</span>
          <span className="sparkle sp2">✦</span>
          <span className="sparkle sp3">✧</span>
          <span className="sparkle sp4">✦</span>
        </div>
      </div>

      <div className="hero-scroll-hint" onClick={onBrowse}>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}

function Modal({ mealStub, onClose }) {
  const [meal, setMeal] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    if (!mealStub?.idMeal) return;
    setLoadingDetail(true);
    setDetailError(null);
    setMeal(null);
    fetch(`${API_BASE}/meals/${mealStub.idMeal}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.meal) setMeal(d.meal);
        else setDetailError("Recipe details not found.");
      })
      .catch(() => setDetailError("Couldn't load recipe details. Check your connection."))
      .finally(() => setLoadingDetail(false));
  }, [mealStub?.idMeal]);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const ingredients = meal ? getIngredients(meal) : [];
  const steps = meal?.strInstructions
    ?.split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10) || [];

  const heroThumb = meal?.strMealThumb || mealStub?.strMealThumb;
  const heroTitle = meal?.strMeal || mealStub?.strMeal;
  const heroCategory = meal?.strCategory || mealStub?.strCategory;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <div className="modal-hero">
          <img src={heroThumb} alt={heroTitle} className="modal-hero-img" />
          <div className="modal-hero-overlay">
            <span className="modal-category">{heroCategory}</span>
            <h2 className="modal-title">{heroTitle}</h2>
            {meal && (
              <div className="modal-meta">
                {meal.strArea && <span className="meta-tag">🌍 {meal.strArea}</span>}
                {meal.strTags && meal.strTags.split(",").slice(0, 2).map((tag) => (
                  <span key={tag} className="meta-tag">{tag.trim()}</span>
                ))}
              </div>
            )}
            {meal?.strYoutube && (
              <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="youtube-btn">
                ▶ Watch Video
              </a>
            )}
          </div>
        </div>
        <div className="modal-body">
          {loadingDetail && (
            <div className="modal-loading">
              <div className="modal-spinner" />
              <p>Loading recipe details…</p>
            </div>
          )}
          {detailError && !loadingDetail && (
            <div className="modal-error"><p>{detailError}</p></div>
          )}
          {meal && !loadingDetail && (
            <>
              <div className="modal-section">
                <h3 className="section-title">Ingredients</h3>
                <div className="ingredient-grid">
                  {ingredients.map(({ ingredient, measure }, i) => (
                    <div key={i} className="ingredient-item">
                      <img
                        src={`https://www.themealdb.com/images/ingredients/${ingredient}-Small.png`}
                        alt={ingredient}
                        className="ingredient-img"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <div>
                        <div className="ingredient-name">{ingredient}</div>
                        <div className="ingredient-measure">{measure}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-section">
                <h3 className="section-title">Instructions</h3>
                <ol className="steps-list">
                  {steps.map((step, i) => (
                    <li key={i} className="step">{step}</li>
                  ))}
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RecipeCard({ meal, onClick, index }) {
  return (
    <div
      className="card"
      onClick={() => onClick(meal)}
      style={{ animationDelay: `${(index % 12) * 0.05}s` }}
    >
      <div className="card-img-wrapper">
        <img src={meal.strMealThumb} alt={meal.strMeal} className="card-img" />
        <div className="card-overlay">
          <span className="view-btn">View Recipe</span>
        </div>
        <span className="card-badge">{meal.strCategory}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{meal.strMeal}</h3>
        {meal.strArea && <div className="card-area">🌍 {meal.strArea}</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("foodie_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [inputVal, setInputVal] = useState("");
  const [category, setCategory] = useState("All");
  const [allRecipes, setAllRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [error, setError] = useState(null);
  const [random, setRandom] = useState(null);

  const gridRef = useRef(null);
  const debouncedQuery = useDebounce(inputVal, 350);

  const handleLogout = () => {
    localStorage.removeItem("foodie_token");
    localStorage.removeItem("foodie_user");
    setUser(null);
  };

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const data = await fetch(`${API_BASE}/meals`).then((r) => r.json());
        setAllRecipes(data.meals);
        setRecipes(data.meals);
      } catch {
        setError("Couldn't load recipes. Check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    fetch(`${API_BASE}/meals/random`)
      .then((r) => r.json())
      .then((d) => d.meal && setRandom(d.meal))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    let filtered = allRecipes;
    if (category !== "All") filtered = filtered.filter((m) => m.strCategory === category);
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter((m) => m.strMeal.toLowerCase().includes(q));
    }
    setRecipes(filtered);
  }, [debouncedQuery, category, allRecipes]);

  const scrollToGrid = useCallback(() => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    scrollToGrid();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    scrollToGrid();
  };

  const handleSurprise = () => {
    if (!random) return;
    setSelectedMeal({
      idMeal: random.idMeal,
      strMeal: random.strMeal,
      strMealThumb: random.strMealThumb,
      strCategory: random.strCategory,
    });
  };

  if (!user) return <AuthPage onLogin={setUser} />;

  return (
    <div>
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <img src={logoImg} alt="Foodie" className="logo-img" />
          </div>
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              className="search-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search any dish..."
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
          {random && (
            <button className="surprise-btn" onClick={handleSurprise}>
              Surprise Me
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
        <div className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-btn${category === cat ? " active" : ""}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
          <span className="auth-welcome">Hi, {user.name}!</span>
        </div>
      </header>

      <Hero onBrowse={scrollToGrid} />

      <main className="main" ref={gridRef}>
        {loading ? (
          <div className="skeleton-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ animationDelay: `${i * 0.07}s` }} />
            ))}
          </div>
        ) : error ? (
          <div className="empty"><p className="empty-text">{error}</p></div>
        ) : (
          <>
            <p className="result-count">
              {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
              {category !== "All" ? ` in ${category}` : ""}
              {debouncedQuery.trim() ? ` matching "${debouncedQuery}"` : ""}
            </p>
            <div className="grid">
              {recipes.map((meal, i) => (
                <RecipeCard key={meal.idMeal} meal={meal} onClick={setSelectedMeal} index={i} />
              ))}
            </div>
            {recipes.length === 0 && (
              <div className="empty">
                <p className="empty-text">No recipes found. Try a different search!</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        made with <span>♥</span> · by Aura
      </footer>

      {selectedMeal && (
        <Modal mealStub={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}

      <ReyChat />
    </div>
  );
}