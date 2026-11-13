require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const authRoutes = require("./routes/authRoutes");
const dogRoutes = require("./routes/dogRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/dogs", dogRoutes);
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Request is not valid JSON" });
    }
    res.status(500).json({ error: "Something went wrong" });
});

connectDB();

const port = process.env.PORT || 3000;

// Only start the server when this file is run directly, not when tests load it
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}

module.exports = app;