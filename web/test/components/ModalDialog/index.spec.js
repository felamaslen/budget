import test from 'ava';
import sinon from 'sinon';
import '~client-test/browser';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import ModalDialog, { animationTime } from '~client/components/ModalDialog';
import { CREATE_ID } from '~client/components/CrudList';

const getContainer = (customProps = {}, ...args) => {
    const props = {
        page: 'food',
        active: true,
        loading: false,
        id: 'some-id',
        fields: [
            { item: 'item', value: 'some item' },
            { item: 'cost', value: 342 }
        ],
        type: 'edit',
        onCancel: () => null,
        onSubmit: () => null,
        ...customProps
    };

    return render(<ModalDialog {...props} />, ...args);
};

test('basic structure', t => {
    const { container } = getContainer();

    t.is(container.childNodes.length, 1);
    const [div] = container.childNodes;
    t.is(div.tagName, 'DIV');
    t.is(div.className, 'modal-dialog edit');
    t.is(div.childNodes.length, 1);

    const [dialog] = div.childNodes;

    t.is(dialog.tagName, 'DIV');
    t.is(dialog.className, 'modal-dialog-inner');
    t.is(dialog.childNodes.length, 3);
});

test('hiding after a delay', t => {
    const clock = sinon.useFakeTimers();

    const { container } = getContainer();
    const { childNodes: [dialog] } = container.childNodes[0];

    t.is(dialog.className, 'modal-dialog-inner');

    getContainer({ active: false }, { container });

    t.is(dialog.className, 'modal-dialog-inner hidden');

    clock.tick(animationTime - 1);
    t.is(dialog.className, 'modal-dialog-inner hidden');

    clock.tick(1);
    t.is(container.childNodes.length, 0);

    clock.restore();
});

test('showing from inactive', t => {
    const { container } = getContainer({ active: false });

    t.is(container.childNodes.length, 0);

    getContainer({ active: true }, { container });

    t.is(container.childNodes.length, 1);
    const { childNodes: [dialog] } = container.childNodes[0];

    t.is(dialog.className, 'modal-dialog-inner');
});

test('title', t => {
    const { container } = getContainer();
    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [title] = dialog.childNodes;

    t.is(title.tagName, 'SPAN');
    t.is(title.className, 'title');

    t.is(title.innerHTML, 'Editing id#some-id');
});

test('adding title', t => {
    const { container } = getContainer({
        id: CREATE_ID,
        type: 'add'
    });

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
    const onCancel = sinon.spy();
    const onSubmit = sinon.spy();

    const { container } = getContainer({
        onCancel,
        onSubmit
    });
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

    t.false(onCancel.calledOnce);
    fireEvent.click(cancel);
    t.true(onCancel.calledOnce);

    t.is(submit.tagName, 'BUTTON');
    t.is(submit.className, 'button-submit');
    t.is(submit.type, 'button');
    t.is(submit.disabled, false);
    t.is(submit.innerHTML, 'Do it.');

    t.false(onSubmit.calledOnce);
    fireEvent.click(submit);
    t.true(onSubmit.calledOnce);
    t.true(onSubmit.calledWith({
        id: 'some-id',
        item: 'some item',
        cost: 342
    }));
});

test('Optional remove button', t => {
    const onRemove = sinon.spy();
    const { container } = getContainer({
        onRemove
    });
    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [, , buttons] = dialog.childNodes;

    t.is(buttons.tagName, 'DIV');
    t.is(buttons.className, 'buttons');
    t.is(buttons.childNodes.length, 3);

    const [cancel, submit, remove] = buttons.childNodes;

    t.is(cancel.className, 'button-cancel');
    t.is(submit.className, 'button-submit');

    t.is(remove.tagName, 'BUTTON');
    t.is(remove.className, 'button-remove');
    t.is(remove.type, 'button');
    t.is(remove.disabled, false);
    t.is(remove.innerHTML, '−');

    t.false(onRemove.calledOnce);
    fireEvent.click(remove);
    t.true(onRemove.calledOnce);
});

test('onCancel event', t => {
    const onCancel = sinon.spy();
    const { container } = getContainer({ onCancel });
    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [, , buttons] = dialog.childNodes;

    const [cancel] = buttons.childNodes;

    t.is(onCancel.getCalls().length, 0);
    fireEvent.click(cancel);
    t.is(onCancel.getCalls().length, 1);
});

test('onSubmit event', t => {
    const onSubmit = sinon.spy();
    const { container } = getContainer({ onSubmit });
    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [, ul, buttons] = dialog.childNodes;

    const [liItem, liCost] = ul.childNodes;

    const { childNodes: [inputItem] } = liItem.childNodes[1];
    const { childNodes: [inputCost] } = liCost.childNodes[1];

    fireEvent.change(inputItem, { target: { value: 'other item' } });
    fireEvent.blur(inputItem);

    fireEvent.change(inputCost, { target: { value: '1.08' } });
    fireEvent.blur(inputCost);

    const [, submit] = buttons.childNodes;

    t.is(onSubmit.getCalls().length, 0);
    fireEvent.click(submit);
    t.is(onSubmit.getCalls().length, 1);
    t.deepEqual(onSubmit.getCalls()[0].args, [{
        id: 'some-id',
        item: 'other item',
        cost: 108
    }]);
});

test('onSubmit does not run if values are invalid', t => {
    const onSubmit = sinon.spy();
    const { container } = getContainer({ onSubmit });
    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [, ul, buttons] = dialog.childNodes;

    const [liItem] = ul.childNodes;

    t.notRegex(liItem.className, /invalid/);

    const { childNodes: [inputItem] } = liItem.childNodes[1];
    fireEvent.change(inputItem, { target: { value: '' } });
    fireEvent.blur(inputItem);

    const [, submit] = buttons.childNodes;

    t.is(onSubmit.getCalls().length, 0);
    fireEvent.click(submit);
    t.is(onSubmit.getCalls().length, 0);
    t.regex(liItem.className, /invalid/);
});

test('buttons are disabled while loading', t => {
    const { container } = getContainer({
        onRemove: () => null,
        loading: true
    });

    const [div] = container.childNodes;
    const [dialog] = div.childNodes;
    const [, , buttons] = dialog.childNodes;

    const [cancel, submit, remove] = buttons.childNodes;

    t.is(cancel.disabled, true);
    t.is(submit.disabled, true);
    t.is(remove.disabled, true);
});
