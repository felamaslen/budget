import { memo, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { AccessibleListItemField } from '../field';
import { ListFieldMobile } from '../mobile';
import { getItem } from '../selectors';
import * as Styled from '../styles';
import type { Fields, FieldKey, PropsItem, PropsCrud, RowComponent } from '../types';
import { useCTA } from '~client/hooks';
import { ButtonDelete } from '~client/styled/shared/button';
import type { Id, PageList, WithIds } from '~client/types';
import type { ListItemInput } from '~client/types/gql';
import type { Create } from '~shared/types';

const identityProcessor = <E extends Record<string, unknown>>(): Partial<E> => ({});

type FieldProps<I extends ListItemInput, E extends Record<string, unknown>> = Pick<
  PropsCrud<I>,
  'onUpdate'
> & {
  fields: Fields<Create<I>, E>;
  field: FieldKey<Create<I>>;
  id: Id;
  item: WithIds<I>;
  extraProps?: Partial<E>;
};

const ListField = <I extends ListItemInput, E extends Record<string, unknown>>({
  fields,
  field,
  id,
  item,
  onUpdate,
  extraProps,
}: FieldProps<I, E>): React.ReactElement => {
  const onChange = useCallback(
    (newValue): void => {
      if (newValue) {
        onUpdate(id, { [field]: newValue } as Partial<I>, item);
      }
    },
    [field, id, item, onUpdate],
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
  I extends ListItemInput,
  P extends PageList,
  MK extends keyof I,
  E extends Record<string, unknown> = never,
>({
  fields,
  fieldsMobile = {},
  id,
  page,
  isMobile,
  style,
  odd,
  extraProps,
  onUpdate,
  onDelete,
  onActivateModal,
  itemProcessor = identityProcessor,
  Row = Styled.Row as RowComponent<I, E>,
}: PropsItem<I, P, MK, E>): React.ReactElement => {
  const item: WithIds<I> = useSelector(getItem<WithIds<I>, P>(page, id));
  const onDeleteItem = useCallback((): void => onDelete(item.id, item), [onDelete, item]);
  const deleteEvents = useCTA(onDeleteItem);
  const specificExtraProps = useMemo<Partial<E>>(() => itemProcessor(item), [item, itemProcessor]);
  const itemExtraProps = useMemo<Partial<E>>(
    () => ({ ...(extraProps ?? {}), ...specificExtraProps }),
    [extraProps, specificExtraProps],
  );

  const onActivate = useCallback(() => onActivateModal(id), [id, onActivateModal]);
  const activateProps = useCTA(onActivate);

  if (isMobile) {
    const fieldKeysMobile = Object.keys(fieldsMobile) as MK[];

    return (
      <Row role="button" style={style} isMobile={true} item={item} {...itemExtraProps}>
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

  const fieldKeys = Object.keys(fields) as FieldKey<Create<I>>[];

  return (
    <Row isMobile={false} item={item} style={style} odd={odd} {...itemExtraProps}>
      {fieldKeys.map((field) => (
        <ListField<I, E>
          key={field as string}
          fields={fields}
          field={field}
          id={item.id}
          item={item}
          onUpdate={onUpdate}
          extraProps={itemExtraProps}
        />
      ))}
      <ButtonDelete {...deleteEvents}>&minus;</ButtonDelete>
    </Row>
  );
};

const typedMemo: <T>(c: T) => T = memo;
const AccessibleListItemMemoised = typedMemo(AccessibleListItem);

export { AccessibleListItemMemoised as AccessibleListItem };
