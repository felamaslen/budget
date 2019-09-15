import { combineReducers } from 'redux';

import now from '~client/reducers/now';
import app from '~client/reducers/app';
import api from '~client/reducers/api';
import login from '~client/reducers/login';
import error from '~client/reducers/error';
import overview from '~client/reducers/overview';
import netWorth from '~client/reducers/net-worth';
import analysis from '~client/reducers/analysis';
import stocks from '~client/reducers/stocks';
import funds from '~client/reducers/funds';
import income from '~client/reducers/income';
import bills from '~client/reducers/bills';
import food from '~client/reducers/food';
import general from '~client/reducers/general';
import holiday from '~client/reducers/holiday';
import social from '~client/reducers/social';
import suggestions from '~client/reducers/suggestions';

export default combineReducers({
    now,
    app,
    api,
    login,
    error,
    overview,
    netWorth,
    analysis,
    stocks,
    funds,
    income,
    bills,
    food,
    general,
    holiday,
    social,
    suggestions,
});
