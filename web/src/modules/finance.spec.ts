import { abbreviateFundName, extractLongName } from './finance';

describe('Finance module', () => {
  describe('abbreviateFundName', () => {
    it.each`
      short             | long
      ${'SMT'}          | ${'Scottish Mortgage IT Ordinary Shares 5p (share)'}
      ${'SMT'}          | ${'Scottish Mortgage IT PLC Ordinary Shares 5p (share)'}
      ${'FCSS'}         | ${'Fidelity China Special Situations Ord 0.01 (share)'}
      ${'CTY'}          | ${'City of London Investment Trust ORD 25p (share)'}
      ${'L&G Int. Ix'}  | ${'Legal and General International Index Trust C (accum.)'}
      ${'FGT'}          | ${'Finsbury Growth And Inc Trust Ord 25p Share (share)'}
      ${'PCT'}          | ${'Polar Capital Technology Trust Ord 25p (share)'}
      ${'ATT'}          | ${'Allianz Technology Trust Ordinary 25p (share)'}
      ${'Thrdndl UK'}   | ${'Threadneedle UK Equity Income Class L (accum.)'}
      ${'Jptr Asian'}   | ${'Jupiter Asian Income Class I (accum.)'}
      ${'Mn GLG Japan'} | ${'Man GLG Japan CoreAlpha Professional (accum.)'}
      ${'BNKR'}         | ${'Bankers Investment Trust Ord 25p Share (share)'}
      ${'MNKS'}         | ${'Monks Investment Trust Ordinary 5p (share)'}
      ${'RELX'}         | ${'RELX Plc Ord 14 51116p (share)'}
      ${'BGSN'}         | ${'Baillie Gifford Shin Nippon Ord 2p Shares (share)'}
    `('should abbreviate "$long" to "$short"', ({ short, long }) => {
      expect.assertions(1);
      expect(abbreviateFundName(long)).toBe(short);
    });

    it('should abbreviate a standard stock', () => {
      expect.assertions(1);
      expect(abbreviateFundName('The Biotech Growth Trust (BIOG.L) (stock)')).toBe('BIOG');
    });
  });

  describe('extractLongName', () => {
    describe('a standard stock', () => {
      it('should drop the code and return the long name', () => {
        expect.assertions(1);
        expect(extractLongName('The Biotech Growth Trust (BIOG.L) (stock)')).toBe(
          'The Biotech Growth Trust',
        );
      });
    });

    describe('a broker-specific holding', () => {
      it('should be returned as a stock code', () => {
        expect.assertions(1);
        expect(extractLongName('Finsbury Growth And Inc Trust Ord 25p Share (share)')).toBe('FGT');
      });
    });

    describe('an invalid fund name', () => {
      it('should be returned as-is', () => {
        expect.assertions(1);
        expect(extractLongName('Some invalid fund name')).toBe('Some invalid fund name');
      });
    });
  });
});
