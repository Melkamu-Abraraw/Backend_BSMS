const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
FirstName:{
   type:String,
   required:[true,"FirstName is required"] 
},
LastName:{
    type:String,
    required:[true,"Lastname is required"]
},
phoneNumber:{
    type:String,
    required:[true,"Phonenumber is required"]
},
DOB :{
    type:String,
    required:[true,"DOB is required"]  
},
Experience:{
    type:String,
    required:[true,"Experience is required"]    
},
Gender:{
    type:String,
    required:[true,"Gender is required"] 
},
JobType:{
    type:String,
    required:[true,"JobType is required"] 
},
Skill:{
    type:String,
    required:[true,"Skill is required"]
},
Description:{
    type:String,
    required:[true,"required"]
},
Relatives: [{
    FirstName:{
        type:String,
        required:[true,"Firstname is required"]
    },
    LastName:{
        type:String,
        required:[true,"Lastname is required"]
    },
    Relative:
    {
        type:String,
        required:[true,"Relative is required"]
    },
    Address:
    {
        type:Object,
        required:[true,"Address is required"]
    },
    PhoneNumber:{
        type:String,
        required:[true,"phoneNumber is required"]
    },
    
    imageUrls: [String]
}],
imageUrls: [String]
       
   
 

},{timestamps:true})


const Employee = mongoose.model('Employee',EmployeeSchema)
module.exports = Employee
