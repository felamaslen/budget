import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import { category, subcategory } from '~client/prop-types/net-worth/category';
import { netWorthList } from '~client/prop-types/net-worth/list';

export const dataPropTypes = {
    data: netWorthList,
    categories: PropTypes.arrayOf(category.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategory.isRequired).isRequired
};

export const netWorthTableShape = PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(DateTime).isRequired,
    assets: PropTypes.number.isRequired,
    liabilities: PropTypes.number.isRequired,
    expenses: PropTypes.number.isRequired,
    fti: PropTypes.number.isRequired
}).isRequired);
