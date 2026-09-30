module.exports = {
    testEnvironment: "node",
    testTimeout: 30000,
    testPathIgnorePatterns: ["/node_modules/"],
    // __tests__/setup.js is a helper module, not a suite, so only *.test.js files are run.
    testMatch: ["**/__tests__/**/*.test.js"],
    collectCoverageFrom: ["src/**/*.js"],
    coveragePathIgnorePatterns: ["/node_modules/"]
};
