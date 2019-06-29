import PropTypes from 'prop-types';

import { category, subcategory } from '~client/prop-types/net-worth/category';
import { netWorthList } from '~client/prop-types/net-worth/list';

export const dataPropTypes = {
    data: netWorthList,
    categories: PropTypes.arrayOf(category.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategory.isRequired).isRequired
};
