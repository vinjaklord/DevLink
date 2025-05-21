import { getHash, checkHash, getZodiac } from '../common/index.js';

describe('A suite', function () {
  it('contains a spec with an expectation', function () {
    expect(true).toBe(true);
  });

  it('Prüfe Hashing', () => {
    const password = 'mausi2025';
    const hash = getHash(password);
    const result = checkHash(password, hash);
    expect(result).toBe(true);
  });

  // ist absichtlich falsch
  it('Tierkreiszeichen checken', () => {
    const zodiac = getZodiac(1966, 1, 21);
    expect(zodiac).toBe('Aquarius');
  });
});

// test
