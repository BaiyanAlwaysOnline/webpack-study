const render = () => {
  const title = require("./title.js");
  const content = require("./content.js");
  root.innerText = title + content;
};

render();
console.log(module);

if (module.hot) {
  module.hot.accept(["./title.js", "./content.js"], render);
}
