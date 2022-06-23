module.exports = {
    'rootDir': "src",
    'moduleDirectories': ["node_modules", "src"],
    'setupFilesAfterEnv': ['<rootDir>test-setup.ts'],
    'testEnvironment': 'jsdom',
    "moduleNameMapper": {
        "^.+\\.(png|svg|css)$": "<rootDir>/test-resources-stub.ts",
    }
};