const express = require("express");
const router = express.Router();
const axios = require("axios");

module.exports = (collection, apiKey) => {
    router.post("/addCountry", async (req, res) => {
        const userInput = req.body.country.trim();

        try {
            const existing = await collection.findOne({
                userInputName: { $regex: new RegExp(`^${userInput}$`, "i") },
            });

            if (existing) {
                return res.send(`<h2 style="color:red;">Country already exists in your travel list.</h2><a href="/">Back to Home</a>`);
            }

            const response = await axios.get(
                `https://api.countrylayer.com/v2/name/${encodeURIComponent(userInput)}?access_key=${apiKey}`
            );
            const countryData = response.data[0];

            const userInfo = {
                travelStart: req.body.startDate || "N/A",
                travelEnd: req.body.endDate || "N/A",
                budget: req.body.budget || "N/A",
                accomodation: req.body.accomodation || "N/A",
                tripType: req.body.tripType || "N/A",
                activities: req.body.activities || "N/A",
                numberOfTravellers: req.body.travelers || "N/A",
                ageGroup: req.body.ageGroup || "N/A",
                departureCity: req.body.departure || "N/A",
                preferredCurrency: req.body.currency || "N/A",
                visaStatus: req.body.visaStatus || "N/A",
                description: req.body.notes || "N/A"
            };

            const countryInfo = {
                userInputName: userInput,
                capital: countryData.capital || "N/A",
                region: countryData.region || "N/A",
                dateAdded: new Date(),
                ...userInfo
            };

            await collection.insertOne(countryInfo);
            res.redirect("/seeCountries");
        } catch (error) {
            console.error("API or DB error:", error.message);
            res.status(500).send("Error fetching or saving country data.");
        }
    });

    router.get("/seeCountries", async (req, res) => {
        try {
            const allCountries = await collection.find({}).toArray();
            res.render("seeCountries", { countries: allCountries });
        } catch (err) {
            console.error("Error retrieving countries:", err);
            res.status(500).send("Failed to retrieve countries.");
        }
    });

    return router;

};
