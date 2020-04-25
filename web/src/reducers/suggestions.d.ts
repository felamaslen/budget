import { Reducer } from 'redux';

export type State = {
  loading: boolean;
  list: string[];
  next: string[];
};

type SuggestionsReducer = Reducer<State>;

const suggestionsReducer: SuggestionsReducer;
export default suggestionsReducer;
