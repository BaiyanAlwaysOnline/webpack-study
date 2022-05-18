const eventEmitter = {
  listeners: {},
  on(type, fn) {
    this.listeners[type] = fn;
  },
  emit(type, ...args) {
    this.listeners[type](...args);
  },
};

module.exports = eventEmitter;
