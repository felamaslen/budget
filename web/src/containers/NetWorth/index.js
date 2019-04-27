import { connect } from 'react-redux';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getApiKey } from '~client/selectors/app';
import { useApi } from '~client/hooks/api';

import './style.scss';

function NetWorth({ apiKey }) {
    const [categories, setCategories] = useState(null);
    const [subcategories, setSubcategories] = useState(null);

    const [getCategories, loadingCategories, errCategories] = useApi({
        url: 'data/net-worth/categories',
        apiKey,
        onSuccess: setCategories
    });

    const [getSubcategories, loadingSubcategories, errSubcategories] = useApi({
        url: 'data/net-worth/subcategories',
        apiKey,
        onSuccess: setSubcategories
    });

    useEffect(() => {
        getCategories();
    }, [getCategories]);

    useEffect(() => {
        getSubcategories();
    }, [getSubcategories]);

    const loading = loadingCategories || loadingSubcategories;
    const error = errCategories || errSubcategories;

    return (
        <div className={classNames('net-worth', { loading, error })}>
            <h1>{'Net worth'}</h1>
            {categories && (
                <div className="categories">{JSON.stringify(categories)}</div>
            )}
            {subcategories && (
                <div className="subcategories">{JSON.stringify(subcategories)}</div>
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
