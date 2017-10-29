import connect, { BodyMobile, mapDispatchToProps } from '../../list/body/mobile';
import getListRowMobileFunds from '../row/mobile';

export class BodyFundsMobile extends BodyMobile {
    listRowMobile() {
        return getListRowMobileFunds(this.props.pageIndex);
    }
}

export default pageIndex => connect(pageIndex)(null, mapDispatchToProps)(BodyFundsMobile);

