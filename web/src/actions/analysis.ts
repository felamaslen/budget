import { AxiosError } from 'axios';

import {
  AnalysisRequest,
  AnalysisResponse,
  MainBlockName,
  AnalysisDeepResponse,
} from '~client/types';

export const enum ActionTypeAnalysis {
  Requested = '@@analysis/REQUESTED',
  Received = '@@analysis/RECEIVED',
  BlockRequested = '@@analysis/BLOCK_REQUESTED',
  BlockReceived = '@@analysis/BLOCK_RECEIVED',
}

export type ActionAnalysisRequested = {
  type: ActionTypeAnalysis.Requested;
} & AnalysisRequest;

export const analysisRequested = (req: AnalysisRequest = {}): ActionAnalysisRequested => ({
  type: ActionTypeAnalysis.Requested,
  ...req,
});

export type ActionAnalysisReceived = {
  type: ActionTypeAnalysis.Received;
  res?: AnalysisResponse;
  err?: AxiosError;
};

export const analysisReceived = (
  res?: AnalysisResponse,
  err?: AxiosError,
): ActionAnalysisReceived => ({
  type: ActionTypeAnalysis.Received,
  res,
  err,
});

export type ActionAnalysisBlockRequested = {
  type: ActionTypeAnalysis.BlockRequested;
  name: MainBlockName | string;
};

export const blockRequested = (name: MainBlockName | string): ActionAnalysisBlockRequested => ({
  type: ActionTypeAnalysis.BlockRequested,
  name,
});

export type ActionAnalysisBlockReceived = {
  type: ActionTypeAnalysis.BlockReceived;
  res?: AnalysisDeepResponse;
  err?: AxiosError;
};

export const blockReceived = (
  res?: AnalysisDeepResponse,
  err?: AxiosError,
): ActionAnalysisBlockReceived => ({ type: ActionTypeAnalysis.BlockReceived, res, err });

export type ActionAnalysis =
  | ActionAnalysisRequested
  | ActionAnalysisReceived
  | ActionAnalysisBlockRequested
  | ActionAnalysisBlockReceived
  | ActionAnalysisReceived;
