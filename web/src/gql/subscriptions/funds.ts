import gql from 'graphql-tag';

export const FundCreated = gql`
  subscription FundCreated {
    fundCreated {
      id
      fakeId
      item {
        item
        transactions {
          date
          units
          price
          taxes
          fees
        }
        allocationTarget
      }
      overviewCost
    }
  }
`;

export const FundUpdated = gql`
  subscription FundUpdated {
    fundUpdated {
      id
      item {
        item
        transactions {
          date
          units
          price
          taxes
          fees
        }
        allocationTarget
      }
      overviewCost
    }
  }
`;

export const FundDeleted = gql`
  subscription FundDeleted {
    fundDeleted {
      id
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
