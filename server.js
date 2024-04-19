const express = require("express");

const mongoose = require("mongoose");
const url = "mongodb://0.0.0.0:27017/User";

//const BSMS_MONGO_URL =
//"mongodb+srv://BSMS:BSMS012345@bsms.f0yihgr.mongodb.net/User?retryWrites=true&w=majority&appName=bsms";
//.connect(BSMS_MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const app = express();
mongoose
  .connect(url, {})
  .then((_result) => console.log("database connected"))
  .catch((err) => console.log(err));

const AuthRoute = require("./routes/auth");
const HouseRoutes = require("./routes/HouseRoutes");
const brokerCompaniesRoutes = require("./routes/brokerCompaniesRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const landRoutes = require("./routes/landRoutes");
const employee = require("./routes/employeeRoutes");
const Allproperty = require("./routes/Allproperty");
const commissionroutes = require("./routes/commissionroutes");
const cors = require("cors");
app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions)) 
app.use("/api/User", AuthRoute);

app.use("/api/House", HouseRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/Land", landRoutes);
app.use("/api/Employee", employee);
app.use("/api/brokerCompanies", brokerCompaniesRoutes);
app.use("/api/Allproperty", Allproperty);
app.use("/api/commission", commissionroutes);

app.listen(3001, () => {
  console.log("Node API App is running on port 3001 ");
});
