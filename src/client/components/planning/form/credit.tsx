import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import { useCreditCards } from '../hooks';
import type { Account } from '../types';

import * as StyledForm from './styles';

import { FormFieldSelect, SelectOptions } from '~client/components/form-field';
import { ButtonAdd, Flex, H6 } from '~client/styled/shared';
import { NetWorthSubcategory } from '~client/types/gql';

export type Props = {
  tempAccount: Account;
  setTempAccount: Dispatch<SetStateAction<Account>>;
  updateAndSave: Dispatch<SetStateAction<Account>>;
};

export const CreditEditForm: React.FC<Props> = ({ tempAccount, updateAndSave }) => {
  const creditCards = useCreditCards();

  const attachedCreditCards = useMemo(
    () =>
      tempAccount.creditCards
        .map((row) => creditCards.find((compare) => compare.id === row.netWorthSubcategoryId))
        .filter((row: NetWorthSubcategory | undefined): row is NetWorthSubcategory => !!row)
        .sort((a, b) => (a.subcategory < b.subcategory ? -1 : 1)),
    [tempAccount.creditCards, creditCards],
  );

  const availableCreditCards = useMemo<SelectOptions<number | undefined>>(
    () => [
      { internal: undefined, external: '' },
      ...creditCards
        .filter(
          (compare) => !attachedCreditCards.some((creditCard) => creditCard.id === compare.id),
        )
        .map((creditCard) => ({
          internal: creditCard.id,
          external: creditCard.subcategory,
        })),
    ],
    [attachedCreditCards, creditCards],
  );

  const [newCreditCard, setNewCreditCard] = useState<number | undefined>(undefined);
  useEffect(() => {
    setNewCreditCard(undefined);
  }, [availableCreditCards]);

  const addCreditCard = useCallback(() => {
    if (newCreditCard) {
      updateAndSave((prevAccount) => ({
        ...prevAccount,
        creditCards: [
          ...prevAccount.creditCards,
          {
            netWorthSubcategoryId: newCreditCard,
            payments: [],
          },
        ],
      }));
    }
  }, [newCreditCard, updateAndSave]);

  return (
    <StyledForm.CreditEditForm>
      <H6>Credit cards</H6>
      <ul>
        {attachedCreditCards.map((row) => (
          <li key={row.id}>{row.subcategory}</li>
        ))}
      </ul>
      <Flex>
        <FormFieldSelect
          value={newCreditCard}
          onChange={setNewCreditCard}
          options={availableCreditCards}
        />
        <ButtonAdd onClick={addCreditCard} disabled={!availableCreditCards.length}>
          +
        </ButtonAdd>
      </Flex>
    </StyledForm.CreditEditForm>
  );
};
