module.exports = {
    "root": true,
    "extends": "ego",
    "ignorePatterns": ['.eslintrc.js'],
    "parserOptions": {
        "project": "tsconfig.json",
        "tsconfigRootDir": __dirname,
        "sourceType": "module",
    },
    "rules": {
        // Additional, per-project rules...
    }
}