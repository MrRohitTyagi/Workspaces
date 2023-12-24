// EventEmitter.js
import EventEmitter from "eventemitter3";

const emitter = new EventEmitter();

export const emitEvent = (eventName, data) => {
  emitter.emit(eventName, data);
};

export const listenToEvent = (eventName, listener) => {
  emitter.on(eventName, listener);
};
