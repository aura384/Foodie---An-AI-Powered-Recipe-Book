import { useEffect, useState, useCallback, useRef } from "react";
import "./App.css";
import girlImg from "./image.png";
import logoImg from "./foodie.png";
import ReyChat from "./ReyChat";
import AuthPage from "./AuthPage";

const CATEGORIES = ["All", "Beef", "Chicken", "Seafood", "Vegetarian", "Pasta", "Dessert", "Breakfast", "Lamb"];
const API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

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

/* ── Auth Prompt Modal ── */
function AuthPrompt({ onClose, onGoAuth }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="overlay auth-prompt-overlay" onClick={onClose}>
      <div className="auth-prompt-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <div className="auth-prompt-icon">🤍</div>
        <h3 className="auth-prompt-title">Save your favourites!</h3>
        <p className="auth-prompt-body">
          Sign in or create a free account to save and revisit your favourite recipes anytime.
        </p>
        <div className="auth-prompt-actions">
          <button className="auth-prompt-signin" onClick={() => { onGoAuth("login"); onClose(); }}>
            Sign In
          </button>
          <button className="auth-prompt-signup" onClick={() => { onGoAuth("register"); onClose(); }}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
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

function Modal({ mealStub, onClose, user, favourites, onToggleFavourite, onNeedAuth }) {
  const [meal, setMeal] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    if (!mealStub?.idMeal) return;
    setLoadingDetail(true);
    setDetailError(null);
    setMeal(null);
    fetch(`${API_BASE}/api/meals/${mealStub.idMeal}`)
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

  const isFav = favourites.has(mealStub?.idMeal);

  const handleFav = (e) => {
    e.stopPropagation();
    if (!user) { onNeedAuth(); return; }
    onToggleFavourite(mealStub.idMeal);
  };

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
        <button
          className={`modal-fav-btn${isFav ? " active" : ""}`}
          onClick={handleFav}
          title={isFav ? "Remove from favourites" : "Add to favourites"}
        >
          {isFav ? "♥" : "♡"}
        </button>
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

function RecipeCard({ meal, onClick, index, user, favourites, onToggleFavourite, onNeedAuth }) {
  const isFav = favourites.has(meal.idMeal);

  const handleFav = (e) => {
    e.stopPropagation();
    if (!user) { onNeedAuth(); return; }
    onToggleFavourite(meal.idMeal);
  };

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
        <button
          className={`card-fav-btn${isFav ? " active" : ""}`}
          onClick={handleFav}
          title={isFav ? "Remove from favourites" : "Add to favourites"}
        >
          {isFav ? "♥" : "♡"}
        </button>
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

  // null = main app, "login" or "register" = auth page
  // Derive initial state from URL so hard refresh / direct links work
  const [authMode, setAuthModeState] = useState(() => {
    const p = window.location.pathname;
    if (p === "/login") return "login";
    if (p === "/register") return "register";
    return null;
  });

  // Wrapper: update state AND push a history entry
  const setAuthMode = useCallback((mode) => {
    setAuthModeState(mode);
    if (mode === "login")    window.history.pushState({ page: "login" },    "", "/login");
    else if (mode === "register") window.history.pushState({ page: "register" }, "", "/register");
    else                     window.history.pushState({ page: "home" },     "", "/");
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const onPop = (e) => {
      const p = window.location.pathname;
      if (p === "/login")    setAuthModeState("login");
      else if (p === "/register") setAuthModeState("register");
      else                   setAuthModeState(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const [inputVal, setInputVal] = useState("");
  const [category, setCategory] = useState("All");
  const [allRecipes, setAllRecipes] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [error, setError] = useState(null);
  const [random, setRandom] = useState(null);

  // Favourites: Set of meal IDs
  const [favourites, setFavourites] = useState(() => {
    try {
      const stored = localStorage.getItem("foodie_favourites");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);

  const gridRef = useRef(null);
  const debouncedQuery = useDebounce(inputVal, 350);

  const handleLogin = (userData) => {
    setUser(userData);
    setAuthMode(null); // pushes history to "/"
  };

  const handleLogout = () => {
    localStorage.removeItem("foodie_token");
    localStorage.removeItem("foodie_user");
    setUser(null);
    setShowFavouritesOnly(false);
  };

  const handleToggleFavourite = (mealId) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(mealId)) next.delete(mealId);
      else next.add(mealId);
      localStorage.setItem("foodie_favourites", JSON.stringify([...next]));
      return next;
    });
  };

  // Always load recipes (no auth gate)
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const data = await fetch(`${API_BASE}/api/meals`).then((r) => r.json());
        setAllRecipes(data.meals);
        setRecipes(data.meals);
      } catch {
        setError("Couldn't load recipes. Check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    fetch(`${API_BASE}/api/meals/random`)
      .then((r) => r.json())
      .then((d) => d.meal && setRandom(d.meal))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let filtered = allRecipes;
    if (showFavouritesOnly) filtered = filtered.filter((m) => favourites.has(m.idMeal));
    if (category !== "All") filtered = filtered.filter((m) => m.strCategory === category);
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter((m) => m.strMeal.toLowerCase().includes(q));
    }
    setRecipes(filtered);
  }, [debouncedQuery, category, allRecipes, showFavouritesOnly, favourites]);

  const scrollToGrid = useCallback(() => {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setShowFavouritesOnly(false);
    scrollToGrid();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowFavouritesOnly(false);
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

  const handleNeedAuth = () => setShowAuthPrompt(true);

  // Show auth page (full screen)
  if (authMode) {
    return <AuthPage initialMode={authMode} onLogin={handleLogin} onBack={() => setAuthMode(null)} />;
  }

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

          {user ? (
            <>
              <button
                className={`favourites-btn${showFavouritesOnly ? " active" : ""}`}
                onClick={() => { setShowFavouritesOnly((v) => !v); scrollToGrid(); }}
                title="My Favourites"
              >
                ♥ Favourites
                {favourites.size > 0 && (
                  <span className="fav-count">{favourites.size}</span>
                )}
              </button>
              <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <div className="auth-btns">
              <button className="header-signin-btn" onClick={() => setAuthMode("login")}>
                Sign In
              </button>
              <button className="header-signup-btn" onClick={() => setAuthMode("register")}>
                Sign Up
              </button>
            </div>
          )}
        </div>
        <div className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-btn${category === cat && !showFavouritesOnly ? " active" : ""}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
          {user && (
            <span className="auth-welcome">Hi, {user.name}!</span>
          )}
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
              {showFavouritesOnly ? `${recipes.length} favourite recipe${recipes.length !== 1 ? "s" : ""}` : (
                <>
                  {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
                  {category !== "All" ? ` in ${category}` : ""}
                  {debouncedQuery.trim() ? ` matching "${debouncedQuery}"` : ""}
                </>
              )}
            </p>
            <div className="grid">
              {recipes.map((meal, i) => (
                <RecipeCard
                  key={meal.idMeal}
                  meal={meal}
                  onClick={setSelectedMeal}
                  index={i}
                  user={user}
                  favourites={favourites}
                  onToggleFavourite={handleToggleFavourite}
                  onNeedAuth={handleNeedAuth}
                />
              ))}
            </div>
            {recipes.length === 0 && (
              <div className="empty">
                <p className="empty-text">
                  {showFavouritesOnly
                    ? "No favourites yet. Heart a recipe to save it here!"
                    : "No recipes found. Try a different search!"}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        made with <span>♥</span> · by Aura
      </footer>

      {selectedMeal && (
        <Modal
          mealStub={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          user={user}
          favourites={favourites}
          onToggleFavourite={handleToggleFavourite}
          onNeedAuth={handleNeedAuth}
        />
      )}

      {showAuthPrompt && (
        <AuthPrompt
          onClose={() => setShowAuthPrompt(false)}
          onGoAuth={(mode) => { setAuthMode(mode); setShowAuthPrompt(false); }}
        />
      )}

      <ReyChat />
    </div>
  );
}