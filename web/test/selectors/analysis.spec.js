import test from 'ava';
import {
    getLoading,
    getLoadingDeep,
    getPeriod,
    getGrouping,
    getPage
} from '~client/selectors/analysis';

test('getLoading gets the loading status', t => t.is(getLoading({
    analysis: {
        loading: true
    }
}), true));

test('getLoadingDeep gets the loading (deep block) status', t => t.is(getLoadingDeep({
    analysis: {
        loadingDeep: true
    }
}), true));

test('getPeriod gets the period', t => t.is(getPeriod({
    analysis: {
        period: 'year'
    }
}), 'year'));

test('getGrouping gets the grouping', t => t.is(getGrouping({
    analysis: {
        grouping: 'category'
    }
}), 'category'));

test('getPage gets the page', t => t.is(getPage({
    analysis: {
        page: 3
    }
}), 3));
