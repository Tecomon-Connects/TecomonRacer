import express from "express";
import ViteExpress from "vite-express";
import { MongoClient } from "mongodb";

const app = express();
const client = new MongoClient(
  process.env.MONGO_URI || "mongodb://localhost:27017"
);

app.get("/savescoreboard", async (req, res) => {
  if (!req.query.name || !req.query.time) {
    res.send("Invalid request");
    return;
  }
  try {
    await client.connect();
    const database = client.db("scoreboard");
    const collection = database.collection("scores");
    const existing = await collection.findOne({ name: req.query.name });
    if (existing && parseInt(existing.time) < parseInt(req.query.time)) {
      res.send("Score already exists and is better");
      return;
    } else if (existing) {
      await collection.updateOne(
        { name: req.query.name },
        { $set: { time: NumberLong(req.query.time), date: new Date() } }
      );
    } else {
      await collection.insertOne({
        name: req.query.name,
        time: NumberLong(req.query.time),
        date: new Date(),
      });
    }
  } catch (e) {
    console.error(e);
    res.send("Error saving to scoreboard");
    return;
  }
  res.send("Saved to scoreboard");
});

app.get("/getscoreboard", async (req, res) => {
  try {
    await client.connect();
    const database = client.db("scoreboard");
    const collection = database.collection("scores");
    const scores = await collection
      .find()
      .sort({ time: 1 })
      .limit(10)
      .toArray();
    res.send(JSON.stringify(scores));
  } catch (e) {
    console.error(e);
    res.send("Error getting scoreboard");
    return;
  }
});

ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));
