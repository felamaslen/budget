import gql from 'graphql-tag';

export const planningSchema = gql`
  type TaxRate {
    name: String!
    value: Float!
  }

  type TaxThreshold {
    name: String!
    value: NonNegativeInt!
  }

  type PlanningParameters {
    rates: [TaxRate!]!
    thresholds: [TaxThreshold!]!
  }

  type PlanningIncome {
    id: NonNegativeInt!
    startDate: Date!
    endDate: Date!
    salary: NonNegativeInt!
    taxCode: String!
    pensionContrib: Float!
    studentLoan: Boolean!
  }

  type PlanningCreditCardPayment {
    id: NonNegativeInt!
    month: NonNegativeInt!
    value: Int!
  }

  type PlanningCreditCard {
    id: NonNegativeInt!
    netWorthSubcategoryId: NonNegativeInt!
    payments: [PlanningCreditCardPayment!]!
    predictedPayment: Int
  }

  type PlanningValue {
    id: NonNegativeInt!
    month: NonNegativeInt!
    transferToAccountId: NonNegativeInt
    name: String!
    value: Int
    formula: String
  }

  type PlanningComputedValue {
    key: String!
    month: NonNegativeInt!
    name: String!
    value: Int!
    isVerified: Boolean!
    isTransfer: Boolean!
  }

  type PlanningAccount {
    id: NonNegativeInt!
    account: String!
    netWorthSubcategoryId: NonNegativeInt!
    income: [PlanningIncome!]!
    creditCards: [PlanningCreditCard!]!
    values: [PlanningValue!]!
    computedValues: [PlanningComputedValue!]!
    computedStartValue: Int
    upperLimit: Int
    lowerLimit: Int
  }

  type PlanningSyncResponse {
    error: String
    year: NonNegativeInt
    parameters: PlanningParameters
    accounts: [PlanningAccount!]
    taxReliefFromPreviousYear: Int
  }

  input PlanningTaxRateInput {
    name: String!
    value: Float!
  }

  input PlanningTaxThresholdInput {
    name: String!
    value: NonNegativeInt!
  }

  input PlanningParametersInput {
    rates: [PlanningTaxRateInput!]!
    thresholds: [PlanningTaxThresholdInput!]!
  }

  input PlanningIncomeInput {
    id: NonNegativeInt
    startDate: Date!
    endDate: Date!
    salary: NonNegativeInt!
    taxCode: String!
    pensionContrib: Float!
    studentLoan: Boolean!
  }

  input PlanningCreditCardPaymentInput {
    id: NonNegativeInt
    month: NonNegativeInt!
    value: Int!
  }

  input PlanningCreditCardInput {
    id: NonNegativeInt
    netWorthSubcategoryId: NonNegativeInt!
    payments: [PlanningCreditCardPaymentInput!]!
  }

  input PlanningValueInput {
    id: NonNegativeInt
    month: NonNegativeInt!
    transferToAccountId: NonNegativeInt
    name: String!
    value: Int
    formula: String
  }

  input PlanningAccountInput {
    id: NonNegativeInt
    account: String!
    netWorthSubcategoryId: NonNegativeInt!
    income: [PlanningIncomeInput!]!
    creditCards: [PlanningCreditCardInput!]!
    values: [PlanningValueInput!]!
    upperLimit: Int
    lowerLimit: Int
  }

  input PlanningSync {
    parameters: PlanningParametersInput!
    accounts: [PlanningAccountInput!]!
  }

  extend type Mutation {
    syncPlanning(year: NonNegativeInt!, input: PlanningSync): PlanningSyncResponse
  }
`;
