const {
    amzeModel,
    createNewFoodModel
} = require("../models/amazingfood.model");

const {
    generateProteinRecipe,
    recreateFood
} = require("../services/ai.service");


/*
=========================================
CREATE PROTEIN RICH FOOD
=========================================
*/

async function CreateFood(req, res) {

    try {

        const {
            ingredient,
            numberofperson,
            anyMedical
        } = req.body;


        /*
        ==============================
        USER
        ==============================
        */

        const userId = req.user?.id || req.auth?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }


        /*
        ==============================
        VALIDATION
        ==============================
        */

        if (
            !ingredient ||
            !Array.isArray(ingredient) ||
            ingredient.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message: "Please provide at least one ingredient"

            });

        }


        if (
            !numberofperson ||
            Number(numberofperson) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message: "Please provide valid number of persons"

            });

        }


        /*
        ==============================
        AI GENERATION
        ==============================
        */

        const recipe = await generateProteinRecipe({

            ingredient,

            numberofperson: Number(numberofperson),

            anyMedical: anyMedical || ""

        });


        /*
        ==============================
        SAVE AI HISTORY
        ==============================
        */

        const food = await amzeModel.create({

            userId,

            ingredient,

            numberofperson: Number(numberofperson),

            anyMedical: anyMedical || "",

            recipe,

            queuePosition: Date.now(),

            isDeleted: false

        });


        /*
        ==============================
        RESPONSE
        ==============================
        */

        return res.status(201).json({

            success: true,

            message: "Protein rich recipe generated successfully",

            data: food

        });

    } catch (error) {

        console.error(
            "CreateFood Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to generate food"

        });

    }

}


/*
=========================================
GET ALL PROTEIN FOODS
=========================================
*/

async function GetFood(req, res) {

    try {

        const userId = req.user?.id || req.auth?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }


        const foods = await amzeModel
            .find({

                userId,

                isDeleted: false

            })
            .sort({

                queuePosition: -1

            })
            .lean();


        return res.status(200).json({

            success: true,

            count: foods.length,

            data: foods

        });

    } catch (error) {

        console.error(
            "GetFood Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch foods"

        });

    }

}


/*
=========================================
RECREATE EXISTING FOOD
=========================================
*/

async function ReCreateExisting(req, res) {

    try {

        const {
            existingFoodname,
            AddOnIngredient
        } = req.body;


        /*
        ==============================
        USER
        ==============================
        */

        const userId = req.user?.id || req.auth?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }


        /*
        ==============================
        VALIDATION
        ==============================
        */

        if (!existingFoodname) {

            return res.status(400).json({

                success: false,

                message: "Please provide existing food name"

            });

        }


        if (
            !AddOnIngredient ||
            !Array.isArray(AddOnIngredient) ||
            AddOnIngredient.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message: "Please provide at least one addon ingredient"

            });

        }


        /*
        ==============================
        AI GENERATION
        ==============================
        */

        const recipe = await recreateFood({

            existingFoodname,

            AddOnIngredient

        });


        /*
        ==============================
        SAVE AI HISTORY
        ==============================
        */

        const food = await createNewFoodModel.create({

            userId,

            existingFoodname,

            AddOnIngredient,

            recipe,

            queuePosition: Date.now(),

            isDeleted: false

        });


        /*
        ==============================
        RESPONSE
        ==============================
        */

        return res.status(201).json({

            success: true,

            message: "New food created successfully",

            data: food

        });

    } catch (error) {

        console.error(
            "ReCreateExisting Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to recreate food"

        });

    }

}


/*
=========================================
GET ALL RECREATED FOOD
=========================================
*/

async function GetReCreateExisting(req, res) {

    try {

        const userId = req.user?.id || req.auth?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }


        const foods = await createNewFoodModel
            .find({

                userId,

                isDeleted: false

            })
            .sort({

                queuePosition: -1

            })
            .lean();


        return res.status(200).json({

            success: true,

            count: foods.length,

            data: foods

        });

    } catch (error) {

        console.error(
            "GetReCreateExisting Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch recreated foods"

        });

    }

}


/*
==============================================
GET MY COMPLETE AI HISTORY
==============================================

Protein + Recreated Food
dono ek response mein
==============================================
*/

async function GetMyHistory(req, res) {

    try {

        const userId = req.user?.id || req.auth?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }


        /*
        ======================================
        FETCH BOTH MODELS
        ======================================
        */

        const [
            proteinHistory,
            recreatedHistory
        ] = await Promise.all([

            amzeModel
                .find({

                    userId,

                    isDeleted: false

                })
                .lean(),

            createNewFoodModel
                .find({

                    userId,

                    isDeleted: false

                })
                .lean()

        ]);


        /*
        ======================================
        ADD TYPE
        ======================================
        */

        const proteinData = proteinHistory.map(item => ({

            ...item,

            historyType: "protein_recipe"

        }));


        const recreatedData = recreatedHistory.map(item => ({

            ...item,

            historyType: "recreated_food"

        }));


        /*
        ======================================
        MERGE
        ======================================
        */

        const history = [

            ...proteinData,

            ...recreatedData

        ];


        /*
        ======================================
        QUEUE ORDER
        ======================================
        */

        history.sort(

            (a, b) =>
                b.queuePosition - a.queuePosition

        );


        return res.status(200).json({

            success: true,

            count: history.length,

            data: history

        });

    } catch (error) {

        console.error(
            "GetMyHistory Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch AI history"

        });

    }

}


/*
==============================================
GET MY HISTORY BY ID
==============================================

Protein aur recreated dono mein search
==============================================
*/

async function GetMyHistoryById(req, res) {

    try {

        const userId = req.user?.id || req.auth?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.params;


        if (!id) {

            return res.status(400).json({

                success: false,

                message: "History ID is required"

            });

        }


        /*
        ======================================
        SEARCH PROTEIN MODEL
        ======================================
        */

        let history = await amzeModel
            .findOne({

                _id: id,

                userId,

                isDeleted: false

            })
            .lean();


        let historyType = "protein_recipe";


        /*
        ======================================
        SEARCH RECREATED MODEL
        ======================================
        */

        if (!history) {

            history = await createNewFoodModel
                .findOne({

                    _id: id,

                    userId,

                    isDeleted: false

                })
                .lean();


            historyType = "recreated_food";

        }


        /*
        ======================================
        NOT FOUND
        ======================================
        */

        if (!history) {

            return res.status(404).json({

                success: false,

                message: "AI history not found"

            });

        }


        return res.status(200).json({

            success: true,

            data: {

                ...history,

                historyType

            }

        });

    } catch (error) {

        console.error(
            "GetMyHistoryById Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch AI history"

        });

    }

}


/*
==============================================
DELETE MY HISTORY
==============================================

SOFT DELETE

recipe
   ↓
deletedAIsolution

Actual document delete nahi hoga.
==============================================
*/

async function DeleteMyHistory(req, res) {

    try {

        const userId = req.user?.id || req.auth?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.params;


        if (!id) {

            return res.status(400).json({

                success: false,

                message: "History ID is required"

            });

        }


        /*
        ======================================
        SEARCH PROTEIN
        ======================================
        */

        let history = await amzeModel.findOne({

            _id: id,

            userId,

            isDeleted: false

        });


        let historyType = "protein_recipe";


        /*
        ======================================
        SEARCH RECREATED
        ======================================
        */

        if (!history) {

            history = await createNewFoodModel.findOne({

                _id: id,

                userId,

                isDeleted: false

            });

            historyType = "recreated_food";

        }


        /*
        ======================================
        NOT FOUND
        ======================================
        */

        if (!history) {

            return res.status(404).json({

                success: false,

                message: "AI history not found"

            });

        }


        /*
        ======================================
        SAVE SOLUTION FOR UNDO
        ======================================
        */

        history.deletedAIsolution = history.recipe;


        /*
        ======================================
        SOFT DELETE
        ======================================
        */

        history.isDeleted = true;

        history.deletedAt = new Date();


        await history.save();


        return res.status(200).json({

            success: true,

            message: "AI solution deleted successfully",

            data: {

                id: history._id,

                historyType,

                deletedAt: history.deletedAt

            }

        });

    } catch (error) {

        console.error(
            "DeleteMyHistory Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to delete AI history"

        });

    }

}


/*
==============================================
DELETE ALL MY HISTORY
==============================================

Actual delete nahi hoga.

Sab deletedAIsolution mein preserve hoga.
==============================================
*/

async function DeleteAllMyHistory(req, res) {

    try {

        const userId = req.user?.id || req.auth?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const deletedAt = new Date();

        const [proteinResult, recreatedResult] = await Promise.all([
            amzeModel.updateMany(
                { userId, isDeleted: false },
                [{ $set: { deletedAIsolution: "$recipe", isDeleted: true, deletedAt } }]
            ),
            createNewFoodModel.updateMany(
                { userId, isDeleted: false },
                [{ $set: { deletedAIsolution: "$recipe", isDeleted: true, deletedAt } }]
            )
        ]);

        const deletedCount =
            (proteinResult.modifiedCount || 0) +
            (recreatedResult.modifiedCount || 0);

        return res.status(200).json({

            success: true,

            message: "All AI history deleted successfully",

            deletedCount

        });

    } catch (error) {

        console.error(
            "DeleteAllMyHistory Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to delete all AI history"

        });

    }

}


/*
==============================================
UNDO MY HISTORY
==============================================

Deleted recipe
      ↓
deletedAIsolution
      ↓
recipe

isDeleted = false
==============================================
*/

async function UndoMyHistory(req, res) {

    try {

        const userId = req.user?.id || req.auth?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.params;


        if (!id) {

            return res.status(400).json({

                success: false,

                message: "History ID is required"

            });

        }

        let history = await amzeModel.findOne({

            _id: id,

            userId,

            isDeleted: true

        });


        let historyType = "protein_recipe";

        if (!history) {

            history =
                await createNewFoodModel.findOne({

                    _id: id,

                    userId,

                    isDeleted: true

                });

            historyType = "recreated_food";

        }
        if (!history) {

            return res.status(404).json({

                success: false,

                message: "Deleted AI solution not found"

            });

        }

        if (!history.deletedAIsolution) {

            return res.status(400).json({

                success: false,

                message: "No deleted AI solution available for restore"

            });

        }


        history.recipe =
            history.deletedAIsolution;

        history.deletedAIsolution = null;

        history.isDeleted = false;

        history.deletedAt = null;

        history.restoredAt = new Date();


        await history.save();


        return res.status(200).json({

            success: true,

            message: "AI solution restored successfully",

            data: {

                ...history.toObject(),

                historyType

            }

        });

    } catch (error) {

        console.error(
            "UndoMyHistory Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to restore AI solution"

        });

    }

}


/*
==============================================
EXPORT
==============================================
*/

module.exports = {

    CreateFood,

    GetFood,

    ReCreateExisting,

    GetReCreateExisting,

    GetMyHistory,

    GetMyHistoryById,

    DeleteMyHistory,

    DeleteAllMyHistory,

    UndoMyHistory

};