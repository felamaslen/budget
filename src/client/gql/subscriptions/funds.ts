import { gql } from 'urql';

export const FundsChanged = gql`
  subscription FundsChanged {
    fundsChanged {
      created {
        fakeId
        item {
          ...FundParts
        }
      }
      updated {
        ...FundParts
      }
      deleted

      overviewCost
    }
  }
`;

export const FundPricesUpdated = gql`
  subscription FundPricesUpdated($period: FundPeriod, $length: NonNegativeInt) {
    fundPricesUpdated(period: $period, length: $length) {
      ...FundHistoryParts
    }
  }
`;

export const CashAllocationTargetUpdated = gql`
  subscription CashAllocationTargetUpdated {
    cashAllocationTargetUpdated
  }
`;

export const FundAllocationTargetsUpdated = gql`
  subscription FundAllocationTargetsUpdated {
    fundAllocationTargetsUpdated {
      deltas {
        id
        allocationTarget
      }
    }
  }
`;
