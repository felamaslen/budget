import { connect } from 'react-redux';
import React from 'react';
import { Route, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

import { NET_WORTH_AGGREGATE } from '~client/constants/data';

import { getProcessedCost } from '~client/selectors/overview';
import {
    getCategories,
    getSubcategories,
    getEntries,
    getAggregates,
    getNetWorthTable
} from '~client/selectors/overview/net-worth';

import {
    netWorthCategoryCreated,
    netWorthCategoryUpdated,
    netWorthCategoryDeleted,
    netWorthSubcategoryCreated,
    netWorthSubcategoryUpdated,
    netWorthSubcategoryDeleted,
    netWorthCreated,
    netWorthUpdated,
    netWorthDeleted
} from '~client/actions/net-worth';

import { costShape } from '~client/prop-types/page/overview';
import { dataPropTypes, netWorthTableShape } from '~client/prop-types/net-worth/view';

import NetWorthView from '~client/components/NetWorthView';
import NetWorthCategoryList from '~client/components/NetWorthCategoryList';
import NetWorthList from '~client/components/NetWorthList';

import './style.scss';

function NetWorth({
    categories,
    subcategories,
    entries,
    aggregate,
    table,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onCreateSubcategory,
    onUpdateSubcategory,
    onDeleteSubcategory,
    onCreateEntry,
    onUpdateEntry,
    onDeleteEntry
}) {
    return (
        <div className="net-worth">
            <div className="net-worth-inner">
                <div className="title">
                    <h1>{'Net worth'}</h1>
                    <NavLink className="button-back" to="/">&times;</NavLink>
                </div>
                <Route
                    exact
                    path="/net-worth"
                    render={routeProps => <NetWorthView {...routeProps}
                        table={table}
                        aggregate={aggregate}
                    />}
                />
                <Route
                    path="/net-worth/edit/categories"
                    render={routeProps => <NetWorthCategoryList {...routeProps}
                        categories={categories}
                        subcategories={subcategories}
                        onCreateCategory={onCreateCategory}
                        onUpdateCategory={onUpdateCategory}
                        onDeleteCategory={onDeleteCategory}
                        onCreateSubcategory={onCreateSubcategory}
                        onUpdateSubcategory={onUpdateSubcategory}
                        onDeleteSubcategory={onDeleteSubcategory}
                    />}
                />
                <Route
                    path="/net-worth/edit/list"
                    render={routeProps => <NetWorthList {...routeProps}
                        data={entries}
                        categories={categories}
                        subcategories={subcategories}
                        onCreate={onCreateEntry}
                        onUpdate={onUpdateEntry}
                        onDelete={onDeleteEntry}
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
                    >{'Entries'}</NavLink>
                </div>
            </div>
        </div>
    );
}

NetWorth.propTypes = {
    cost: costShape,
    categories: dataPropTypes.categories,
    subcategories: dataPropTypes.subcategories,
    entries: dataPropTypes.data,
    aggregate: PropTypes.objectOf(PropTypes.number.isRequired).isRequired,
    table: netWorthTableShape.isRequired,
    onCreateCategory: PropTypes.func.isRequired,
    onUpdateCategory: PropTypes.func.isRequired,
    onDeleteCategory: PropTypes.func.isRequired,
    onCreateSubcategory: PropTypes.func.isRequired,
    onUpdateSubcategory: PropTypes.func.isRequired,
    onDeleteSubcategory: PropTypes.func.isRequired,
    onCreateEntry: PropTypes.func.isRequired,
    onUpdateEntry: PropTypes.func.isRequired,
    onDeleteEntry: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    cost: getProcessedCost(state),
    categories: getCategories(state),
    subcategories: getSubcategories(state),
    entries: getEntries(state),
    aggregate: getAggregates(state, NET_WORTH_AGGREGATE),
    table: getNetWorthTable(state)
});

const mapDispatchToProps = {
    onCreateCategory: netWorthCategoryCreated,
    onUpdateCategory: netWorthCategoryUpdated,
    onDeleteCategory: netWorthCategoryDeleted,
    onCreateSubcategory: netWorthSubcategoryCreated,
    onUpdateSubcategory: netWorthSubcategoryUpdated,
    onDeleteSubcategory: netWorthSubcategoryDeleted,
    onCreateEntry: netWorthCreated,
    onUpdateEntry: netWorthUpdated,
    onDeleteEntry: netWorthDeleted
};

export default connect(mapStateToProps, mapDispatchToProps)(NetWorth);
