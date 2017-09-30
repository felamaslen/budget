import connect, { Body } from '../../PageList/Body';

import ListRowFunds from './ListRowFunds';

export class BodyFunds extends Body {
    getListRow() {
        return ListRowFunds;
    }
}

const mapStateToProps = () => () => ({});

const mapDispatchToProps = () => () => ({});

export default pageIndex => connect(pageIndex)(mapStateToProps, mapDispatchToProps)(BodyFunds);

