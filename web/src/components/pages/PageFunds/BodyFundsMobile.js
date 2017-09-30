import connect, { BodyMobile, mapDispatchToProps } from '../../PageList/BodyMobile';

import getListRowMobileFunds from './ListRowFundsMobile';

export class BodyFundsMobile extends BodyMobile {
    constructor(props) {
        super(props);

        this.ListRowMobile = getListRowMobileFunds(this.props.pageIndex);
    }
}

export default pageIndex => connect(pageIndex)(null, mapDispatchToProps)(BodyFundsMobile);

