import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import shortid from 'shortid';

import { sortByDate } from '~client/modules/data';
import { netWorthItem } from '~client/prop-types/net-worth/list';
import { category, subcategory } from '~client/prop-types/net-worth/category';
import StepDate from '~client/components/NetWorthEditForm/step-date';
import StepCurrencies from '~client/components/NetWorthEditForm/step-currencies';
import { StepAssets, StepLiabilities } from '~client/components/NetWorthEditForm/step-values';

import { STEP_DATE, STEP_CURRENCIES, STEP_ASSETS, STEP_LIABILITIES, steps } from './constants';

function NetWorthItemForm({ add, item, categories, subcategories, setActiveId, onEdit }) {
    const onComplete = useCallback(
        event => {
            if (event) {
                event.stopPropagation();
            }
            setActiveId(null);
        },
        [setActiveId],
    );

    const [tempItem, setTempItem] = useState(item);
    const [step, setStep] = useState(steps[0]);

    const onPrevStep = useCallback(() => {
        const stepIndex = steps.indexOf(step);
        if (stepIndex > 0) {
            setStep(steps[stepIndex - 1]);
        }
    }, [step]);

    const onNextStep = useCallback(() => {
        const stepIndex = steps.indexOf(step);
        if (stepIndex < steps.length - 1) {
            setStep(steps[stepIndex + 1]);
        } else {
            onEdit(tempItem, onComplete);
        }
    }, [onComplete, step, tempItem, onEdit]);

    const onFirstStep = steps.indexOf(step) === 0;
    const onLastStep = steps.indexOf(step) === steps.length - 1;

    const containerProps = {
        add,
        onComplete,
        item,
        onPrevStep,
        onNextStep,
        onFirstStep,
        onLastStep,
    };

    const stepProps = {
        item: tempItem,
        categories,
        subcategories,
        onEdit: setTempItem,
    };

    if (step === STEP_DATE) {
        return <StepDate containerProps={containerProps} {...stepProps} />;
    }
    if (step === STEP_CURRENCIES) {
        return <StepCurrencies containerProps={containerProps} {...stepProps} />;
    }
    if (step === STEP_ASSETS) {
        return <StepAssets containerProps={containerProps} {...stepProps} />;
    }
    if (step === STEP_LIABILITIES) {
        return <StepLiabilities containerProps={containerProps} {...stepProps} />;
    }

    throw new Error('Invalid step set for <NetWorthEditForm />');
}

NetWorthItemForm.propTypes = {
    add: PropTypes.bool,
    item: netWorthItem.isRequired,
    categories: PropTypes.arrayOf(category.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategory.isRequired).isRequired,
    setActiveId: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
};

NetWorthItemForm.defaultProps = {
    add: false,
};

const idLists = ['creditLimit', 'currencies', 'values'];

const withContrivedIds = ({ id, ...doc }) =>
    idLists.reduce(
        (last, key) => ({
            ...last,
            [key]: doc[key].map(item => ({ ...item, id: shortid.generate() })),
        }),
        doc,
    );

export function NetWorthEditForm({ onUpdate, ...props }) {
    const onEdit = useCallback(
        (tempItem, onComplete) => {
            onUpdate(tempItem.id, tempItem);
            onComplete();
        },
        [onUpdate],
    );

    return <NetWorthItemForm {...props} onEdit={onEdit} />;
}

NetWorthEditForm.propTypes = {
    onUpdate: PropTypes.func.isRequired,
};

export function NetWorthAddForm({ data, onCreate, ...props }) {
    const item = useMemo(() => {
        if (data.length) {
            const itemsSorted = sortByDate(data);

            const lastItem = itemsSorted[itemsSorted.length - 1];

            return {
                ...withContrivedIds(lastItem),
                date: DateTime.fromISO(lastItem.date)
                    .plus({ months: 1 })
                    .endOf('month'),
            };
        }

        return {
            date: DateTime.local(),
            creditLimit: [],
            currencies: [],
            values: [],
        };
    }, [data]);

    const onEdit = useCallback(
        (tempItem, onComplete) => {
            onCreate(tempItem);
            onComplete();
        },
        [onCreate],
    );

    return <NetWorthItemForm {...props} add item={item} onEdit={onEdit} />;
}

NetWorthAddForm.propTypes = {
    data: PropTypes.arrayOf(netWorthItem.isRequired).isRequired,
    onCreate: PropTypes.func.isRequired,
};
