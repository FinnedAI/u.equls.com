import express from "express";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from a .env file

const app = express();
const port = 3000;

// Connect to MongoDB
let db, users, stats;

(async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db(); // Use the default database
    users = db.collection("users");
    stats = db.collection("stats");
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
})();

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.resolve("views")); // Ensure views are served from the correct directory

// Define the route
app.get("/:ticker", async (req, res) => {
  const ticker = req.params.ticker;

  try {
    const user = await users.findOne({ ticker });
    if (!user) {
      return res.status(404).send("User not found.");
    }

    const userStats = await stats.findOne({ _id: new ObjectId(user._id) });
    res.render("ticker", { user, stats: userStats });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
