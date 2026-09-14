const mon = require("mongoose");

const feedbackSchema = new mon.Schema({
    user : {
         type: mon.Schema.Types.ObjectId,
         ref: "User"
    },
    rating : {
        type : Number,
    }
});

const feedbackModel = mon.model("feedback",feedbackSchema);
module.exports = feedbackModel;
