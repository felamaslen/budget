import PropTypes from 'prop-types';

export const netWorthValue = PropTypes.shape({
    id: PropTypes.number.isRequired,
    subcategory: PropTypes.number.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.number.isRequired,
        PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.number.isRequired,
            currency: PropTypes.string
        }))
    ]).isRequired
});

export const creditLimit = PropTypes.shape({
    subcategory: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
});

export const currency = PropTypes.shape({
    id: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    rate: PropTypes.number.isRequired
});

export const netWorthItem = PropTypes.shape({
    id: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    values: PropTypes.arrayOf(netWorthValue.isRequired).isRequired,
    creditLimit: PropTypes.arrayOf(creditLimit.isRequired).isRequired,
    currencies: PropTypes.arrayOf(currency.isRequired).isRequired
});

export const netWorthList = PropTypes.arrayOf(netWorthItem.isRequired);
