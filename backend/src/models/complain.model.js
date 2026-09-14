const mon = require("mongoose");

const complainSchema = new mon.Schema({
   user : {
            type: mon.Schema.Types.ObjectId,
            ref: "User"
       },
    complainMessage : {
        type : String,
        required : [true,"Please give register your complain"]
    }
})

const complainModel = mon.model("complain",complainSchema);
module.exports = complainModel;