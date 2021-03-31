import { gql } from 'urql';

export const NetWorthCategoryCreated = gql`
  subscription NetWorthCategoryCreated {
    netWorthCategoryCreated {
      item {
        id
        ...NetWorthCategoryParts
      }
    }
  }
`;

export const NetWorthCategoryUpdated = gql`
  subscription NetWorthCategoryUpdated {
    netWorthCategoryUpdated {
      item {
        id
        ...NetWorthCategoryParts
      }
    }
  }
`;

export const NetWorthCategoryDeleted = gql`
  subscription NetWorthCategoryDeleted {
    netWorthCategoryDeleted {
      id
    }
  }
`;

export const NetWorthSubcategoryCreated = gql`
  subscription NetWorthSubcategoryCreated {
    netWorthSubcategoryCreated {
      item {
        id
        ...NetWorthSubcategoryParts
      }
    }
  }
`;

export const NetWorthSubcategoryUpdated = gql`
  subscription NetWorthSubcategoryUpdated {
    netWorthSubcategoryUpdated {
      item {
        id
        ...NetWorthSubcategoryParts
      }
    }
  }
`;

export const NetWorthSubcategoryDeleted = gql`
  subscription NetWorthSubcategoryDeleted {
    netWorthSubcategoryDeleted {
      id
    }
  }
`;

export const NetWorthEntryCreated = gql`
  subscription NetWorthEntryCreated {
    netWorthEntryCreated {
      item {
        id
        ...NetWorthEntryParts
      }
    }
  }
`;

export const NetWorthEntryUpdated = gql`
  subscription NetWorthEntryUpdated {
    netWorthEntryUpdated {
      item {
        id
        ...NetWorthEntryParts
      }
    }
  }
`;

export const NetWorthEntryDeleted = gql`
  subscription NetWorthEntryDeleted {
    netWorthEntryDeleted {
      id
    }
  }
`;

export const NetWorthCashTotalUpdated = gql`
  subscription NetWorthCashTotalUpdated {
    netWorthCashTotalUpdated {
      cashInBank
      cashToInvest
      stockValue
      date
    }
  }
`;
