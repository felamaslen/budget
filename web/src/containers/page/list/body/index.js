import { List as list } from 'immutable';
import extendableContainer from '../../../container-extender';

import React from 'react';
import PureComponent from '../../../../immutable-component';
import PropTypes from 'prop-types';
import Media from 'react-media';
import { mediaQueries } from '../../../../misc/const';

import { HeadMobileContainer as getHeadMobile } from '../head/mobile';
import { HeadContainer as getHead } from '../head';
import AddForm from '../add-form';
import { ListRowContainer as getListRowDefault } from '../row';

export class Body extends PureComponent {
    constructor(props) {
        super(props);

        this.ListRow = this.listRow();
    }
    headMobile(render) {
        if (!render) {
            return null;
        }

        const HeadMobile = getHeadMobile(this.props.pageIndex);

        return <HeadMobile />;
    }
    headDesktop(render) {
        if (!render) {
            return null;
        }

        const Head = getHead(this.props.pageIndex);

        return <Head />;
    }
    listRow() {
        return getListRowDefault(this.props.pageIndex);
    }
    render() {
        const rows = this.props.rowIds.map(id => <this.ListRow key={id} id={id} />);

        return <ul className="list-ul">
            <li className="list-head">
                <Media query={mediaQueries.mobile}>{render => this.headMobile(render)}</Media>
                <Media query={mediaQueries.desktop}>{render => this.headDesktop(render)}</Media>
            </li>
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
        .getIn(['pages', pageIndex, 'rows'])
        .keySeq()
        .toList()
});

const dispatchDefault = () => () => ({});

export const BodyContainer = pageIndex =>
    extendableContainer(stateDefault, dispatchDefault)(pageIndex)()(Body);

export default extendableContainer(stateDefault, dispatchDefault);

