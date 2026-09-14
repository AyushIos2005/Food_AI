function validate(schema, source = "body") {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const message = result.error.issues?.[0]?.message || "Invalid request";
            return res.status(400).json({ message });
        }

        if (source === "query") {
            req.validatedQuery = result.data;
        } else {
            req[source] = result.data;
        }
        next();
    };
}

module.exports = { validate };
