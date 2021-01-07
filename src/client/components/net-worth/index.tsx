import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';

import { NetWorthCategoryList } from './category-list';
import { NetWorthList } from './list';
import * as Styled from './styles';
import { NetWorthView } from './view';
import { ModalWindow } from '~client/components/modal-window';
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

  const onClosed = useCallback(() => {
    history.replace('/');
  }, [history]);

  return (
    <ModalWindow title="Net worth" onClosed={onClosed}>
      <Route
        exact
        path="/net-worth"
        render={(routeProps): React.ReactElement => (
          <NetWorthView
            {...routeProps}
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
      <Styled.TabBar>
        <Styled.Tab exact to="/net-worth" activeClassName="selected">
          {'View'}
        </Styled.Tab>
        <Styled.Tab to="/net-worth/edit/categories" activeClassName="selected">
          {'Categories'}
        </Styled.Tab>
        <Styled.Tab to="/net-worth/edit/list" activeClassName="selected">
          {'Entries'}
        </Styled.Tab>
      </Styled.TabBar>
    </ModalWindow>
  );
};
const RoutedNetWorth = withRouter(NetWorth);
export { RoutedNetWorth as NetWorth };
