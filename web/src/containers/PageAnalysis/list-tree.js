import { List as list } from 'immutable';
import { connect } from 'react-redux';
import {
    aTreeItemExpandToggled, aTreeItemDisplayToggled, aTreeItemHovered
} from '../../actions/analysis.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ListTreeHead from './list-tree-head';
import SubTree from './sub-tree';
import { formatCurrency } from '../../helpers/format';

function ListTree({ cost, costTotal, treeVisible, treeOpen, onExpand, onHover, onToggle }) {
    const costPct = cost.map(item => {
        const itemCost = item.get('total');
        const pct = 100 * itemCost / costTotal;
        const name = item.get('name');
        const visible = treeVisible.has(name)
            ? treeVisible.get(name)
            : true;

        const open = Boolean(treeOpen.get(name));

        const subTree = item.get('subTree');

        return { name, itemCost, pct, visible, open, subTree };
    });

    const listTreeBody = costPct.map(({ visible, pct, ...item }) => {
        const { name, open, itemCost } = item;

        const className = classNames('tree-list-item', name, { open });

        const onClick = () => onExpand(name);
        const onMouseOver = () => onHover([name]);
        const onMouseOut = () => onHover(null);

        const onClickToggle = () => onToggle(name);
        const stopPropagation = evt => evt.stopPropagation();

        return <li key={name} className={className}>
            <div className="main"
                onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>

                <span className="indicator" />
                <input type="checkbox" checked={visible} onClick={stopPropagation}
                    onChange={onClickToggle} />
                <span className="title">{name}</span>
                <span className="cost">{formatCurrency(itemCost)}</span>
                <span className="pct">&nbsp;({pct.toFixed(1)}%)</span>
            </div>
            <SubTree {...item} onHover={onHover} />
        </li>;
    });

    return <div className="tree">
        <ul className="tree-list">
            <ListTreeHead items={costPct} />
            {listTreeBody}
        </ul>
    </div>;
}

ListTree.propTypes = {
    cost: PropTypes.instanceOf(list),
    costTotal: PropTypes.number,
    treeVisible: PropTypes.object.isRequired,
    treeOpen: PropTypes.object.isRequired,
    onHover: PropTypes.func.isRequired,
    onExpand: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    cost: state.getIn(['pages', 'analysis', 'cost']),
    costTotal: state.getIn(['pages', 'analysis', 'costTotal']),
    treeVisible: state.getIn(['other', 'analysis', 'treeVisible']),
    treeOpen: state.getIn(['other', 'analysis', 'treeOpen'])
});

const mapDispatchToProps = dispatch => ({
    onHover: req => dispatch(aTreeItemHovered(req)),
    onExpand: name => dispatch(aTreeItemExpandToggled(name)),
    onToggle: name => dispatch(aTreeItemDisplayToggled(name))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListTree);

