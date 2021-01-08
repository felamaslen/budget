const fetchIntervalMs = 30000;
const initialFetchDelayMs = 5000;

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = (self as unknown) as Worker;

type ActionStart = {
  type: 'start';
  payload: {
    apiKey: string;
    codes: string[];
  };
};

type ActionStop = {
  type: 'stop';
};

type Action = ActionStart | ActionStop;

async function fetchPrices({ apiKey, codes }: ActionStart['payload']): Promise<void> {
  if (codes.length <= 0) {
    return;
  }

  try {
    const result = await fetch('/graphql', {
      cache: 'no-cache',
      method: 'POST',
      body: JSON.stringify({
        query: `
          query StockPrices($codes: [String!]!) {
            stockPrices(codes: $codes) {
              prices {
                code
                price
              }
              refreshTime
            }
          }
        `,
        variables: { codes },
      }),
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    });

    const body = await result.json();
    ctx.postMessage(body.data);
  } catch (err) {
    ctx.onerror?.(err);
  }
}

let timer: NodeJS.Timeout;
let interval: NodeJS.Timeout;

function startFetching(payload: ActionStart['payload']): void {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    await fetchPrices(payload);
    interval = setInterval(async () => {
      await fetchPrices(payload);
    }, fetchIntervalMs);
  }, initialFetchDelayMs);
}

function stopFetching(): void {
  clearTimeout(timer);
  clearInterval(interval);
}

ctx.addEventListener(
  'message',
  async (event: MessageEvent<Action>): Promise<void> => {
    const action = event.data;
    switch (action.type) {
      case 'start':
        startFetching(action.payload);
        break;
      case 'stop':
        stopFetching();
        break;
      default:
    }
  },
);
