import * as EF from '../constants/effects';

import { loadSettings, updateServerData, addServerData, handleModal } from './app.effects';
import { submitLoginForm, saveLoginCredentials } from './login.effects';
import {
    requestContent, requestAnalysisData, requestFundPeriodData
} from './content.effects';
import { requestSuggestions } from './suggestions.effects';
import { requestStocksList, requestStockPrices } from './stocks.effects';

function createEffectHandler(effects) {
    return effects.reduce((obj, item) => {
        obj[item[0]] = (dispatch, reduction, payload) => item[1](dispatch, reduction, payload);

        return obj;
    }, {});
}

export default createEffectHandler([
    [EF.LOCAL_SETTINGS_REQUESTED, loadSettings],
    [EF.LOGIN_FORM_SUBMIT, submitLoginForm],
    [EF.LOGIN_CREDENTIALS_SAVED, saveLoginCredentials],

    [EF.CONTENT_REQUESTED, requestContent],
    [EF.SUGGESTIONS_REQUESTED, requestSuggestions],
    [EF.SERVER_UPDATE_REQUESTED, updateServerData],
    [EF.SERVER_ADD_REQUESTED, addServerData],
    [EF.SERVER_MODAL_EFFECT_HANDLER, handleModal],
    [EF.ANALYSIS_DATA_REQUESTED, requestAnalysisData],

    [EF.FUNDS_PERIOD_REQUESTED, requestFundPeriodData],
    [EF.EF_STOCKS_LIST_REQUESTED, requestStocksList],
    [EF.EF_STOCKS_PRICES_REQUESTED, requestStockPrices]
]);

