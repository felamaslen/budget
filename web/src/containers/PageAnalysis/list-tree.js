import { connect } from 'react-redux';
import {
    aTreeItemExpandToggled, aTreeItemDisplayToggled, aTreeItemHovered
} from '~client/actions/analysis.actions';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ListTreeHead from './list-tree-head';
import SubTree from './sub-tree';
import { formatCurrency } from '~client/modules/format';
import { costShape } from '~client/prop-types/page/analysis';

function ListTree({ cost, costTotal, treeVisible, treeOpen, onExpand, onHover, onToggle }) {
    const costPct = cost.map(({ name, total, subTree }) => {
        const pct = 100 * total / costTotal;
        const visible = name in treeVisible
            ? treeVisible[name]
            : true;

        const open = Boolean(treeOpen[name]);

        return { name, itemCost: total, pct, visible, open, subTree };
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
                <span className="pct">{' ('}{pct.toFixed(1)}{'%)'}</span>
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
    cost: costShape,
    costTotal: PropTypes.number,
    treeVisible: PropTypes.objectOf(PropTypes.bool).isRequired,
    treeOpen: PropTypes.objectOf(PropTypes.bool).isRequired,
    onHover: PropTypes.func.isRequired,
    onExpand: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    cost: state.pages.analysis.cost,
    costTotal: state.pages.analysis.costTotal,
    treeVisible: state.other.analysis.treeVisible,
    treeOpen: state.other.analysis.treeOpen
});

const mapDispatchToProps = dispatch => ({
    onHover: req => dispatch(aTreeItemHovered(req)),
    onExpand: name => dispatch(aTreeItemExpandToggled(name)),
    onToggle: name => dispatch(aTreeItemDisplayToggled(name))
});

export default connect(mapStateToProps, mapDispatchToProps)(ListTree);
