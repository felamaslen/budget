import test from 'ava';
import '~client-test/browser';
import { fromJS } from 'immutable';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import Upper from '~client/containers/PageAnalysis/upper';
import { aOptionChanged } from '~client/actions/analysis.actions';

const getContainer = (customProps = {}, customState = null) => {
    let state = fromJS({
        pages: {
            analysis: {
                description: 'foo',
                cost: [
                    { name: 'foo1', total: 1, subTree: [{ name: 'bar1', total: 1 }] },
                    { name: 'foo2', total: 4, subTree: [{ name: 'bar2', total: 2 }] },
                    { name: 'foo3', total: 3, subTree: [{ name: 'bar3', total: 2 }] },
                    { name: 'foo4', total: 6, subTree: [{ name: 'bar4', total: 2 }] },
                    { name: 'foo5', total: 10, subTree: [{ name: 'bar5', total: 3 }] }
                ],
                costTotal: 24
            }
        },
        other: {
            analysis: {
                period: 0,
                grouping: 0,
                timeIndex: 0,
                treeVisible: {
                    foo1: true,
                    foo2: false,
                    foo3: true
                },
                treeOpen: {
                    foo1: true,
                    foo2: false,
                    foo3: false,
                    foo4: true
                }
            }
        }
    });

    if (customState) {
        state = customState(state);
    }

    const store = createMockStore(state);

    const props = {
        ...customProps
    };

    const utils = render(
        <Provider store={store}>
            <Upper {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('basic structure', t => {
    const { container } = getContainer();
    t.is(container.childNodes.length, 1);

    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'upper');
    t.is(div.childNodes.length, 4);
});

test('period switcher - basic structure', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [input] = div.childNodes;

    t.is(input.tagName, 'SPAN');
    t.is(input.className, 'input-period');
    t.is(input.childNodes.length, 4);

    const [title] = input.childNodes;

    t.is(title.tagName, 'SPAN');
    t.is(title.innerHTML, 'Period:');
});

test('period switcher - year group', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [input] = div.childNodes;

    const [, yearGroup] = input.childNodes;

    t.is(yearGroup.tagName, 'SPAN');
    t.is(yearGroup.childNodes.length, 2);

    const [radioYear, titleYear] = yearGroup.childNodes;

    t.is(radioYear.tagName, 'INPUT');
    t.is(radioYear.type, 'radio');
    t.is(radioYear.checked, true);

    t.is(titleYear.innerHTML, 'year');
});

test('period switcher - month group', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [input] = div.childNodes;

    const [, , monthGroup] = input.childNodes;

    t.is(monthGroup.tagName, 'SPAN');
    t.is(monthGroup.childNodes.length, 2);

    const [radioMonth, titleMonth] = monthGroup.childNodes;

    t.is(radioMonth.tagName, 'INPUT');
    t.is(radioMonth.type, 'radio');
    t.is(radioMonth.checked, false);

    t.is(titleMonth.tagName, 'SPAN');
    t.is(titleMonth.innerHTML, 'month');
});

test('period switcher - week group', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [input] = div.childNodes;

    const [, , , weekGroup] = input.childNodes;

    const [radioWeek, titleWeek] = weekGroup.childNodes;

    t.is(radioWeek.tagName, 'INPUT');
    t.is(radioWeek.type, 'radio');
    t.is(radioWeek.checked, false);

    t.is(titleWeek.tagName, 'SPAN');
    t.is(titleWeek.innerHTML, 'week');
});

test('grouping switcher - basic structure', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, grouping] = div.childNodes;

    t.is(grouping.tagName, 'SPAN');
    t.is(grouping.className, 'input-grouping');
    t.is(grouping.childNodes.length, 3);

    const [title] = grouping.childNodes;

    t.is(title.tagName, 'SPAN');
    t.is(title.innerHTML, 'Grouping:');
});

test('grouping switcher - category group', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, grouping] = div.childNodes;

    const [, categoryGroup] = grouping.childNodes;

    t.is(categoryGroup.tagName, 'SPAN');
    t.is(categoryGroup.childNodes.length, 2);

    const [input, title] = categoryGroup.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'radio');
    t.is(input.checked, true);

    t.is(title.tagName, 'SPAN');
    t.is(title.innerHTML, 'category');
});

test('grouping switcher - shop group', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, grouping] = div.childNodes;

    const [, , shopGroup] = grouping.childNodes;

    t.is(shopGroup.tagName, 'SPAN');
    t.is(shopGroup.childNodes.length, 2);

    const [input, title] = shopGroup.childNodes;

    t.is(input.tagName, 'INPUT');
    t.is(input.type, 'radio');
    t.is(input.checked, false);

    t.is(title.tagName, 'SPAN');
    t.is(title.innerHTML, 'shop');
});

test('buttons', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [, , buttons] = div.childNodes;

    t.is(buttons.tagName, 'DIV');
    t.is(buttons.className, 'btns');
    t.is(buttons.childNodes.length, 2);

    const [previous, next] = buttons.childNodes;

    t.is(previous.tagName, 'BUTTON');
    t.is(previous.className, 'btn-previous');
    t.is(previous.disabled, false);

    t.is(next.tagName, 'BUTTON');
    t.is(next.className, 'btn-next');
    t.is(next.disabled, true);
});

test('dispatching actions when the buttons are pressed', t => {
    const { store, container } = getContainer({}, state => state
        .setIn(['other', 'analysis', 'timeIndex'], 1)
    );

    const [div] = container.childNodes;
    const [, , buttons] = div.childNodes;
    const [previous, next] = buttons.childNodes;

    const actionPrevious = aOptionChanged({ period: 0, grouping: 0, timeIndex: 2 });
    const actionNext = aOptionChanged({ period: 0, grouping: 0, timeIndex: 0 });

    t.false(store.isActionDispatched(actionPrevious));

    fireEvent.click(previous);
    t.true(store.isActionDispatched(actionPrevious));

    t.false(store.isActionDispatched(actionNext));

    fireEvent.click(next);
    t.true(store.isActionDispatched(actionNext));
});

test('description', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;

    const [, , , title] = div.childNodes;

    t.is(title.tagName, 'H3');
    t.is(title.className, 'period-title');
    t.is(title.innerHTML, 'foo');
});
