function loader(cssSource) {
  return `
        const style = document.createElement('style');
        style.innerHTML = ${cssSource};
        document.head.appendChild(style);
    `;
}

module.exports = loader;
