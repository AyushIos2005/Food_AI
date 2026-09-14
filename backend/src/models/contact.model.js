const mon = require("mongoose");
const contactSchema = new mon.Schema({
     user : {
             type: mon.Schema.Types.ObjectId,
             ref: "User"
        },
    
    fullname : {
        type : String,
        required : [true,"Please Provide FullName"]
    },

    address : {
        type : String,
        required : [true,"Please Provide Address"],
    },
    contactno : {
        type : String,
        required : [true,"Please Provide Contact Number"],
    },
    email : {
        type : String,
        required :[true,"Please provide correct email for sending to developer"]
    },
    reason: {
        type : String,
        required : [true,"Please Provide Reason for contact to Developer"]
    }

});

const contactModel = mon.model("contactDevelper",contactSchema);
module.exports = contactModel;