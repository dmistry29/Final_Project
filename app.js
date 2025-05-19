const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
require("dotenv").config({ path: path.resolve(__dirname, "Environment/.env") });
const { MongoClient, ServerApiVersion } = require("mongodb");
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.join(__dirname, "style")));
const axios = require("axios");

const portNumber = 5001;

const databaseName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;
const uri = process.env.MONGO_KEY;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

(async () => {
    try {
        await client.connect();
    } catch (e) {
        console.error(e);
    }
})();

const database = client.db(databaseName);
const collection = database.collection(collectionName);
const apiKey = process.env.COUNTRYLAYER_KEY;

// Import the router and pass in collection and apiKey
const countryRoutes = require("./routes/countryRoutes")(collection, apiKey);

// Routes not using router
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/addCountry", (req, res) => {
    res.render("addCountry");
});

// Use router for /addCountry and /seeCountries
app.use("/", countryRoutes);

app.listen(portNumber, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Web server started and running at http://localhost:${portNumber}`);
    }
});