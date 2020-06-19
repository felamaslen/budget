import { abbreviateFundName } from './finance';

describe('Finance module', () => {
  describe('abbreviateFundName', () => {
    it.each`
      short             | long
      ${'SMT'}          | ${'Scottish Mortgage IT Ordinary Shares 5p (share)'}
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
      expect(abbreviateFundName(long)).toBe(short);
    });
  });
});
