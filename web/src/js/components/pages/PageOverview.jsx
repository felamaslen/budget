/**
 * Overview page component
 */

import React from 'react';
import PropTypes from 'prop-types';
import PureControllerView from '../PureControllerView';
import { Map as map } from 'immutable';
import classNames from 'classnames';
import { OVERVIEW_COLUMNS } from '../../misc/const';

export class PageOverview extends PureControllerView {
  render() {
    const rows = this.props.data.get('rows').map((row, key) => {
      const rowClasses = classNames({
        past: !!row.get('past'),
        active: !!row.get('active'),
        future: !!row.get('future')
      });

      const cells = row.get('cells').map((cell, cellKey) => {
        const style = {};
        if (cell.get('rgb')) {
          style.backgroundColor = `rgb(${cell.get('rgb').join(',')})`;
        }

        return (
          <td key={cellKey} className={cell.get('class')} style={style}>
            <span className='text'>{cell.get('text')}</span>
          </td>
        );
      });

      return <tr key={key} className={rowClasses}>{cells}</tr>;
    });

    return (
      <table className='table-overview noselect'>
        <thead>
          <tr>
            {OVERVIEW_COLUMNS.map((column, key) => <th key={key}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}

PageOverview.propTypes = {
  data: PropTypes.instanceOf(map)
};

