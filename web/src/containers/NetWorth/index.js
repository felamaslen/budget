import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getApiKey } from '~client/selectors/app';
import { useCrud } from '~client/hooks/api';

import NetWorthCategoryList from '~client/components/NetWorthCategoryList';

import './style.scss';

function NetWorth({ apiKey }) {
    const [categories, loadingCategories, errCategories, createCategory, readCategories, updateCategory, deleteCategory] = useCrud({
        url: 'data/net-worth/categories',
        apiKey
    });

    const [subcategories, loadingSubcategories, errSubcategories, createSubcategory, readSubcategories, updateSubcategory, deleteSubcategory] = useCrud({
        url: 'data/net-worth/subcategories',
        apiKey
    });

    const [netWorth, loadingNetWorth, errNetWorth, createNetWorth, readNetWorth, updateNetWorth, deleteNetWorth] = useCrud({
        url: 'data/net-worth',
        apiKey
    });

    useEffect(() => {
        readCategories();
    }, [readCategories]);

    useEffect(() => {
        readSubcategories();
    }, [readSubcategories]);

    useEffect(() => {
        readNetWorth();
    }, [readNetWorth]);

    const loading = loadingCategories || loadingSubcategories || loadingNetWorth;
    const error = errCategories || errSubcategories || errNetWorth;

    return (
        <div className={classNames('net-worth', { loading, error })}>
            <h1>{'Net worth'}</h1>
            {categories && (
                <NetWorthCategoryList
                    categories={categories}
                    onCreate={createCategory}
                    onRead={readCategories}
                    onUpdate={updateCategory}
                    onDelete={deleteCategory}
                />
            )}
            {subcategories && (
                <div className="subcategories">{JSON.stringify(subcategories)}</div>
            )}
            {netWorth && (
                <div className="net-worth-data">{JSON.stringify(netWorth)}</div>
            )}
        </div>
    );
}

NetWorth.propTypes = {
    apiKey: PropTypes.string.isRequired
};

const mapStateToProps = state => ({
    apiKey: getApiKey(state)
});

export default connect(mapStateToProps)(NetWorth);
