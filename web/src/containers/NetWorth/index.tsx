import { useSelector } from 'react-redux';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Route } from 'react-router-dom';

import { Category, Subcategory, Entry } from '~client/types/net-worth';
import {
  getCategories,
  getSubcategories,
  getEntries,
  getAggregates,
  getNetWorthTable,
} from '~client/selectors/overview/net-worth';
import { useCrud } from '~client/hooks/crud';
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
} from '~client/actions/net-worth';

import NetWorthView from '~client/components/NetWorthView';
import NetWorthCategoryList from '~client/components/NetWorthCategoryList';
import NetWorthList from '~client/components/NetWorthList';

import * as Styled from './styles';

const NetWorth: React.FC<RouteComponentProps> = ({ history }) => {
  const categories = useSelector(getCategories);
  const subcategories = useSelector(getSubcategories);
  const entries = useSelector(getEntries);
  const aggregate = useSelector(getAggregates);
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

  const timer = useRef<number>();
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
    return (): void => clearTimeout(timer.current);
  }, []);

  return (
    <Styled.NetWorth visible={visible}>
      <Styled.Meta>
        <Styled.Title>{'Net worth'}</Styled.Title>
        <Styled.BackButton onClick={onClose}>&times;</Styled.BackButton>
      </Styled.Meta>
      <Route
        exact
        path="/net-worth"
        render={(routeProps): React.ReactElement => (
          <NetWorthView {...routeProps} table={table} aggregate={aggregate} />
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
    </Styled.NetWorth>
  );
};

export default withRouter(NetWorth);
