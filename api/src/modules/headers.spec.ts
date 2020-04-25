import { Socket } from 'net';
import { getIp } from '~api/modules/headers';

describe('getIp', () => {
  it('gets X-Real-IP', () => {
    expect(
      getIp({
        headers: {
          'x-real-ip': '1.2.3.4',
        },
      }),
    ).toEqual('1.2.3.4');

    expect(
      getIp({
        headers: {
          'X-Real-Ip': '5.3.5.1',
        },
      }),
    ).toEqual('5.3.5.1');
  });

  it('gets X-Forwarded-For', () => {
    expect(
      getIp({
        headers: {
          'x-forwarded-for': '1.2.3.4',
        },
      }),
    ).toEqual('1.2.3.4');

    expect(
      getIp({
        headers: {
          'X-Forwarded-For': '5.3.5.1',
        },
      }),
    ).toEqual('5.3.5.1');
  });

  it('uses the remote address', () => {
    expect(
      getIp({
        connection: {
          remoteAddress: '1.2.3.4',
        } as Socket,
      }),
    ).toEqual('1.2.3.4');
  });

  it('returns an empty string if nothing else works', () => {
    expect(getIp({})).toEqual('');
  });
});
