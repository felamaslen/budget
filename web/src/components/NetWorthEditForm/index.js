import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { netWorthItem } from '~client/components/NetWorthList/prop-types';
import { category, subcategory } from '~client/components/NetWorthCategoryList/prop-types';
import StepDate from '~client/components/NetWorthEditForm/step-date';

import './style.scss';

const STEP_DATE = 'STEP_DATE';

const steps = [
    STEP_DATE
];

export default function NetWorthEditForm({
    item,
    categories,
    subcategories,
    setActiveId,
    onUpdate
}) {
    const onComplete = useCallback(event => {
        if (event) {
            event.stopPropagation();
        }
        setActiveId(null);
    }, [setActiveId]);

    const [tempItem, setTempItem] = useState(item);
    const [step, setStep] = useState(STEP_DATE);

    const onNextStep = useCallback(() => {
        const stepIndex = steps.indexOf(step);
        if (stepIndex < steps.length - 1) {
            setStep(steps[stepIndex + 1]);
        } else {
            const { id, ...doc } = tempItem;

            const docWithoutIds = [
                'creditLimit',
                'currencies',
                'values'
            ]
                .reduce((last, key) => ({
                    ...last,
                    [key]: doc[key].map(({ id: valueId, ...rest }) => rest)
                }), doc);

            onUpdate(item.id, {}, docWithoutIds, onComplete);
        }
    }, [item.id, onComplete, step, tempItem, onUpdate]);

    const onLastStep = steps.indexOf(step) === steps.length - 1;

    const containerProps = { onComplete, item };
    const stepProps = {
        item: tempItem,
        onEdit: setTempItem,
        onNextStep,
        onLastStep
    };

    if (step === STEP_DATE) {
        return (
            <StepDate
                containerProps={containerProps}
                {...stepProps}
            />
        );
    }

    throw new Error('Invalid step set for <NetWorthEditForm />');
}

NetWorthEditForm.propTypes = {
    item: netWorthItem.isRequired,
    categories: PropTypes.arrayOf(category.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategory.isRequired).isRequired,
    setActiveId: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired
};
