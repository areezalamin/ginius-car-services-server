const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

require('dotenv').config();


//Middleware
app.use(cors());
app.use(express.json());

//${process.env.DB_USER}
//${process.env.DB_PASS}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjb0css.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    const serviceCollection = client.db("geniusCar").collection("service");

    app.get('/service', async(req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

      app.get('/service/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const service = await serviceCollection.findOne(query);
        res.send(service);
      });

      //POST....

    app.post('/service', async(req, res) =>{
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      res.send(result)
    });

    //DELETE...
    app.delete('/service/:id', async(req, res) =>{
      const id = req.params.id;
      const query ={_id : new ObjectId(id)};
      const result = await serviceCollection.deleteOne(query);
      res.send(result);

    })

    console.log("Genius car db connected.");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Genius car service server running');
});

app.listen(port, (req, res)=>{
    console.log('I am genius car service server',port)
})