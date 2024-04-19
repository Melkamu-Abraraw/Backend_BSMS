const mongoose = require("mongoose");
const House = require("../models/House");
const Land = require("../models/Land");
const Vehicle = require("../models/Vehicle");
const jwt = require("jsonwebtoken");

// Fisher-Yates (aka Knuth) Shuffle Algorithm
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const fetchAllValues = async (req, res) => {
  try {
    // Fetch data from all collections concurrently
    const [houses, lands, vehicles] = await Promise.all([
      House.find({ Status: "Approved" }).populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }),
      Land.find({ Status: "Approved" }).populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }),
      Vehicle.find({ Status: "Approved" }).populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }),
    ]);

    // Merge arrays into one array
    let allProperties = [...houses, ...lands, ...vehicles];

    // Shuffle the array
    allProperties = shuffleArray(allProperties);

    res.json({ success: true, data: allProperties });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ success: false, error: "An error occurred while fetching data" });
  }
};

const fetchProperty = async (req, res) => {
  try {
    // Decode the token sent from the frontend
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Token is missing." });
    }
    const decodedToken = jwt.verify(token.split(" ")[1], "AZQ,PI)0(");
    if (!decodedToken) {
      return res.status(401).json({ success: false, error: "Invalid token." });
    }

    const userEmail = decodedToken.Email;
    // Fetch data from all collections concurrently
    const [houses, lands, vehicles] = await Promise.all([
      House.find({ 
        UploadedBy: userEmail}).populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }),
      Land.find({ 
        UploadedBy: userEmail}).populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }),
      Vehicle.find({ uploadedby: userEmail}).populate({
        path: "Broker",
        select: "FirstName LastName Phone",
      }),
    ]);

    // Merge arrays into one array
    console.log(houses)
    console.log(lands)
    console.log(vehicles)
    let allProperties = [...houses, ...lands, ...vehicles];
    // Shuffle the array
    allProperties = shuffleArray(allProperties);
    res.json({ success: true, data: allProperties });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ success: false, error: "An error occurred while fetching data" });
  }
}

module.exports = { fetchAllValues,fetchProperty };
