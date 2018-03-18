import { connect } from 'react-redux';
import { aShowAllToggled } from '../../../../actions/graph.actions';
import React from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueries, GRAPH_SPEND_CATEGORIES } from '../../../../misc/const';
import GraphBalance from './balance';
import GraphSpending from './spending';

export function OverviewGraphs({ spending, balance, ...props }) {
    const graphSpending = render => {
        if (render) {
            return <GraphSpending name="spend" {...spending} {...props} />;
        }

        return null;
    };


    return <div className="graph-container-outer">
        <GraphBalance name="balance" {...balance} {...props} />
        <Media query={mediaQueries.desktop}>{graphSpending}</Media>
    </div>;
}

OverviewGraphs.propTypes = {
    startYearMonth: PropTypes.array.isRequired,
    currentYearMonth: PropTypes.array.isRequired,
    spending: PropTypes.object.isRequired,
    balance: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    startYearMonth: state.getIn(['pages', 'overview', 'data', 'startYearMonth']),
    currentYearMonth: state.getIn(['pages', 'overview', 'data', 'currentYearMonth']),
    spending: {
        valuesNet: GRAPH_SPEND_CATEGORIES.reduce(
            (data, { name }) => data.map((item, key) =>
                item - state.getIn(['pages', 'overview', 'data', 'cost', name, key])
            ),
            state.getIn(['pages', 'overview', 'data', 'cost', 'income'])
        ),
        valuesSpending: GRAPH_SPEND_CATEGORIES.reduce(
            (data, { name }) => data.map((item, key) =>
                item + state.getIn(['pages', 'overview', 'data', 'cost', name, key])
            ),
            state.getIn(['pages', 'overview', 'data', 'cost', 'income'])
                .map(() => 0)
        )
    },
    balance: {
        cost: state.getIn(['pages', 'overview', 'data', 'cost']),
        showAll: state.getIn(['other', 'showAllBalanceGraph']),
        targets: state.getIn(['pages', 'overview', 'data', 'targets'])
    }
});

const mapDispatchToProps = dispatch => ({
    onShowAll: () => dispatch(aShowAllToggled())
});

export default connect(mapStateToProps, mapDispatchToProps)(OverviewGraphs);

