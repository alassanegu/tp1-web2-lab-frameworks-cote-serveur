// jest.config.js
module.exports = {
    testEnvironment: "node",
    preset: "./jest-preset.js",
    transform: {
        "^.+\\.js$": "babel-jest"
    },
    moduleFileExtensions: ["ts", "js"],
    testTimeout: 30000, // Limite de temps globale en millisecondes (10 secondes)
};
