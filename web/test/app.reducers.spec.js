import { expect } from 'chai';
import itEach from 'it-each';
import appState from '../../server/webui/lib/reduction';

import {
    requestVPNStatus,
    toggleVPNStatus,
    handleVPNStatus
} from '../../server/webui/reducers/app.reducer';

import enGB from '../../server/webui/lang/en_GB.json';
import zhCN from '../../server/webui/lang/zh_CN.json';

const localisation = { enGB, zhCN };

itEach({ testPerIteration: true });

describe('App', () => {
    describe('reducers', () => {
        describe('requestVPNStatus', () => {
            it('should set loading status', () => {
                expect(requestVPNStatus(appState).get('loading')).to.be.equal(true);
            });
        });

        describe('handleVPNStatus', () => {
            it('should unset loading status', () => {
                expect(handleVPNStatus(appState).get('loading')).to.be.equal(false);
            });

            it.each(
                [
                    { lang: 'enGB' },
                    { lang: 'zhCN' }
                ],
                'should set vpnStatusText localised to %s',
                ['lang'],
                lang => {
                    const appStateLocalised = appState.set('lang', localisation[lang]);

                    const statusText = [true, false, null].map(
                        status => handleVPNStatus(appStateLocalised, status)
                    );

                    expect(statusText[0].get('vpnStatusText')).to.be.equal(lang.VPN_STATUS_ON);
                    expect(statusText[1].get('vpnStatusText')).to.be.equal(lang.VPN_STATUS_OFF);
                    expect(statusText[2].get('vpnStatusText')).to.be.equal(lang.VPN_STATUS_UNKNOWN);
                }
            );
        });

        describe('toggleVPNStatus', () => {
            it('should set loading status', () => {
                expect(toggleVPNStatus(appState).get('loading')).to.be.equal(true);
            });
        });
    });
});
