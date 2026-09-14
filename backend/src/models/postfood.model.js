const mon = require("mongoose");

const foodSchema = new mon.Schema({
    chef : {
        type: mon.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },

    foodImage : {
        type : String,
        required : [true,"image is required"]
    },
    foodName : {
        type : String,
        required : [true,"Food Name is required"]
    },
    ingredients : [{
        type : String,
        required : [true,"Ingredients are required"]
    }],
    precautions : {
        type : String,
        required : true,
    },
    description : {
        type : String,
        required : true,
    }
}, { timestamps: true })

foodSchema.index({ chef: 1, createdAt: -1 });
foodSchema.index({ foodName: 1 });

const foodModel = mon.model("foodPosts",foodSchema);
module.exports = foodModel;