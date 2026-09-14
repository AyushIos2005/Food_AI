const { GoogleGenAI, Type } = require("@google/genai");
const logger = require("../utils/logger");
const { env } = require("../config/env");

let aiClient = null;

function getAIClient() {
    if (!env.GOOGLE_GENAI_API_KEY) {
        const error = new Error("AI service is temporarily unavailable");
        error.status = 503;
        throw error;
    }

    if (!aiClient) {
        aiClient = new GoogleGenAI({
            apiKey: env.GOOGLE_GENAI_API_KEY
        });
    }

    return aiClient;
}


/*
====================================================
CONFIGURATION
====================================================
*/

const AI_MODEL =
    process.env.GEMINI_MODEL || "gemini-3.6-flash";

const MAX_RETRIES =
    Number(process.env.AI_MAX_RETRIES) || 3;

const INITIAL_RETRY_DELAY =
    Number(process.env.AI_RETRY_DELAY) || 2000;


/*
====================================================
UTILITY: SLEEP
====================================================
*/

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


/*
====================================================
UTILITY: RETRYABLE ERROR
====================================================

Retry these errors:

429 -> Too many requests / rate limit
500 -> Internal server error
502 -> Bad gateway
503 -> Service unavailable
504 -> Gateway timeout
====================================================
*/

function isRetryableError(error) {

    const status =
        error?.status ||
        error?.code ||
        error?.response?.status;

    return [
        429,
        500,
        502,
        503,
        504
    ].includes(Number(status));
}


/*
====================================================
UTILITY: ERROR MESSAGE
====================================================
*/

function getErrorMessage(error) {

    if (!error) {
        return "Unknown AI service error";
    }

    if (typeof error.message === "string") {
        return error.message;
    }

    try {
        return JSON.stringify(error);
    } catch {
        return "Unknown AI service error";
    }
}


/*
====================================================
UTILITY: RETRY DELAY
====================================================

Exponential backoff:

Attempt 1 -> 2 sec
Attempt 2 -> 4 sec
Attempt 3 -> 8 sec

Jitter is added to prevent multiple requests
retrying at exactly the same time.
====================================================
*/

function calculateRetryDelay(attempt) {

    const exponentialDelay =
        INITIAL_RETRY_DELAY *
        Math.pow(2, attempt - 1);

    const jitter =
        Math.floor(Math.random() * 1000);

    return exponentialDelay + jitter;
}


/*
====================================================
GENERIC GEMINI REQUEST WITH RETRY
====================================================
*/

async function generateWithRetry({
    contents,
    responseSchema,
    operationName
}) {

    let lastError = null;


    for (
        let attempt = 1;
        attempt <= MAX_RETRIES;
        attempt++
    ) {

        try {

            console.log(
                `[AI] ${operationName} - Attempt ${attempt}/${MAX_RETRIES}`
            );


            const response =
                await getAIClient().models.generateContent({

                    model: AI_MODEL,

                    contents,

                    config: {

                        responseMimeType:
                            "application/json",

                        responseSchema

                    }

                });


            /*
            ========================================
            CHECK RESPONSE
            ========================================
            */

            if (!response) {

                throw new Error(
                    "Gemini returned an empty response"
                );
            }


            if (
                !response.text ||
                typeof response.text !== "string"
            ) {

                throw new Error(
                    "Gemini returned empty or invalid text response"
                );
            }


            console.log(
                `[AI] ${operationName} - Success`
            );


            return response;


        } catch (error) {

            lastError = error;


            const status =
                error?.status ||
                error?.code ||
                error?.response?.status;


            console.error(
                `[AI] ${operationName} - Attempt ${attempt} failed`
            );

            console.error(
                `Status: ${status || "UNKNOWN"}`
            );

            console.error(
                `Message: ${getErrorMessage(error)}`
            );


            /*
            ========================================
            DO NOT RETRY NON-RETRYABLE ERRORS
            ========================================
            */

            if (!isRetryableError(error)) {

                console.error(
                    `[AI] ${operationName} - Non-retryable error`
                );

                break;
            }


            /*
            ========================================
            LAST ATTEMPT
            ========================================
            */

            if (attempt === MAX_RETRIES) {

                console.error(
                    `[AI] ${operationName} - Maximum retries reached`
                );

                break;
            }


            /*
            ========================================
            WAIT BEFORE RETRY
            ========================================
            */

            const delay =
                calculateRetryDelay(attempt);


            console.log(
                `[AI] ${operationName} - Retrying in ${delay}ms`
            );


            await sleep(delay);
        }
    }


    /*
    ============================================
    FINAL ERROR
    ============================================
    */

    const finalError =
        new Error(
            `AI service failed after ${MAX_RETRIES} attempts: ${getErrorMessage(
                lastError
            )}`
        );


    finalError.status =
        lastError?.status ||
        lastError?.code ||
        lastError?.response?.status;


    finalError.originalError =
        lastError;


    throw finalError;
}


/*
====================================================
SAFE JSON PARSER
====================================================
*/

function parseAIResponse(response, operationName) {

    if (
        !response ||
        !response.text
    ) {

        throw new Error(
            `${operationName}: Gemini returned empty response`
        );
    }


    try {

        return JSON.parse(response.text);

    } catch (error) {

        console.error(
            `[AI] ${operationName} - Invalid JSON`
        );

        console.error(
            "Raw Gemini response:"
        );

        console.error(
            response.text
        );


        throw new Error(
            `${operationName}: Gemini returned invalid JSON`
        );
    }
}


/*
====================================================
PROTEIN RECIPE RESPONSE SCHEMA
====================================================
*/

const recipeSchema = {

    type: Type.OBJECT,

    properties: {

        recipeName: {
            type: Type.STRING,
            description:
                "Name of the recipe"
        },

        description: {
            type: Type.STRING,
            description:
                "Short description of the recipe"
        },

        ingredients: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            },

            description:
                "Complete list of ingredients"
        },

        servings: {

            type: Type.NUMBER,

            description:
                "Number of people the recipe serves"
        },

        preparationTime: {

            type: Type.STRING,

            description:
                "Preparation and cooking time"
        },

        instructions: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            },

            description:
                "Step by step cooking instructions"
        },

        proteinSources: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            },

            description:
                "Main protein sources"
        },

        proteinPerServing: {

            type: Type.STRING,

            description:
                "Approximate protein per serving"
        },

        caloriesPerServing: {

            type: Type.STRING,

            description:
                "Approximate calories per serving"
        },

        medicalConsiderations: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            },

            description:
                "Medical and dietary considerations"
        }

    },

    required: [

        "recipeName",
        "description",
        "ingredients",
        "servings",
        "preparationTime",
        "instructions",
        "proteinSources",
        "proteinPerServing",
        "caloriesPerServing",
        "medicalConsiderations"

    ],

    propertyOrdering: [

        "recipeName",
        "description",
        "ingredients",
        "servings",
        "preparationTime",
        "instructions",
        "proteinSources",
        "proteinPerServing",
        "caloriesPerServing",
        "medicalConsiderations"

    ]

};


/*
====================================================
RECREATE FOOD RESPONSE SCHEMA
====================================================
*/

const recreateRecipeSchema = {

    type: Type.OBJECT,

    properties: {

        newFoodName: {

            type: Type.STRING,

            description:
                "Name of the newly created food"
        },

        description: {

            type: Type.STRING,

            description:
                "Description of the new food"
        },

        originalFood: {

            type: Type.STRING,

            description:
                "Original food name"
        },

        addedIngredients: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            },

            description:
                "Additional ingredients provided by the user"
        },

        ingredients: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            },

            description:
                "Complete ingredient list"
        },

        preparationTime: {

            type: Type.STRING,

            description:
                "Preparation and cooking time"
        },

        instructions: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            },

            description:
                "Step by step cooking instructions"
        },

        proteinSources: {

            type: Type.ARRAY,

            items: {
                type: Type.STRING
            },

            description:
                "Protein sources"
        },

        proteinPerServing: {

            type: Type.STRING,

            description:
                "Approximate protein per serving"
        },

        caloriesPerServing: {

            type: Type.STRING,

            description:
                "Approximate calories per serving"
        }

    },

    required: [

        "newFoodName",
        "description",
        "originalFood",
        "addedIngredients",
        "ingredients",
        "preparationTime",
        "instructions",
        "proteinSources",
        "proteinPerServing",
        "caloriesPerServing"

    ],

    propertyOrdering: [

        "newFoodName",
        "description",
        "originalFood",
        "addedIngredients",
        "ingredients",
        "preparationTime",
        "instructions",
        "proteinSources",
        "proteinPerServing",
        "caloriesPerServing"

    ]

};


/*
====================================================
GENERATE PROTEIN RICH RECIPE
====================================================
*/

async function generateProteinRecipe({

    ingredient,
    numberofperson,
    anyMedical

}) {

    /*
    ============================================
    INPUT VALIDATION
    ============================================
    */

    if (
        !Array.isArray(ingredient) ||
        ingredient.length === 0
    ) {

        throw new Error(
            "At least one ingredient is required"
        );
    }


    if (
        !numberofperson ||
        Number(numberofperson) <= 0
    ) {

        throw new Error(
            "Valid number of persons is required"
        );
    }


    /*
    ============================================
    NORMALIZE INPUT
    ============================================
    */

    const cleanIngredients =
        ingredient
            .map(item => String(item).trim())
            .filter(Boolean);


    if (cleanIngredients.length === 0) {

        throw new Error(
            "Ingredient list cannot be empty"
        );
    }


    const medicalCondition =
        anyMedical?.trim() ||
        "No medical condition or dietary restriction provided";


    /*
    ============================================
    PROMPT
    ============================================
    */

    const prompt = `

You are an expert chef and nutrition assistant.

Create a healthy and protein-rich recipe using the user's ingredients.

USER INGREDIENTS:
${cleanIngredients.join(", ")}

NUMBER OF PERSONS:
${numberofperson}

MEDICAL CONDITION / DIETARY RESTRICTION:
${medicalCondition}


IMPORTANT REQUIREMENTS:

1. Use the user's ingredients as the main ingredients.
2. You may add reasonable common ingredients when necessary.
3. Make the recipe protein-rich.
4. The recipe must be practical and realistically cookable.
5. Consider the provided medical condition or dietary restriction.
6. Avoid ingredients that clearly conflict with the stated restriction.
7. Give the approximate protein per serving.
8. Give approximate calories per serving.
9. Make the recipe suitable for exactly ${numberofperson} people.
10. Give clear step-by-step cooking instructions.
11. Do not claim medical treatment or medical benefits.
12. Nutritional values are estimates, not medical measurements.
13. Return ONLY JSON matching the provided schema.

`;


    /*
    ============================================
    GEMINI REQUEST WITH RETRY
    ============================================
    */

    const response =
        await generateWithRetry({

            contents: prompt,

            responseSchema:
                recipeSchema,

            operationName:
                "Generate Protein Recipe"

        });


    /*
    ============================================
    PARSE RESPONSE
    ============================================
    */

    const recipe =
        parseAIResponse(
            response,
            "Generate Protein Recipe"
        );


    /*
    ============================================
    BASIC RESPONSE VALIDATION
    ============================================
    */

    const requiredFields = [

        "recipeName",
        "description",
        "ingredients",
        "servings",
        "preparationTime",
        "instructions",
        "proteinSources",
        "proteinPerServing",
        "caloriesPerServing",
        "medicalConsiderations"

    ];


    const missingFields =
        requiredFields.filter(
            field =>
                recipe[field] === undefined ||
                recipe[field] === null
        );


    if (missingFields.length > 0) {

        throw new Error(
            `AI recipe missing required fields: ${missingFields.join(", ")}`
        );
    }


    return recipe;
}


/*
====================================================
RECREATE EXISTING FOOD
====================================================
*/

async function recreateFood({

    existingFoodname,
    AddOnIngredient

}) {

    /*
    ============================================
    INPUT VALIDATION
    ============================================
    */

    if (
        !existingFoodname ||
        typeof existingFoodname !== "string"
    ) {

        throw new Error(
            "Existing food name is required"
        );
    }


    if (
        !Array.isArray(AddOnIngredient) ||
        AddOnIngredient.length === 0
    ) {

        throw new Error(
            "At least one addon ingredient is required"
        );
    }


    /*
    ============================================
    NORMALIZE INPUT
    ============================================
    */

    const foodName =
        existingFoodname.trim();


    const cleanAddOnIngredients =
        AddOnIngredient
            .map(item => String(item).trim())
            .filter(Boolean);


    if (cleanAddOnIngredients.length === 0) {

        throw new Error(
            "Addon ingredient list cannot be empty"
        );
    }


    /*
    ============================================
    PROMPT
    ============================================
    */

    const prompt = `

You are an expert chef and recipe innovation specialist.

The user wants to create a new version of an existing food.

EXISTING FOOD:
${foodName}

ADDITIONAL INGREDIENTS:
${cleanAddOnIngredients.join(", ")}


IMPORTANT REQUIREMENTS:

1. Keep the original food concept recognizable.
2. Properly incorporate the additional ingredients.
3. Create a realistic and practical recipe.
4. Improve nutritional value where reasonably possible.
5. Make the recipe protein-rich where appropriate.
6. Include all major ingredients required for the new recipe.
7. Give clear step-by-step cooking instructions.
8. Mention approximate protein per serving.
9. Mention approximate calories per serving.
10. Do not create impossible ingredient combinations.
11. Do not claim medical treatment or medical benefits.
12. Return ONLY JSON matching the provided schema.

`;


    /*
    ============================================
    GEMINI REQUEST WITH RETRY
    ============================================
    */

    const response =
        await generateWithRetry({

            contents: prompt,

            responseSchema:
                recreateRecipeSchema,

            operationName:
                "Recreate Existing Food"

        });


    /*
    ============================================
    PARSE RESPONSE
    ============================================
    */

    const result =
        parseAIResponse(
            response,
            "Recreate Existing Food"
        );


    /*
    ============================================
    BASIC RESPONSE VALIDATION
    ============================================
    */

    const requiredFields = [

        "newFoodName",
        "description",
        "originalFood",
        "addedIngredients",
        "ingredients",
        "preparationTime",
        "instructions",
        "proteinSources",
        "proteinPerServing",
        "caloriesPerServing"

    ];


    const missingFields =
        requiredFields.filter(
            field =>
                result[field] === undefined ||
                result[field] === null
        );


    if (missingFields.length > 0) {

        throw new Error(
            `AI recreated food missing required fields: ${missingFields.join(", ")}`
        );
    }


    return result;
}


/*
====================================================
EXPORT
====================================================
*/

module.exports = {

    generateProteinRecipe,

    recreateFood

};