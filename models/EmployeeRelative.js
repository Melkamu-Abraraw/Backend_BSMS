const mongoose = require('mongoose')
const Schema = mongoose.Schema
const employeeRelativeScehma = new Schema({
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
employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
imageUrls: [String]
}
,{timestamps:true})
const EmployeeRelative= mongoose.model('EmployeeRelative',employeeRelativeScehma)
module.exports = EmployeeRelative