require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.DB_CLIENT_URI;
// console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const foodCollection = client.db("shareFoodDB").collection("foods");

    app.get("/foods", async (req, res) => {
      const search = req.query?.search;
      const sort = req.query?.sort;

      let result, filter;

      if (!search && !sort) {
        result = await foodCollection.find().toArray();
      } else {
        filter = {
          foodName: {
            $regex: search,
            $options: "i", // 'i' for case-insensitive
          },
        };
        if (sort === "Expire") {
          result = await foodCollection.find(filter).toArray();
        } else if (sort === "Asc") {
          const sort = {
            expiredAt: 1, //Ascending order
          };
          result = await foodCollection.find(filter).sort(sort).toArray();
        } else if (sort === "Desc") {
          const sort = {
            expiredAt: -1, //Ascending order
          };
          result = await foodCollection.find(filter).sort(sort).toArray();
        }
      }

      res.send(result);
    });

    app.post("/food", async (req, res) => {
      const data = req.body;

      const quantity = Number(data.quantity);

      data.quantity = quantity;

      const result = await foodCollection.insertOne(data);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Share Food, Share Love");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
