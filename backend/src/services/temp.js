const createFoodData = {

    ingredient: [
        "Paneer",
        "Oats",
        "Tomato",
        "Onion",
        "Capsicum"
    ],

    numberofperson: 2,

    anyMedical: "No medical condition"

};


/*
=========================================
RECREATE FOOD REQUEST
=========================================
*/

const recreateFoodData = {

    existingFoodname: "Paneer Fried Rice",

    AddOnIngredient: [
        "Broccoli",
        "Sweet Corn",
        "Boiled Egg"
    ]

};


module.exports = {
    createFoodData,
    recreateFoodData
};