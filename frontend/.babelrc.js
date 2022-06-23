module.exports = api => {
  return {
    "presets": [["@babel/env", { "modules": false }], "@babel/typescript", ["@babel/react", { "runtime": "automatic" }]],
    "plugins": ["babel-plugin-styled-components", "@babel/plugin-transform-runtime"]
  };
};
