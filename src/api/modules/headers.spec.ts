import { Socket } from 'net';
import { Request } from 'express';
import { getIp } from '~api/modules/headers';

describe('getIp', () => {
  it('gets X-Real-IP', () => {
    expect.assertions(2);
    expect(
      getIp({
        headers: {
          'x-real-ip': '1.2.3.4',
        },
      }),
    ).toBe('1.2.3.4');

    expect(
      getIp({
        headers: {
          'X-Real-Ip': '5.3.5.1',
        },
      }),
    ).toBe('5.3.5.1');
  });

  it('gets X-Forwarded-For', () => {
    expect.assertions(2);
    expect(
      getIp({
        headers: {
          'x-forwarded-for': '1.2.3.4',
        },
      }),
    ).toBe('1.2.3.4');

    expect(
      getIp({
        headers: {
          'X-Forwarded-For': '5.3.5.1',
        },
      }),
    ).toBe('5.3.5.1');
  });

  it('uses the remote address', () => {
    expect.assertions(1);
    expect(
      getIp({
        connection: {
          remoteAddress: '1.2.3.4',
        } as Socket,
      }),
    ).toBe('1.2.3.4');
  });

  it('returns an empty string if nothing else works', () => {
    expect.assertions(1);
    expect(getIp({} as Request)).toBe('');
  });
});
