import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';

import { NetWorthCategoryList } from './category-list';
import { NetWorthList } from './list';
import * as Styled from './styles';
import { NetWorthView } from './view';
import {
  netWorthCategoryCreated,
  netWorthCategoryUpdated,
  netWorthCategoryDeleted,
  netWorthSubcategoryCreated,
  netWorthSubcategoryUpdated,
  netWorthSubcategoryDeleted,
  netWorthCreated,
  netWorthUpdated,
  netWorthDeleted,
} from '~client/actions';
import { ModalWindow } from '~client/components/modal-window';
import { useCrud } from '~client/hooks';
import { getCategories, getSubcategories, getEntries, getNetWorthTable } from '~client/selectors';
import { Category, Subcategory, Entry } from '~client/types';

const NetWorth: React.FC<RouteComponentProps> = ({ history }) => {
  const categories = useSelector(getCategories);
  const subcategories = useSelector(getSubcategories);
  const entries = useSelector(getEntries);
  const table = useSelector(getNetWorthTable);

  const [onCreateCategory, onUpdateCategory, onDeleteCategory] = useCrud<Category>(
    netWorthCategoryCreated,
    netWorthCategoryUpdated,
    netWorthCategoryDeleted,
  );
  const [onCreateSubcategory, onUpdateSubcategory, onDeleteSubcategory] = useCrud<Subcategory>(
    netWorthSubcategoryCreated,
    netWorthSubcategoryUpdated,
    netWorthSubcategoryDeleted,
  );
  const [onCreateEntry, onUpdateEntry, onDeleteEntry] = useCrud<Entry>(
    netWorthCreated,
    netWorthUpdated,
    netWorthDeleted,
  );

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
            onCreateCategory={onCreateCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onCreateSubcategory={onCreateSubcategory}
            onUpdateSubcategory={onUpdateSubcategory}
            onDeleteSubcategory={onDeleteSubcategory}
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
            onCreate={onCreateEntry}
            onUpdate={onUpdateEntry}
            onDelete={onDeleteEntry}
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
