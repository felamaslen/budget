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
import type { Request } from 'express';
import 'isomorphic-unfetch';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider as ReduxProvider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import prepass from 'react-ssr-prepass';
import { createStore, Store } from 'redux';
import type { DatabaseTransactionConnectionType } from 'slonik';
import { Provider as GQLProvider } from 'urql';

import config from '~api/config';
import { getAppConfig } from '~api/controllers';
import { getUidFromToken } from '~api/modules/auth';

import { Action, configUpdatedFromApi, loggedOut } from '~client/actions';
import type { SSRExchange } from '~client/components/gql-provider';
import { getInitialQueryVariables } from '~client/hooks/queries/initial';
import rootReducer, { State } from '~client/reducers';
import { InitialDocument, InitialQuery, InitialQueryVariables } from '~client/types/gql';

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-unresolved
const App = require('../../../../lib/ssr/bundle.js');

const statsFileLegacy = path.resolve(__dirname, '../../../../static/loadable-stats-es5.json');
const statsFileModule = path.resolve(__dirname, '../../../../static/loadable-stats-module.json');
const statsFileDev = path.resolve(__dirname, '../../../../static/loadable-stats-dev.json');

global.window = {} as Window & typeof globalThis;

type ApiKeyWithUid = { apiKey: string; uid: number };

function getApiKeyFromRequest(req: Request): ApiKeyWithUid | null {
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
    return { uid, apiKey };
  } catch (err) {
    return null;
  }
}

export type RenderedApp = {
  html: string;
  scriptTags: string;
  apiKey: string | null;
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

function setupPreloaderClient(user: ApiKeyWithUid | null): { client: Client; ssr: SSRExchange } {
  const ssr = ssrExchange({ isClient: false });

  const client = createClient({
    url: `http://localhost:${config.app.port}/graphql`,
    suspense: true,
    fetchOptions: user
      ? {
          headers: {
            Authorization: user.apiKey,
          },
        }
      : undefined,
    exchanges: [dedupExchange, cacheExchange, ssr, fetchExchange],
  });

  return { ssr, client };
}

async function setupStore(
  db: DatabaseTransactionConnectionType,
  user: ApiKeyWithUid | null,
): Promise<Store<State, Action>> {
  const store = createStore<State, Action, unknown, unknown>(rootReducer);
  if (!user) {
    store.dispatch(loggedOut());
  }

  const appConfig = await getAppConfig(db, user?.uid);
  store.dispatch(configUpdatedFromApi(appConfig));

  return store;
}

function extractJSX(
  extractors: ChunkExtractor[],
  req: Request,
  user: ApiKeyWithUid | null,
  client: Client,
  store: Store<State>,
  offline = false,
): JSX.Element[] {
  const RenderedApp = (
    <ReduxProvider store={store}>
      <GQLProvider value={client}>
        <StaticRouter location={req.url}>
          <App loggedIn={!!user} offline={offline} />
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

export async function renderApp(
  db: DatabaseTransactionConnectionType,
  req: Request,
  hot: boolean,
  offline = false,
): Promise<RenderedApp> {
  const statsFiles = hot ? [statsFileDev] : [statsFileLegacy, statsFileModule];
  const extractors = statsFiles.map((statsFile) => new ChunkExtractor({ statsFile }));

  const user = getApiKeyFromRequest(req);
  const { ssr, client } = setupPreloaderClient(user);
  const store = await setupStore(db, user);

  const jsx = extractJSX(extractors, req, user, client, store, offline);

  if (user) {
    await preloadData(client, store, jsx);
  }

  const html = process.env.NODE_ENV === 'development' ? '' : renderToString(jsx[0]);
  const scriptTags = getScriptTags(extractors, hot);

  const ssrData = JSON.stringify(ssr.extractData());
  const initialState = JSON.stringify(store.getState());

  return {
    html,
    scriptTags,
    apiKey: JSON.stringify(user?.apiKey ?? null),
    ssrData: JSON.stringify(ssrData),
    initialState: JSON.stringify(initialState),
  };
}
