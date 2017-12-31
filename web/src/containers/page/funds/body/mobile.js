import connect, { BodyMobile, mapDispatchToProps } from '../../list/body/mobile';
import getListRowMobileFunds from '../row/mobile';

export class BodyFundsMobile extends BodyMobile {
    listRowMobile() {
        return getListRowMobileFunds();
    }
}

export default () => connect('funds')(null, mapDispatchToProps)(BodyFundsMobile);

