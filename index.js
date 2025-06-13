require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const admin = require("firebase-admin");

const decoded = Buffer.from(process.env.FIREBASE_ADMIN_SDK, "base64").toString(
  "utf8"
);

const serviceAccount = JSON.parse(decoded);
// var serviceAccount = require("./spare-a-bite-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());

const verifyToken = async (req, res, next) => {
  const { authorization } = req.headers || "";

  if (!authorization || !authorization.startsWith("Bearer")) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }

  try {
    const token = authorization.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    req.decoded = decoded;

    next();
  } catch (err) {
    return res.status(401).send({ message: "Unauthorized : Invalid token" });
  }
};

const verifyEmail = (req, res, next) => {
  let reqEmail = req.query?.email || "";

  const email = req.decoded?.email;

  console.log(req.decoded);

  console.log("requested email =", reqEmail);
  console.log("token email =", email);

  if (reqEmail !== email) {
    return res.status(403).send({ message: "Forbidden : Access Denied" });
  } else {
    next();
  }
};

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
    // await client.connect();
    // Send a ping to confirm a successful connection

    const foodCollection = client.db("shareFoodDB").collection("foods");
    const reviewsCollection = client.db("shareFoodDB").collection("reviews");
    const requestCollection = client
      .db("shareFoodDB")
      .collection("foodRequests");

    // get featured Foods data

    app.get("/featuredFoods", async (req, res) => {
      const sort = {
        quantity: -1,
      };

      const result = await foodCollection.find().sort(sort).limit(6).toArray();

      res.send(result);
    });

    app.get("/allFoods", async (req, res) => {
      const result = await foodCollection.find().toArray();
      res.send(result);
    });

    app.get("/foods", async (req, res) => {
      const search = req.query?.search;
      const sort = req.query?.sort;

      let result, filter;

      if (!search && !sort) {
        result = await foodCollection.find({ status: "Available" }).toArray();
      } else {
        filter = {
          foodName: {
            $regex: search,
            $options: "i", // 'i' for case-insensitive
          },
          status: "Available",
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
            expiredAt: -1, //Descending order
          };
          result = await foodCollection.find(filter).sort(sort).toArray();
        }
      }

      res.send(result);
    });

    app.get("/food/:id", async (req, res) => {
      const { id } = req.params;

      if (!/^[a-fA-F0-9]{24}$/.test(id)) {
        res.send([]);
      }

      const filter = {
        _id: new ObjectId(id),
      };

      const result = await foodCollection.findOne(filter);

      res.send(result);
    });

    app.post("/food", verifyToken, async (req, res) => {
      const data = req.body;

      const quantity = Number(data.quantity);

      data.quantity = quantity;

      const result = await foodCollection.insertOne(data);
      res.send(result);
    });
    app.delete("/food/:id", verifyToken, async (req, res) => {
      const { id } = req.params;

      const filter = {
        _id: new ObjectId(id),
      };

      const deletfoodId = {
        foodId: id,
      };

      await requestCollection.deleteOne(deletfoodId);

      const result = await foodCollection.deleteOne(filter);

      res.send(result);
    });

    app.post("/food/:id", verifyToken, async (req, res) => {
      const values = req.body;

      values.quantity = Number(values.quantity);

      const filter = {
        _id: new ObjectId(req.params.id),
      };

      const updatedData = {
        $set: values,
      };

      const result = await foodCollection.updateOne(filter, updatedData, {
        upsert: true,
      });

      res.send(result);
    });

    // My Mnanaged Foods

    app.get("/myManagedFoods", verifyToken, verifyEmail, async (req, res) => {
      const { email } = req.query;
      const filter = {
        donorEmail: email,
      };

      const result = await foodCollection.find(filter).toArray();

      for (food of result) {
        const query = {
          foodId: food._id.toString(),
        };

        const requested = await requestCollection.findOne(query);

        food.requested = requested;
      }

      res.send(result);
    });

    // food request get api

    app.get("/foodRequests", verifyToken, verifyEmail, async (req, res) => {
      const email = req.query.email || "none";

      const result = await requestCollection
        .find({ userEmail: email })
        .toArray();

      for (food of result) {
        const foodInfo = await foodCollection.findOne({
          _id: new ObjectId(food.foodId),
        });

        food.foodInfo = foodInfo;
      }

      res.send(result);
    });

    // food req post api
    app.post("/foodRequets", verifyToken, async (req, res) => {
      const reqFoodid = req.body.foodId;

      await foodCollection.updateOne(
        { _id: new ObjectId(reqFoodid) },
        { $set: { status: "Requested" } }
      );

      const result = await requestCollection.insertOne(req.body);

      res.send(result);
    });

    // delete a specific food req

    app.delete("/foodRequests/:id", async (req, res) => {
      // console.log(req.params.id);
      const email = req.query.email || "";

      const reqFood = await requestCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      await foodCollection.updateOne(
        {
          _id: new ObjectId(reqFood.foodId),
        },
        { $set: { status: "Available" } }
      );

      const result = await requestCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });

      res.send(result);
    });

    // edit requested food note patch request

    app.patch(
      "/foodRequests/:id",
      verifyToken,
      verifyEmail,
      async (req, res) => {
        const eamil = req.query?.email || "none";
        // console.log(req.body, req.params.id);

        const query = {
          _id: new ObjectId(req.params.id),
        };

        const updatedInfo = {
          $set: req.body,
        };

        const result = await requestCollection.updateOne(query, updatedInfo);

        res.send(result);
      }
    );

    // reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // post review, checked validity with token

    app.post("/reviews", verifyToken, async (req, res) => {
      const result = await reviewsCollection.insertOne(req.body);
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
