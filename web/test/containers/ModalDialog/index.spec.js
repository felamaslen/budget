import test from 'ava';
import '~client-test/browser';
import { fromJS } from 'immutable';
import { render, fireEvent } from 'react-testing-library';
import { createMockStore } from 'redux-test-utils';
import { Provider } from 'react-redux';
import React from 'react';
import ModalDialog from '~client/containers/ModalDialog';
import { aMobileDialogClosed } from '~client/actions/form.actions';

const getContainer = (customProps = {}, customState = null) => {
    let state = fromJS({
        currentPage: 'page1',
        modalDialog: {
            active: true,
            visible: true,
            loading: false,
            type: 'foo',
            row: 3,
            ol: 4,
            id: '100',
            fields: [
                { item: 'item', value: 'foo' },
                { item: 'cost', value: 34 }
            ],
            invalidKeys: ['xyz']
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
            <ModalDialog {...props} />
        </Provider>
    );

    return { store, ...utils };
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'modal-dialog-outer foo');
    t.is(div.childNodes.length, 1);

    const [dialog] = div.childNodes;

    t.is(dialog.tagName, 'DIV');
    t.is(dialog.className, 'dialog');
    t.is(dialog.childNodes.length, 3);
});

test('not rendering anything while inactive', t => {
    const { container } = getContainer({}, state => state
        .setIn(['modalDialog', 'active'], false)
    );

    t.is(container.childNodes.length, 0);
});

test('hidden class', t => {
    const { container } = getContainer({}, state => state
        .setIn(['modalDialog', 'visible'], false)
    );

    const [div] = container.childNodes;
    const [dialog] = div.childNodes;

    t.regex(dialog.className, /hidden/);
});

test('loading class', t => {
    const { container } = getContainer({}, state => state
        .setIn(['modalDialog', 'loading'], true)
    );

    const [div] = container.childNodes;
    const [dialog] = div.childNodes;

    t.regex(dialog.className, /loading/);
});


test('title', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [title] = dialog.childNodes;

    t.is(title.tagName, 'SPAN');
    t.is(title.className, 'title');


    t.is(title.innerHTML, 'Editing id#100');
});

test('adding title', t => {
    const { container } = getContainer({}, state => state
        .setIn(['modalDialog', 'id'], null)
    );

    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [title] = dialog.childNodes;


    t.is(title.innerHTML, 'Add item');
});

test('form list', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [, formList] = dialog.childNodes;

    t.is(formList.tagName, 'UL');
    t.is(formList.className, 'form-list');
    t.is(formList.childNodes.length, 2);

    formList.childNodes.forEach(modalDialogField => {
        t.is(modalDialogField.tagName, 'LI');
        t.regex(modalDialogField.className, /^form-row\s/);
    });
});

test('buttons', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [, , buttons] = dialog.childNodes;

    t.is(buttons.tagName, 'DIV');
    t.is(buttons.className, 'buttons');
    t.is(buttons.childNodes.length, 2);

    const [cancel, submit] = buttons.childNodes;

    t.is(cancel.tagName, 'BUTTON');
    t.is(cancel.className, 'button-cancel');
    t.is(cancel.type, 'button');
    t.is(cancel.disabled, false);
    t.is(cancel.innerHTML, 'nope.avi');

    t.is(submit.tagName, 'BUTTON');
    t.is(submit.className, 'button-submit');
    t.is(submit.type, 'button');
    t.is(submit.disabled, false);
    t.is(submit.innerHTML, 'Do it.');
});

test('dispatching a cancel action', t => {
    const { store, container } = getContainer();
    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [, , buttons] = dialog.childNodes;

    const [cancel] = buttons.childNodes;
    const action = aMobileDialogClosed(null);

    t.false(store.isActionDispatched(action));

    fireEvent.click(cancel);
    t.true(store.isActionDispatched(action));
});

test('dispatching a submit action', t => {
    const { store, container } = getContainer();
    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [, , buttons] = dialog.childNodes;

    const [, submit] = buttons.childNodes;
    const action = aMobileDialogClosed({ page: 'page1' });

    t.false(store.isActionDispatched(action));

    fireEvent.click(submit);
    t.true(store.isActionDispatched(action));
});

test('disabled buttons while loading', t => {
    const { container } = getContainer({}, state => state
        .setIn(['modalDialog', 'loading'], true)
    );

    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [, , buttons] = dialog.childNodes;

    const [cancel, submit] = buttons.childNodes;

    t.is(cancel.disabled, true);
    t.is(submit.disabled, true);
});
