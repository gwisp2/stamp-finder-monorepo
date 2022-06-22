module.exports = {
    "parser": "@typescript-eslint/parser",
    "parserOptions": { "project": "./tsconfig.json" },
    "env": { "es6": true },
    "ignorePatterns": ["node_modules", "build", "coverage"],
    "plugins": ["import", "eslint-comments"],
    "extends": [
        "eslint:recommended",
        "plugin:eslint-comments/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/typescript",
        "prettier"
    ],
    "rules": {
        "@typescript-eslint/no-non-null-assertion": "off",
        "import/order": "error",
        "sort-imports": ["error", {
            "ignoreDeclarationSort": true,
            "ignoreCase": true
        }]
    },
    
}