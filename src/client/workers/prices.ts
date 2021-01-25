const fetchIntervalMs = 30000;
const initialFetchDelayMs = 5000;

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = (self as unknown) as Worker;

function fetchPrices(): void {
  ctx.postMessage('Fetch!');
}

let timer: NodeJS.Timeout;
let interval: NodeJS.Timeout;

function startFetching(): void {
  clearTimeout(timer);
  timer = setTimeout(() => {
    fetchPrices();
    interval = setInterval(() => {
      fetchPrices();
    }, fetchIntervalMs);
  }, initialFetchDelayMs);
}

function stopFetching(): void {
  clearTimeout(timer);
  clearInterval(interval);
}

type ActionStart = {
  type: 'start';
};
type ActionStop = {
  type: 'stop';
};
type Action = ActionStart | ActionStop;

ctx.addEventListener(
  'message',
  async (event: MessageEvent<Action>): Promise<void> => {
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
  },
);
