export default (): void => {
  process.on('warning', (e) => {
    console.warn(e.stack);
  });
};
