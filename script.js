const recipeList = document.getElementById("recipeList");
const recipeForm = document.getElementById("recipeForm");
const categoryFilter = document.getElementById("categoryFilter");

let editingRecipeId = null;

const fallbackImage =
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80";

// 1. Load recipes from MongoDB
async function loadRecipes() {
    try {
        recipeList.innerHTML = "<p>Loading recipes...</p>";

        const response = await fetch("/api/recipes");

        if (!response.ok) {
            throw new Error("Unable to load recipes");
        }

        const recipes = await response.json();
        displayRecipes(recipes);

    } catch (error) {
        recipeList.innerHTML =
            "<p>Unable to load recipes. Please check your server.</p>";

        console.error("Loading error:", error);
    }
}

// 2. Display recipes
function displayRecipes(recipes) {
    recipeList.innerHTML = "";

    if (recipes.length === 0) {
        recipeList.innerHTML =
            "<p>No recipes found. Add your first recipe!</p>";
        return;
    }

    recipes.forEach(recipe => {

        const card = document.createElement("div");
        card.className = "recipe-card";

        // Recipe image
        const image = document.createElement("img");

        image.alt = recipe.name || "Recipe";
        image.loading = "lazy";
        image.decoding = "async";

        // Try the MongoDB image URL first
        image.src = recipe.image || fallbackImage;

        // If the image fails, try the fallback only once
        image.onerror = function () {
            if (this.src !== fallbackImage) {
                this.onerror = null;
                this.src = fallbackImage;
            } else {
                this.onerror = null;
                this.style.display = "none";

                const placeholder = document.createElement("div");
                placeholder.textContent = "🍽️ Recipe Image";
                placeholder.style.height = "190px";
                placeholder.style.display = "flex";
                placeholder.style.alignItems = "center";
                placeholder.style.justifyContent = "center";
                placeholder.style.background = "#f8eee6";
                placeholder.style.color = "#a33b28";
                placeholder.style.fontSize = "20px";

                card.insertBefore(placeholder, card.firstChild);
            }
        };

        // Recipe information
        const info = document.createElement("div");
        info.className = "recipe-info";

        const category = document.createElement("span");
        category.className = "category";
        category.textContent = recipe.category || "General";

        const title = document.createElement("h3");
        title.textContent = recipe.name || "Untitled Recipe";

        const description = document.createElement("p");
        description.textContent =
            recipe.description || "No description available.";

        // Buttons
        const actions = document.createElement("div");
        actions.className = "card-actions";

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            editRecipe(recipe);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteRecipe(recipe._id);
        });

        actions.append(editButton, deleteButton);

        info.append(category, title, description, actions);

        card.append(image, info);

        recipeList.appendChild(card);
    });
}

// 3. Add or update a recipe
recipeForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const recipe = {
        name: document.getElementById("recipeName").value.trim(),
        category: document.getElementById("recipeCategory").value.trim(),
        description: document.getElementById("recipeDescription").value.trim(),
        image: document.getElementById("recipeImage").value.trim()
    };

    if (!recipe.name || !recipe.category || !recipe.description) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const url = editingRecipeId
            ? `/api/recipes/${editingRecipeId}`
            : "/api/recipes";

        const method = editingRecipeId ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(recipe)
        });

        if (!response.ok) {
            throw new Error("Unable to save recipe");
        }

        alert(
            editingRecipeId
                ? "Recipe updated successfully!"
                : "Recipe added successfully!"
        );

        recipeForm.reset();

        editingRecipeId = null;

        document.getElementById("submitBtn").textContent = "Add Recipe";

        await loadRecipes();

    } catch (error) {
        alert("Unable to save recipe. Please try again.");
        console.error("Save error:", error);
    }
});

// 4. Edit recipe
function editRecipe(recipe) {

    editingRecipeId = recipe._id;

    document.getElementById("recipeName").value = recipe.name;
    document.getElementById("recipeCategory").value = recipe.category;
    document.getElementById("recipeDescription").value = recipe.description;
    document.getElementById("recipeImage").value = recipe.image || "";

    document.getElementById("submitBtn").textContent = "Update Recipe";

    document.getElementById("add-recipe").scrollIntoView({
        behavior: "smooth"
    });
}

// 5. Delete recipe
async function deleteRecipe(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this recipe?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`/api/recipes/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete recipe");
        }

        alert("Recipe deleted successfully!");

        await loadRecipes();

    } catch (error) {
        alert("Unable to delete recipe.");
        console.error("Delete error:", error);
    }
}

// 6. Filter recipes by category
categoryFilter.addEventListener("change", async function () {

    try {
        const response = await fetch("/api/recipes");

        if (!response.ok) {
            throw new Error("Unable to fetch recipes");
        }

        const recipes = await response.json();

        const selectedCategory = categoryFilter.value;

        const filteredRecipes = selectedCategory === "All"
            ? recipes
            : recipes.filter(recipe =>
                (recipe.category || "").toLowerCase() ===
                selectedCategory.toLowerCase()
            );

        displayRecipes(filteredRecipes);

    } catch (error) {
        console.error("Filter error:", error);
    }
});

// 7. Load recipes when website opens
loadRecipes();