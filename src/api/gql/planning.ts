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
    year: NonNegativeInt!
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

  type PlanningPastIncome {
    date: Date!
    gross: NonNegativeInt!
    deductions: [IncomeDeduction!]!
  }

  type PlanningCreditCardPayment {
    id: NonNegativeInt!
    year: NonNegativeInt!
    month: NonNegativeInt!
    value: Int!
  }

  type PlanningCreditCard {
    id: NonNegativeInt!
    netWorthSubcategoryId: NonNegativeInt!
    payments: [PlanningCreditCardPayment!]!
  }

  type PlanningValue {
    id: NonNegativeInt!
    year: NonNegativeInt!
    month: NonNegativeInt!
    transferToAccountId: NonNegativeInt
    name: String!
    value: Int
    formula: String
  }

  type PlanningAccount {
    id: NonNegativeInt!
    account: String!
    netWorthSubcategoryId: NonNegativeInt!
    income: [PlanningIncome!]!
    pastIncome: [PlanningPastIncome!]!
    creditCards: [PlanningCreditCard!]!
    values: [PlanningValue!]!
    upperLimit: Int
    lowerLimit: Int
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
    year: NonNegativeInt!
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
    year: NonNegativeInt!
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
    year: NonNegativeInt!
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
    parameters: [PlanningParametersInput!]!
    accounts: [PlanningAccountInput!]!
  }

  type PlanningSyncResponse {
    error: String
    parameters: [PlanningParameters!]
    accounts: [PlanningAccount!]
  }

  type PlanningParametersResponse {
    parameters: [PlanningParameters!]!
  }

  type PlanningAccountsResponse {
    accounts: [PlanningAccount!]!
  }

  extend type Mutation {
    syncPlanning(input: PlanningSync): PlanningSyncResponse
  }
`;
