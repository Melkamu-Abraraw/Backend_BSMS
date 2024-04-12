const mongoose = require('mongoose');
const Schema = mongoose.Schema

const LandSchema = new Schema({
    ContractType: {
        type: String,
        required:[true,"ContractType is required!"]
    },
    Area:{
        type:Number,
        required:[true,"Area is required!"]
    },
    Location:{
        type:Object,
        required:[true,"Location is required!"]
    },
    City:{
        type:String,
        required:[true,"city is required!"]
    },
    Description:{
        type:String,
        required:[true,"Description info is required!"]
    },
    Price: {
        type:Number,
        required:[true,"Price is required!"]
    },
    Rating:{
        type:Number
    },
    Status:{
        type:String,
        enum:['Pending','Approved','Rejected'],
        default: 'Pending'
    },
    approvedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    Broker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' 
    },
  
   UploadedBy:{
   type:String
    },
    PropertyType:{
        type: String,
        default:'Land'
    },
    
    imageUrls: [String],
    documentUrls:[String],
       
   
 

},{timestamps:true})

const Land = mongoose.model('Land',LandSchema)
module.exports = Land
