const mon = require("mongoose");

const profileSchema = new mon.Schema({
    user: {
        type: mon.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    fullName : {
        type : String,
    },
    contactNumber  : {
        type : String,
    },
    dateOfBrith : {
        type : Date,
    },
    SocialMedia : [{
        type : String,    
    }],
    profession : {
        type : String,
    },
    hobbies : [{
        type : String,
    }],
    bio : {
        type : String
    }
});

profileSchema.index({ user: 1 }, { unique: true });

const profileModel = mon.model("profile",profileSchema);
module.exports = profileModel;

