const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
const PORT = 3000;

const mongoURL = "mongodb://127.0.0.1:27017";
const client = new MongoClient(mongoURL);

let recipes;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Get all recipes
app.get("/api/recipes", async (req, res) => {
    try {
        const data = await recipes.find({}).toArray();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Unable to fetch recipes" });
    }
});

// Add a new recipe
app.post("/api/recipes", async (req, res) => {
    try {
        const { name, category, description, image } = req.body;

        if (!name || !category || !description) {
            return res.status(400).json({
                message: "Name, category and description are required"
            });
        }

        const result = await recipes.insertOne({
            name,
            category,
            description,
            image: image || ""
        });

        res.status(201).json({
            message: "Recipe added successfully!",
            insertedId: result.insertedId
        });
    } catch (error) {
        res.status(500).json({ message: "Unable to add recipe" });
    }
});

// Update an existing recipe
app.put("/api/recipes/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid recipe ID" });
        }

        const { name, category, description, image } = req.body;

        if (!name || !category || !description) {
            return res.status(400).json({
                message: "Name, category and description are required"
            });
        }

        const result = await recipes.updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    name,
                    category,
                    description,
                    image: image || ""
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.json({ message: "Recipe updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Unable to update recipe" });
    }
});

// Delete a recipe
app.delete("/api/recipes/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid recipe ID" });
        }

        const result = await recipes.deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Recipe not found" });
        }

        res.json({ message: "Recipe deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Unable to delete recipe" });
    }
});

// Connect to MongoDB and start server
async function startServer() {
    try {
        await client.connect();

        const database = client.db("RecipeDB");
        recipes = database.collection("Recipes");

        console.log("Connected to MongoDB successfully!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

startServer();