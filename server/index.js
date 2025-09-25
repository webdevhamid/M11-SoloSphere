require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Cluster URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w1xw1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // Main application logic goes here
    // Create a database and make collection for testing purpose
    const database = client.db("soloSphereDB");
    const jobCollection = database.collection("jobs");
    const bidCollection = database.collection("bids");

    app.get("/bids", async (req, res) => {
      const bids = await bidCollection.find().toArray();
      res.send(bids);
    });

    // get all jobs  (GET endpoint)
    app.get("/jobs", async (req, res) => {
      const jobs = await jobCollection.find().toArray();
      res.send(jobs);
    });

    // place a new bid  (post endpoint)
    app.post("/add-bid", async (req, res) => {
      // Get the bid data
      const bid = req.body;

      // Check If the user has already placed a bid on this job
      const duplicateBidFilter = { jobId: bid.jobId, email: bid.email };
      const checkDuplicateBid = await bidCollection.findOne(duplicateBidFilter);

      // Return immediately if there is a duplicate bid
      if (checkDuplicateBid)
        return res.status(400).send("You already have placed bid on this job!");

      // If everything is fine, then insert the bid
      const result = await bidCollection.insertOne(bid);

      // Increment Bid Count in jobs collection
      const filter = { _id: new ObjectId(bid.jobId) };
      const updateBid = {
        $inc: {
          bidCount: 1,
        },
      };
      const updateBidCount = await jobCollection.updateOne(filter, updateBid);

      res.send(result);
    });

    // Get all bids and 'bid requests' for a user (get Endpoint)
    app.get("/my-bids/:email", async (req, res) => {
      // get the buyer query
      const isBuyer = req.query.buyer;
      // get the email parameter
      const email = req.params.email;
      const query = {};
      // Check if isBuyer is true
      if (isBuyer) {
        // add buyer property to the query obj
        query.buyer = email;
      } else {
        // add email property to the query obj
        query.email = email;
      }
      // get the result from bidCollection
      const result = await bidCollection.find(query).toArray();
      res.send(result);
    });

    // Update "bid requests" status
    app.patch("/update-bid-request/:id", async (req, res) => {
      // Get the ID
      const id = req.params.id;

      // New updated Status from the client
      const { newStatus } = req.body;

      // update the DB status
      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: { status: newStatus },
      };
      const result = await bidCollection.updateOne(filter, update);
      res.send(result);
    });

    // get bids
    app.get("/bid/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await bidCollection.find(query).toArray();
      res.send(result);
    });

    // Update bid (PUT Endpoint)
    app.put("/bid/:id", async (req, res) => {
      const bidId = req.params.id;
      const { price, comment, deadline } = req.body;

      const filter = { _id: new ObjectId(bidId) };
      const updateBid = {
        $set: {
          price,
          comment,
          deadline,
        },
      };

      const result = await bidCollection.updateOne(filter, updateBid);
      res.send(result);
    });

    // get all posted jobs of a specific user
    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { "buyer.email": email };
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    });

    // Get a specific job based on job_id
    app.get("/job/:id", async (req, res) => {
      const jobId = req.params.id;
      const query = { _id: new ObjectId(jobId) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    // delete a job
    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // update a job (job/:id)
    app.put("/job/:id", async (req, res) => {
      const { jobId, jobTitle, email, deadline, category, minPrice, maxPrice, description } =
        req.body;

      const filter = { _id: new ObjectId(jobId) };
      const updateJob = {
        $set: {
          jobTitle,
          email,
          deadline,
          category,
          minPrice,
          maxPrice,
          description,
        },
      };
      const result = await jobCollection.updateOne(filter, updateJob);

      res.send(result);
    });

    // post a new job (POST endpoint)
    app.post("/add-job", async (req, res) => {
      const job = req.body;
      const result = await jobCollection.insertOne(job);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from SoloSphere Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
