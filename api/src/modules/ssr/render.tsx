import path from 'path';
import { ChunkExtractor } from '@loadable/server';
import {
  createClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
  ssrExchange,
  Client,
} from '@urql/core';
import { Request } from 'express';
import 'isomorphic-unfetch';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider as ReduxProvider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import prepass from 'react-ssr-prepass';
import { createStore, Store } from 'redux';
import { Provider as GQLProvider } from 'urql';

import config from '~api/config';
import { getAppConfig } from '~api/controllers';
import { getUidFromToken } from '~api/modules/auth';

import { Action, configUpdated, loggedOut } from '~client/actions';
import type { SSRExchange } from '~client/components/gql-provider';
import { getInitialQueryVariables } from '~client/hooks/queries/initial';
import rootReducer, { State } from '~client/reducers';
import { InitialDocument, InitialQuery, InitialQueryVariables } from '~client/types/gql';

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-unresolved
const App = require('../../../build/ssr/bundle.js');

const statsFileLegacy = path.resolve(__dirname, '../../../../web/build/loadable-stats-es5.json');
const statsFileModule = path.resolve(__dirname, '../../../../web/build/loadable-stats-module.json');
const statsFileDev = path.resolve(__dirname, '../../../../web/build/loadable-stats-dev.json');

global.window = {
  __MOUNT_TIME__: 0,
} as Window & typeof globalThis;

function getApiKeyFromRequest(req: Request): string | null {
  try {
    const apiKey = req.session.apiKey;
    if (!apiKey) {
      return null;
    }
    const [, token] = apiKey.split(' ');
    const uid = getUidFromToken(token);
    if (!uid) {
      return null;
    }
    return apiKey;
  } catch (err) {
    return null;
  }
}

export type RenderedApp = {
  html: string;
  scriptTags: string;
  apiKey: string | null;
  mountTime: number;
  ssrData: string;
  initialState: string;
};

function getScriptTags(extractors: ChunkExtractor[], hot: boolean): string {
  if (hot) {
    const [extractorDev] = extractors;
    return extractorDev.getScriptTags();
  }

  const [extractorLegacy, extractorModule] = extractors;

  const scriptTagsLegacy = extractorLegacy.getScriptTags();
  const scriptTagsModern = extractorModule.getScriptTags();

  const scriptTagModule = /<script ([^>]*)src="(.+?\.mjs)">(.*?)<\/script>/g;
  const scriptTagLegacy = /<script ([^>]+)src="(.+?\.es5\.js)">(.*?)<\/script>/g;

  const scriptTagsModule = scriptTagsModern
    .match(scriptTagModule)
    ?.map((tag) => tag.replace(scriptTagModule, '<script type="module" $1src="$2">$3</script>'))
    .join('\n');

  const scriptTagsNoModule = scriptTagsLegacy
    .match(scriptTagLegacy)
    ?.map((tag) => tag.replace(scriptTagLegacy, '<script nomodule $1src="$2">$3</script>'))
    .join('\n');

  const jsonScripts = scriptTagsModern
    .match(/<script ([^>]*)type="application\/json">(.*?)<\/script>/g)
    ?.join('\n');

  return `${jsonScripts}\n${scriptTagsModule}\n${scriptTagsNoModule}`;
}

function setupPreloaderClient(apiKey: string | null): { client: Client; ssr: SSRExchange } {
  const ssr = ssrExchange({ isClient: false });

  const client = createClient({
    url: `http://localhost:${config.app.port}/graphql`,
    suspense: true,
    fetchOptions: apiKey
      ? {
          headers: {
            Authorization: apiKey,
          },
        }
      : undefined,
    exchanges: [dedupExchange, cacheExchange, ssr, fetchExchange],
  });

  return { ssr, client };
}

function setupStore(req: Request, apiKey: string | null): Store<State, Action> {
  const store = createStore<State, Action, unknown, unknown>(rootReducer);
  if (!apiKey) {
    store.dispatch(loggedOut());
  }

  const appConfig = getAppConfig({}, {}, req);
  store.dispatch(configUpdated(appConfig));

  return store;
}

function extractJSX(
  extractors: ChunkExtractor[],
  req: Request,
  apiKey: string | null,
  client: Client,
  store: Store<State>,
): JSX.Element[] {
  const RenderedApp = (
    <ReduxProvider store={store}>
      <GQLProvider value={client}>
        <StaticRouter location={req.url}>
          <App loggedIn={!!apiKey} />
        </StaticRouter>
      </GQLProvider>
    </ReduxProvider>
  );

  const jsx = extractors.map((extractor) => extractor.collectChunks(RenderedApp));
  return jsx;
}

async function preloadData(client: Client, store: Store<State>, jsx: JSX.Element[]): Promise<void> {
  const { appConfig } = store.getState().api;

  // This should be replaced by Suspense once that's supported server-side
  await Promise.all([
    client
      .query<InitialQuery, InitialQueryVariables>(
        InitialDocument,
        getInitialQueryVariables(appConfig),
      )
      .toPromise(),
    prepass(jsx[0]), // the generated URQL data is the same for each bundle
  ]);
}

export async function renderApp(req: Request, hot: boolean): Promise<RenderedApp> {
  const statsFiles = hot ? [statsFileDev] : [statsFileLegacy, statsFileModule];
  const extractors = statsFiles.map((statsFile) => new ChunkExtractor({ statsFile }));

  const mountTime = Date.now();
  global.window.__MOUNT_TIME__ = mountTime;

  const apiKey = getApiKeyFromRequest(req);
  const { ssr, client } = setupPreloaderClient(apiKey);
  const store = setupStore(req, apiKey);

  const jsx = extractJSX(extractors, req, apiKey, client, store);

  if (apiKey) {
    await preloadData(client, store, jsx);
  }

  const html = renderToString(jsx[0]);
  const scriptTags = getScriptTags(extractors, hot);

  const ssrData = JSON.stringify(ssr.extractData());
  const initialState = JSON.stringify(store.getState());

  return {
    html,
    scriptTags,
    apiKey: JSON.stringify(apiKey),
    mountTime,
    ssrData: JSON.stringify(ssrData),
    initialState: JSON.stringify(initialState),
  };
}
