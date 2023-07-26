const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

require('dotenv').config();


//Middleware
app.use(cors());
app.use(express.json());

function verifyJwt (req, res, next) {
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message : 'Unauthoraized access.'})
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    if(err){
      return res.status(403).send({message: 'Forbiden Access.'});
    }
    console.log('decoded', decoded);
    req.decoded = decoded;
    next();
  })

}

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
    const orderCollection = client.db("geniusCar").collection("order");

    // Auth
    app.post('/login', async(req, res)=>{
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15555'
      })
      res.send({accessToken});
    });

    //Service
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

    });

    //Order load...
    
    app.get('/order', verifyJwt, async(req, res) =>{
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if(email === decodedEmail){
        const query ={email: email};
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
      }
      else{
        res.status(403).send({message: 'Forbidden Access'});
      }
    });

    //Order Post...
    app.post('/order', async(req, res)=>{
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

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