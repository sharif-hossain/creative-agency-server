const express = require('express')
const app = express()
const port = 5000
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const ObjectID = require('mongodb').ObjectID;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('addServices'));
app.use(express.static('addOrderImg'));
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.wwwk6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collectionAdmin = client.db(process.env.DB_NAME).collection("agencies");
  const adminCollection = client.db(process.env.DB_NAME).collection("admin");
  const serviceCollection = client.db(process.env.DB_NAME).collection("services");
  const clientOrderCollection = client.db(process.env.DB_NAME).collection("clientOrders");
  const reviewCollection = client.db(process.env.DB_NAME).collection("clientReviews");
  console.log('db connected')

app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    file.mv(`${__dirname}/addServices/${file.name}`, err => {
        if (err) {
            return res.send({ message: 'File Upload Failed' });
        }
        return res.send({ name: file.name, path: `/${file.name}` });
    });
    const image = file.name;
    collectionAdmin.insertOne({ title, description, image })
        .then(result => {
            res.send(result.insertedCount > 0)
        });
});


app.post('/addAdmin', (req, res) => { 
    adminCollection.insertOne(req.body)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
});


app.post('/isAdmin', (req, res) => {
    adminCollection.find({ email: req.body.email })
        .toArray((err, data) => {
            res.send(data.length > 0)
        })
});


//get all services list

app.get('/getServices', (req, res) => {
    collectionAdmin.find({})
        .toArray((err, data) => {
            res.send(data);
        })
});

//get all order list by adminCollection
app.get('/allServices', (req, res) => {
    clientOrderCollection.find({})
        .toArray((err, data) => {
            res.send(data);
        })
});

//addd client order
app.post('/addOrder', (req, res) =>{
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const serviceName = req.body.serviceName;
        const projectDetail = req.body.projectDetail;
        const price = req.body.price;
        const status = 'Pending';
        const orderId = req.body.orderId;

        file.mv(`${__dirname}/addOrderImg/${file.name}`, err => {
            if (err) {
                return res.send({ message: 'File Upload Failed' });
            }
            return res.send({ name: file.name, path: `/${file.name}` });
        });
        const image = file.name;

    clientOrderCollection.insertOne({ name, email, serviceName, projectDetail, price, status,orderId, image})
    .then(result =>{
        res.send(result.insertedCount>0)
    })
})

//particular user order list

app.get('/orderList', (req,res)=>{
    
    clientOrderCollection.find({email:req.query.email})
    .toArray((err,documents) =>{
        res.send(documents);
    })
})
//get particular id
app.get('/getOrderId', (req, res) => { 
    collectionAdmin.find({ _id: ObjectID(req.query.id) })
        .toArray((err, documents) => {
            res.status(200).send(documents[0]);
        })
});
//review collection
app.post('/addReview', (req, res) => { 
    reviewCollection.insertOne(req.body)
        .then(result => {
            res.status(200).send(result.insertedCount > 0)
        })
});

//find client review

app.get('/getReview', (req, res)=>{
    reviewCollection.find({}).limit(3)
    .toArray((err, documents)=>{
        res.send(documents)
    })
})

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)