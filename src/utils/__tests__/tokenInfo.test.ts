import { decodeToken } from '../tokenInfo';

function base64Url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function makeToken(payload: unknown): string {
  const header = base64Url({ alg: 'HS256', typ: 'JWT' });
  return `${header}.${base64Url(payload)}.fake-signature`;
}

describe('decodeToken', () => {
  it('geçerli token\'dan oda ve identity çıkarır', () => {
    const token = makeToken({
      sub: 'talha',
      video: { room: 'incident-test', roomJoin: true },
    });
    expect(decodeToken(token)).toEqual({
      room: 'incident-test',
      identity: 'talha',
    });
  });

  it('Türkçe karakterli identity\'yi doğru çözer (UTF-8)', () => {
    const token = makeToken({ sub: 'çağrı', video: { room: 'oda' } });
    expect(decodeToken(token).identity).toBe('çağrı');
  });

  it('3 parçalı olmayan token\'da hata fırlatır', () => {
    expect(() => decodeToken('not-a-jwt')).toThrow();
  });

  it('payload geçersiz base64/JSON ise hata fırlatır', () => {
    expect(() => decodeToken('a.!!!notbase64!!!.c')).toThrow();
  });

  it('room veya identity eksikse hata fırlatır', () => {
    expect(() => decodeToken(makeToken({ sub: 'talha' }))).toThrow();
    expect(() => decodeToken(makeToken({ video: { room: 'oda' } }))).toThrow();
  });
});
