import React, { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AccessibleListItemField } from '../field';
import { ListFieldMobile } from '../mobile';
import { getItem } from '../selectors';
import * as Styled from '../styles';
import { Fields, FieldKey, PropsItem, PropsCrud } from '../types';
import { useCTA } from '~client/hooks/cta';
import { ButtonDelete } from '~client/styled/shared/button';
import { DeltaEdit, Item } from '~client/types';

const identityProcessor = <E extends {}>(): Partial<E> => ({});

type FieldProps<I extends Item, P extends string, E extends {}> = Pick<
  PropsCrud<I, P>,
  'onUpdate'
> & {
  fields: Fields<I, E>;
  field: FieldKey<I>;
  item: I;
  extraProps?: Partial<E>;
};

const ListField = <I extends Item, P extends string, E extends {}>({
  fields,
  field,
  item,
  onUpdate,
  extraProps,
}: FieldProps<I, P, E>): React.ReactElement<FieldProps<I, P, E>> => {
  const onChange = useCallback(
    (newValue): void => {
      if (newValue) {
        onUpdate(item.id, { [field]: newValue } as DeltaEdit<I>, item);
      }
    },
    [field, item, onUpdate],
  );

  return (
    <AccessibleListItemField
      field={field}
      Field={fields[field]}
      value={item[field]}
      onChange={onChange}
      extraProps={extraProps}
    />
  );
};

const AccessibleListItem = <
  I extends Item,
  P extends string,
  MK extends keyof I,
  E extends {} = {}
>({
  fields,
  fieldsMobile = {},
  id,
  page,
  isMobile,
  onUpdate,
  onDelete,
  onActivateModal,
  extraProps,
  itemProcessor = identityProcessor,
  Row = Styled.Row,
}: PropsItem<I, P, MK, E>): React.ReactElement<PropsItem<I, P, MK, E>> => {
  const item = useSelector(getItem<I, P>(page, id)) as I;
  const onDeleteItem = useCallback((): void => onDelete(item.id, item), [onDelete, item]);
  const deleteEvents = useCTA(onDeleteItem);
  const specificExtraProps = useMemo<Partial<E>>(() => itemProcessor(item), [item, itemProcessor]);
  const itemExtraProps = useMemo<Partial<E>>(() => ({ ...extraProps, ...specificExtraProps }), [
    extraProps,
    specificExtraProps,
  ]);

  const onActivate = useCallback(() => onActivateModal(id), [id, onActivateModal]);
  const activateProps = useCTA(onActivate);

  if (isMobile) {
    const fieldKeysMobile = Object.keys(fieldsMobile) as MK[];

    return (
      <Row role="button" isMobile={true} item={item} {...itemExtraProps}>
        <Styled.MobileRow {...activateProps}>
          {fieldKeysMobile.map((field: MK) => (
            <ListFieldMobile<I, MK, E>
              key={field as string}
              fieldsMobile={fieldsMobile}
              field={field}
              item={item}
              extraProps={itemExtraProps}
            />
          ))}
        </Styled.MobileRow>
      </Row>
    );
  }

  const fieldKeys = Object.keys(fields) as FieldKey<I>[];

  return (
    <Row isMobile={false} item={item} {...itemExtraProps}>
      {fieldKeys.map((field: FieldKey<I>) => (
        <ListField<I, P, E>
          key={field as string}
          fields={fields}
          field={field}
          item={item}
          onUpdate={onUpdate}
          extraProps={itemExtraProps}
        />
      ))}
      <ButtonDelete {...deleteEvents}>&minus;</ButtonDelete>
    </Row>
  );
};

const typedMemo: <T>(c: T) => T = React.memo;
const AccessibleListItemMemoised = typedMemo(AccessibleListItem);

export { AccessibleListItemMemoised as AccessibleListItem };
