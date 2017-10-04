import { List as list } from 'immutable';
import extendableContainer from '../containerExtender';

import React from 'react';
import PureComponent from '../ImmutableComponent';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueries } from '../../misc/const';

import { HeadMobileContainer as getHeadMobile } from './HeadMobile';
import { HeadContainer as getHead } from './Head';

import AddForm from './AddForm';
import { ListRowContainer as getListRowDefault } from './ListRow';

export class Body extends PureComponent {
    constructor(props) {
        super(props);

        this.ListRow = this.getListRow();
    }
    headMobile(render) {
        if (!render) {
            return null;
        }

        const HeadMobile = getHeadMobile(this.props.pageIndex);

        return <HeadMobile />;
    }
    headDesktop (render) {
        if (!render) {
            return null;
        }

        const Head = getHead(this.props.pageIndex);

        return <Head />;
    }
    getListRow() {
        return getListRowDefault(this.props.pageIndex);
    }
    renderHead() {
        return <li className="list-head">
            <Media query={mediaQueries.mobile}>{render => this.headMobile(render)}</Media>
            <Media query={mediaQueries.desktop}>{render => this.headDesktop(render)}</Media>
        </li>;
    }
    render() {
        const rows = this.props.rowIds.map(id => <this.ListRow key={id} id={id} />);

        return <ul className="list-ul">
            {this.renderHead()}
            <AddForm pageIndex={this.props.pageIndex} />
            {rows}
        </ul>;
    }
}

Body.propTypes = {
    pageIndex: PropTypes.number.isRequired,
    rowIds: PropTypes.instanceOf(list).isRequired
};

const stateDefault = pageIndex => state => ({
    pageIndex,
    rowIds: state
        .getIn(['global', 'pages', pageIndex, 'rows'])
        .keySeq()
        .toList()
});

const dispatchDefault = () => () => ({});

export const BodyContainer = pageIndex =>
    extendableContainer(stateDefault, dispatchDefault)(pageIndex)()(Body);

export default extendableContainer(stateDefault, dispatchDefault);

