require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const app = express();
const cookieParser = require("cookie-parser");

// Middlewares
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

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

    // Generate JWT token
    app.post("/jwt", async (req, res) => {
      // get the email
      const email = req.body;
      // create a token
      const token = jwt.sign(email, process.env.SECRET_KEY, { expiresIn: "365d" });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: "Your token created successfully!" });
    });

    // Clear cookie after successful logout
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ message: "Cookies cleared successfully!" });
    });

    // Verify token
    const verifyToken = (req, res, next) => {
      const token = req.cookies?.token;

      // Check if token exist
      if (!token) return res.status(401).send({ message: "Unauthorized token!" });

      // If token exist, then verify it,
      jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).send({ message: "Unauthorized token!" });

        // Store the token info in the user object
        req.user = decoded;

        // Navigate from the middleware
        next();
      });
    };

    // get all jobs  (GET endpoint)
    app.get("/jobs", async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;
      const sort = req.query.sort;
      let options = { sort: { deadline: sort === "asc" ? 1 : -1 } };
      const size = parseInt(req.query.size);

      // Empty query
      let query = {};
      // Check if search is true,
      if (search) {
        query = {
          jobTitle: {
            $regex: search,
            $options: "i",
          },
        };
      }

      // Check if filter is true,
      if (filter) {
        query.category = filter;
      }

      const jobs = await jobCollection.find(query, options).toArray();
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

    // Get "my bids" and 'bid requests' for a specific user (get Endpoint)
    app.get("/my-bids/:email", verifyToken, async (req, res) => {
      // Decoded email from token
      const decodedEmail = req.user?.email;
      // get the buyer query
      const isBuyer = req.query.buyer;
      // get the email parameter
      const email = req.params.email;
      // query object for filtering mongoDB database
      const query = {};

      // Console decoded user email from token
      // console.log("Email from token------->", decodedEmail);
      // console.log("email from params----->", email);

      if (decodedEmail !== email) return res.status(403).send({ message: "Forbidden Access!" });

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

    // Update bid (PUT Endpoint)
    app.put("/bid/:id", verifyToken, async (req, res) => {
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

    // get "all posted" jobs of a specific user
    app.get("/jobs/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      // Decoded email from token
      const decodedEmail = req.user?.email;
      if (decodedEmail !== email) return res.status(403).send({ message: "Forbidden Access!" });

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
    app.delete("/job/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    });

    // update a job (job/:id)
    app.put("/job/:id", verifyToken, async (req, res) => {
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
    app.post("/add-job", verifyToken, async (req, res) => {
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
