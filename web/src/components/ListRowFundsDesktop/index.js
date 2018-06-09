import { Map as map } from 'immutable';
import { PAGES } from '../../constants/data';
import React from 'react';
import ImmutableComponent from '../../ImmutableComponent';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import GraphFundItem from '../GraphFundItem';
import FundGainInfo from '../FundGainInfo';

export default class ListRowFundsDesktop extends ImmutableComponent {
    static propTypes = {
        row: PropTypes.instanceOf(map).isRequired
    };
    constructor(props) {
        super(props);

        this.state = {
            popout: false
        };
    }
    onToggleGraph() {
        this.setState({ popout: !this.state.popout });
    }
    render() {
        const { row } = this.props;
        const { popout } = this.state;

        const itemKey = PAGES.funds.cols.indexOf('item');
        const name = row.getIn(['cols', itemKey])
            .toLowerCase()
            .replace(/\W+/g, '-');

        const sold = row.get('sold');

        const className = classNames('fund-extra-info', { popout });

        return (
            <span className={className}>
                <span className="fund-graph">
                    <div className="fund-graph-cont">
                        <GraphFundItem name={name}
                            sold={sold}
                            values={row.get('prices')}
                            popout={popout}
                            onToggle={() => this.onToggleGraph()}
                        />
                    </div>
                </span>
                <FundGainInfo gain={row.get('gain')} sold={sold} />
            </span>
        );
    }
}

