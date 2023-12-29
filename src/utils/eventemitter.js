// EventEmitter.js
import EventEmitter from "eventemitter3";

export const emitter = new EventEmitter();

export const emitEvent = (eventName, data) => {
  console.log("eventName", eventName);
  emitter.emit(eventName, data);
};

export const listenToEvent = (eventName, listener) => {
  emitter.on(eventName, listener);
};
