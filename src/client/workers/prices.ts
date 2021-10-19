// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as unknown as Worker;

function fetchPrices(): void {
  ctx.postMessage('Fetch!');
}

let interval: NodeJS.Timeout;

function startFetching(): void {
  interval = setInterval(() => {
    fetchPrices();
  }, 5000);
}

function stopFetching(): void {
  clearInterval(interval);
}

type ActionStart = {
  type: 'start';
};
type ActionStop = {
  type: 'stop';
};
type Action = ActionStart | ActionStop;

// eslint-disable-next-line jest/require-hook
ctx.addEventListener('message', async (event: MessageEvent<Action>): Promise<void> => {
  const action = event.data;
  switch (action.type) {
    case 'start':
      startFetching();
      break;
    case 'stop':
      stopFetching();
      break;
    default:
  }
});
