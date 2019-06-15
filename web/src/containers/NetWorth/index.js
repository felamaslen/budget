import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import { Route, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getApiKey } from '~client/selectors/app';
import { useCrud } from '~client/hooks/api';

import NetWorthView from '~client/components/NetWorthView';
import NetWorthCategoryList from '~client/components/NetWorthCategoryList';
import NetWorthList from '~client/components/NetWorthList';

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
    }, [readSubcategories, categories]);

    useEffect(() => {
        readNetWorth();
    }, [readNetWorth]);

    const loading = loadingCategories || loadingSubcategories || loadingNetWorth;
    const error = errCategories || errSubcategories || errNetWorth;

    return (
        <div className={classNames('net-worth', { loading, error })}>
            <div className="net-worth-inner">
                <h1 className="title">{'Net worth'}</h1>
                <Route
                    exact
                    path="/net-worth"
                    render={routeProps => <NetWorthView {...routeProps}
                        data={netWorth}
                    />}
                />
                <Route
                    path="/net-worth/edit/categories"
                    render={routeProps => <NetWorthCategoryList {...routeProps}
                        categories={categories}
                        subcategories={subcategories}
                        onCreateCategory={createCategory}
                        onReadCategory={readCategories}
                        onUpdateCategory={updateCategory}
                        onDeleteCategory={deleteCategory}
                        onCreateSubcategory={createSubcategory}
                        onReadSubcategory={readSubcategories}
                        onUpdateSubcategory={updateSubcategory}
                        onDeleteSubcategory={deleteSubcategory}
                    />}
                />
                <Route
                    path="/net-worth/edit/list"
                    render={routeProps => <NetWorthList {...routeProps}
                        data={netWorth}
                        onCreate={createNetWorth}
                        onRead={readNetWorth}
                        onUpdate={updateNetWorth}
                        onDelete={deleteNetWorth}
                    />}
                />
                <div className="net-worth-tab-bar">
                    <NavLink
                        exact
                        to="/net-worth"
                        className="tab tab-view"
                        activeClassName="selected"
                    >{'View'}</NavLink>
                    <NavLink
                        to="/net-worth/edit/categories"
                        className="tab tab-edit-categories"
                        activeClassName="selected"
                    >{'Categories'}</NavLink>
                    <NavLink
                        to="/net-worth/edit/list"
                        className="tab tab-edit-list"
                        activeClassName="selected"
                    >{'List'}</NavLink>
                </div>
            </div>
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
