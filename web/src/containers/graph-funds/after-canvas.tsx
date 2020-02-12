import React, { memo, useCallback } from 'react';
import { rgb } from 'polished';

import { Mode, Period, GRAPH_FUNDS_PERIODS } from '~client/constants/graph';
import { Color } from '~client/constants/colors';
import { FundItem } from '~client/types/funds';

import * as Styled from './styles';

type ToggleList = {
    [id: string]: boolean | null;
};

type SetToggleList = (getNextToggleList: (prevToggleList: ToggleList) => ToggleList) => void;

type ItemProps = {
    numItems: number;
    toggleList: ToggleList;
    setToggleList: SetToggleList;
    id: string;
    color: Color;
    item: string;
};

export type Props = {
    isMobile: boolean;
    period: Period;
    mode: Mode;
    fundItems: FundItem[];
    toggleList: ToggleList;
    setToggleList: SetToggleList;
    changePeriod: (nextPeriod: Period) => void;
};

const Item: React.FC<ItemProps> = ({ numItems, toggleList, setToggleList, id, color, item }) => {
    const onToggle = useCallback(
        () =>
            setToggleList(
                (last: ToggleList): ToggleList => {
                    const next = { ...last, [id]: last[id] === false };
                    if (
                        Object.keys(next).length === numItems &&
                        Object.keys(next).every(value => !next[value])
                    ) {
                        return last;
                    }

                    return next;
                },
            ),
        [id, setToggleList, numItems],
    );

    return (
        <li onClick={onToggle}>
            <Styled.SidebarCheckbox
                style={{
                    borderColor: rgb(color[0], color[1], color[2]),
                }}
                checked={toggleList[id] !== false}
            ></Styled.SidebarCheckbox>
            <Styled.SidebarFund>{item}</Styled.SidebarFund>
        </li>
    );
};

export const AfterCanvas: React.FC<Props> = ({
    isMobile,
    period,
    mode,
    fundItems,
    toggleList,
    setToggleList,
    changePeriod,
}) => {
    const onChange = useCallback(evt => changePeriod(evt.target.value), [changePeriod]);

    return (
        <div>
            {!isMobile && (
                <Styled.FundSidebar>
                    <li>
                        <select defaultValue={period} onChange={onChange}>
                            {GRAPH_FUNDS_PERIODS.map(([value, display]) => (
                                <option key={value} value={value}>
                                    {display}
                                </option>
                            ))}
                        </select>
                    </li>
                    {fundItems &&
                        fundItems.map((item: FundItem) => (
                            <Item
                                key={item.id}
                                numItems={fundItems.length}
                                {...item}
                                toggleList={toggleList}
                                setToggleList={setToggleList}
                            />
                        ))}
                </Styled.FundSidebar>
            )}
            <Styled.Mode>Mode: {mode}</Styled.Mode>
        </div>
    );
};
