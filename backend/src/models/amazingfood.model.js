const mongoose = require("mongoose");


/*
=========================================
AI GENERATED RECIPE SCHEMA
=========================================
*/

const recipeSchema = new mongoose.Schema(
    {

        recipeName: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        ingredients: {
            type: [String],
            default: []
        },

        servings: {
            type: Number,
            default: null
        },

        preparationTime: {
            type: String,
            default: ""
        },

        instructions: {
            type: [String],
            default: []
        },

        proteinSources: {
            type: [String],
            default: []
        },

        proteinPerServing: {
            type: String,
            default: ""
        },

        caloriesPerServing: {
            type: String,
            default: ""
        },

        medicalConsiderations: {
            type: [String],
            default: []
        }

    },
    {
        _id: false
    }
);


/*
=========================================
RECREATE EXISTING FOOD RECIPE SCHEMA
=========================================
*/

const recreateRecipeSchema = new mongoose.Schema(
    {

        newFoodName: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        originalFood: {
            type: String,
            trim: true,
            default: ""
        },

        addedIngredients: {
            type: [String],
            default: []
        },

        ingredients: {
            type: [String],
            default: []
        },

        preparationTime: {
            type: String,
            default: ""
        },

        instructions: {
            type: [String],
            default: []
        },

        proteinSources: {
            type: [String],
            default: []
        },

        proteinPerServing: {
            type: String,
            default: ""
        },

        caloriesPerServing: {
            type: String,
            default: ""
        }

    },
    {
        _id: false
    }
);


/*
=========================================
MODEL 1
CREATE PROTEIN RICH FOOD
=========================================
*/

const amazeSchema = new mongoose.Schema(
    {

        /*
        =====================================
        USER
        =====================================
        */

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },


        /*
        =====================================
        USER INPUT
        =====================================
        */

        ingredient: {
            type: [String],
            required: [
                true,
                "Please provide us ingredient for create your protein rich recipe"
            ]
        },

        numberofperson: {
            type: Number,
            required: [
                true,
                "Please provide us no. of person to give you perfect recipe"
            ],

            min: 1
        },

        anyMedical: {
            type: String,
            trim: true,
            default: ""
        },


        /*
        =====================================
        AI GENERATED RECIPE
        =====================================
        */

        recipe: {
            type: recipeSchema,
            required: true
        },


        /*
        =====================================
        DELETED AI SOLUTION
        =====================================

        Delete hone ke baad recipe yahan save
        hogi, taaki Undo kiya ja sake.
        =====================================
        */

        deletedAIsolution: {
            type: recipeSchema,
            default: null
        },


        /*
        =====================================
        DELETE STATUS
        =====================================
        */

        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },


        /*
        =====================================
        DELETE TIME
        =====================================
        */

        deletedAt: {
            type: Date,
            default: null
        },


        /*
        =====================================
        RESTORE TIME
        =====================================
        */

        restoredAt: {
            type: Date,
            default: null
        },


        /*
        =====================================
        QUEUE POSITION
        =====================================

        Har generated AI solution ko unique
        queue position milega.

        Date.now() use kar sakte ho.
        =====================================
        */

        queuePosition: {
            type: Number,
            required: true,
            index: true
        }

    },
    {
        timestamps: true
    }
);


/*
=========================================
MODEL 2
RECREATE EXISTING FOOD
=========================================
*/

const createNewFoodSchema = new mongoose.Schema(
    {

        /*
        =====================================
        USER
        =====================================
        */

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },


        /*
        =====================================
        EXISTING FOOD
        =====================================
        */

        existingFoodname: {
            type: String,
            required: [
                true,
                "Please give us existing Food Name"
            ],
            trim: true
        },


        /*
        =====================================
        ADD ON INGREDIENT
        =====================================
        */

        AddOnIngredient: {
            type: [String],
            required: [
                true,
                "Please provide us your ingredient to add in the existing food to create a new meal"
            ]
        },


        /*
        =====================================
        AI GENERATED RECIPE
        =====================================
        */

        recipe: {
            type: recreateRecipeSchema,
            required: true
        },


        /*
        =====================================
        DELETED AI SOLUTION
        =====================================

        Delete hone par recipe yahan preserve
        hogi for Undo.
        =====================================
        */

        deletedAIsolution: {
            type: recreateRecipeSchema,
            default: null
        },


        /*
        =====================================
        DELETE STATUS
        =====================================
        */

        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },


        /*
        =====================================
        DELETE TIME
        =====================================
        */

        deletedAt: {
            type: Date,
            default: null
        },


        /*
        =====================================
        RESTORE TIME
        =====================================
        */

        restoredAt: {
            type: Date,
            default: null
        },


        /*
        =====================================
        QUEUE POSITION
        =====================================
        */

        queuePosition: {
            type: Number,
            required: true,
            index: true
        }

    },
    {
        timestamps: true
    }
);


/*
=========================================
INDEXES
=========================================
*/


/*
Protein Recipe Indexes
*/

amazeSchema.index({
    userId: 1,
    createdAt: -1
});

amazeSchema.index({
    userId: 1,
    isDeleted: 1,
    deletedAt: -1
});

amazeSchema.index({
    userId: 1,
    queuePosition: 1
});


/*
Recreated Food Indexes
*/

createNewFoodSchema.index({
    userId: 1,
    createdAt: -1
});

createNewFoodSchema.index({
    userId: 1,
    isDeleted: 1,
    deletedAt: -1
});

createNewFoodSchema.index({
    userId: 1,
    queuePosition: 1
});


/*
=========================================
CREATE MODELS
=========================================
*/

const amzeModel = mongoose.model(
    "azme",
    amazeSchema
);


const createNewFoodModel = mongoose.model(
    "New_Food",
    createNewFoodSchema
);


/*
=========================================
EXPORT
=========================================
*/

module.exports = {
    amzeModel,
    createNewFoodModel
};