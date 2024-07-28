const express = require("express");
const bcrypt = require('bcrypt');
const cors = require("cors")
const app = express()
const port = process.env.PORT || 5000;
require("dotenv").config()
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    optionSuccessStatus: 200,
}

// middleware
app.use(cors(corsOptions))
app.use(express.json())



// mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://payment:WW2y5s3xSiWMqR4x@cluster0.iagloem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
    const registerUser = client.db("PaymentApp").collection("registration");

    app.post("/registration", async (req,res) => {
      // console.log(req.body)
      const salt = 10;
      const userData = req.body;
      const {pin,email,status,mobile,name} = userData;
      const hashPassword = await bcrypt.hash(pin, salt)
      const allReadyExist = await registerUser.findOne({email : email});
      if(allReadyExist){
        return  res.status(422).send({error : "Email allready Exist"});
      }
      // console.log(userData)
      const result = await registerUser.insertOne({pin : hashPassword,email,status,mobile,name});
      res.send(result);
    })
    app.post("/login", async (req,res) => {
      // console.log(req.body)
      const {password,useremail} = req.body;
      const resultEmail = await registerUser.findOne({email : useremail});
      console.log(resultEmail)
      if(resultEmail){
        const match = await bcrypt.compare(password, resultEmail.pin);
        if(!match){
          res.status(422).send({error : "Invalid details"})
        }else{
          res.status(200).send("login success")
        }
      }
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req,res) => {
    res.send('Hello World!')
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})