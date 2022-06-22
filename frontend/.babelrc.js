module.exports = api => {
  const isTest = api.env('test');
  const testEnvPresetConfig = { targets: { node: "current" } }
  const defaultEnvPresetConfig = { "modules": false }
  return {
    "presets": [["@babel/env", isTest ? testEnvPresetConfig : defaultEnvPresetConfig], "@babel/typescript", ["@babel/react", { "runtime": "automatic" }]],
    "plugins": ["babel-plugin-styled-components", "@babel/plugin-transform-runtime"]
  };
};