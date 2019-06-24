import PropTypes from 'prop-types';

import { category, subcategory } from '~client/components/NetWorthCategoryList/prop-types';
import { netWorthList } from '~client/components/NetWorthList/prop-types';

export const dataPropTypes = {
    data: netWorthList,
    categories: PropTypes.arrayOf(category.isRequired).isRequired,
    subcategories: PropTypes.arrayOf(subcategory.isRequired).isRequired
};
