export default (): void => {
  process.on('warning', (e) => {
    console.warn(e.stack); // eslint-disable-line no-console
  });
};
