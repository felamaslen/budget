import { Map as map } from 'immutable';

// builds an array of effect handlers (which are anonymous functions on the dispatcher)
export default handlers => {
  return (dispatcher, effect) => {
    map(handlers)
    .filter((handler, effectType) => effectType === effect.type)
    .forEach(handler => handler(effect.payload, dispatcher));
  };
};

