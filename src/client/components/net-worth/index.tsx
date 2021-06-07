import React from 'react';
import { useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';

import { NetWorthCategoryList } from './category-list';
import { NetWorthList } from './list';
import { NetWorthLoans } from './loans';
import * as Styled from './styles';
import { NetWorthView } from './view';

import { ModalWindow, useCloseModal } from '~client/components/modal-window';
import {
  useNetWorthCategoryCrud,
  useNetWorthEntryCrud,
  useNetWorthSubcategoryCrud,
} from '~client/hooks';
import { getCategories, getSubcategories, getEntries, getNetWorthTable } from '~client/selectors';

const NetWorth: React.FC<RouteComponentProps> = ({ history }) => {
  const categories = useSelector(getCategories);
  const subcategories = useSelector(getSubcategories);
  const entries = useSelector(getEntries);
  const table = useSelector(getNetWorthTable);

  const crudCategory = useNetWorthCategoryCrud();
  const crudSubcategory = useNetWorthSubcategoryCrud();
  const crudEntry = useNetWorthEntryCrud();

  const onClosed = useCloseModal(history);

  return (
    <ModalWindow title="Net worth" onClosed={onClosed}>
      <Route
        exact
        path="/net-worth"
        render={(routeProps): React.ReactElement => (
          <NetWorthView
            {...routeProps}
            entries={entries}
            table={table}
            aggregate={table[table.length - 1]?.aggregate}
          />
        )}
      />
      <Route
        path="/net-worth/edit/categories"
        render={(routeProps): React.ReactElement => (
          <NetWorthCategoryList
            {...routeProps}
            categories={categories}
            subcategories={subcategories}
            onCreateCategory={crudCategory.onCreate}
            onUpdateCategory={crudCategory.onUpdate}
            onDeleteCategory={crudCategory.onDelete}
            onCreateSubcategory={crudSubcategory.onCreate}
            onUpdateSubcategory={crudSubcategory.onUpdate}
            onDeleteSubcategory={crudSubcategory.onDelete}
          />
        )}
      />
      <Route
        path="/net-worth/edit/list"
        render={(routeProps): React.ReactElement => (
          <NetWorthList
            {...routeProps}
            data={entries}
            categories={categories}
            subcategories={subcategories}
            onCreate={crudEntry.onCreate}
            onUpdate={crudEntry.onUpdate}
            onDelete={crudEntry.onDelete}
          />
        )}
      />
      <Route
        path="/net-worth/loans"
        render={(routeProps): React.ReactElement => (
          <NetWorthLoans {...routeProps} subcategories={subcategories} entries={entries} />
        )}
      />
      <Styled.TabBar>
        <Styled.Tab exact to="/net-worth" activeClassName="selected">
          View
        </Styled.Tab>
        <Styled.Tab to="/net-worth/edit/categories" activeClassName="selected">
          Categories
        </Styled.Tab>
        <Styled.Tab to="/net-worth/edit/list" activeClassName="selected">
          Entries
        </Styled.Tab>
        <Styled.Tab to="/net-worth/loans" activeClassName="selected">
          Loans
        </Styled.Tab>
      </Styled.TabBar>
    </ModalWindow>
  );
};
export default withRouter(NetWorth);
