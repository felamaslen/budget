import { connect } from 'react-redux';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { withRouter } from 'react-router';
import { Route, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

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
    history,
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
    const timer = useRef();
    const [visible, setVisible] = useState(false);
    const onClose = useCallback(() => {
        setVisible(false);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            history.replace('/');
        }, 300);
    }, [history]);

    useEffect(() => {
        setVisible(true);

        return () => clearTimeout(timer.current);
    }, []);

    return (
        <div className={classNames('net-worth', { visible })}>
            <div className="meta">
                <h2 className="title">{'Net worth'}</h2>
                <a className="button-back" onClick={onClose}>&times;</a>
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
                    className="tab tab-button tab-view"
                    activeClassName="selected"
                >{'View'}</NavLink>
                <NavLink
                    to="/net-worth/edit/categories"
                    className="tab tab-button tab-edit-categories"
                    activeClassName="selected"
                >{'Categories'}</NavLink>
                <NavLink
                    to="/net-worth/edit/list"
                    className="tab tab-button tab-edit-list"
                    activeClassName="selected"
                >{'Entries'}</NavLink>
            </div>
        </div>
    );
}

NetWorth.propTypes = {
    history: PropTypes.shape({
        replace: PropTypes.func.isRequired
    }).isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(NetWorth));
