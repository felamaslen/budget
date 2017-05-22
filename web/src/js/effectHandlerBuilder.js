// builds an array of effect handlers (which are anonymous functions on the dispatcher)
export default handlers => {
  return (dispatcher, effect) => {
    handlers.filter(handler => handler[0] === effect.type).forEach(handler => {
      handler[1](effect.payload, dispatcher);
    });
  };
};

