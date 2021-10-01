import React, { RefObject, useCallback, useEffect, useRef } from 'react';

import { Header } from './header';
import { Month } from './month';
import { MonthHeaders } from './month-headers';
import * as Styled from './styles';
import type { PlanningData } from './types';

export type Props = {
  year: number;
  planningData: PlanningData[];
};

function useSynchronisedScroll(): {
  monthHeadersRef: RefObject<HTMLDivElement>;
  headerRef: RefObject<HTMLDivElement>;
  scrollAreaRef: RefObject<HTMLDivElement>;
  onScroll: () => void;
} {
  const monthHeadersRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const onScroll = useCallback((): void => {
    if (!scrollAreaRef.current) {
      return;
    }
    headerRef.current?.scrollTo(scrollAreaRef.current.scrollLeft, 0);
    monthHeadersRef.current?.scrollTo(0, scrollAreaRef.current.scrollTop);
  }, []);

  useEffect(() => {
    if (monthHeadersRef.current) {
      monthHeadersRef.current.onwheel = (e): void => {
        e.preventDefault();
      };
    }
    if (headerRef.current) {
      headerRef.current.onwheel = (e): void => {
        e.preventDefault();
      };
    }
  }, []);

  return { monthHeadersRef, headerRef, scrollAreaRef, onScroll };
}

export const Table: React.FC<Props> = ({ year, planningData }) => {
  const scroll = useSynchronisedScroll();
  return (
    <Styled.Table>
      <MonthHeaders ref={scroll.monthHeadersRef} planningData={planningData} />
      <Styled.TableWithoutLeftHeader>
        <Header ref={scroll.headerRef} />
        <Styled.TableScrollArea ref={scroll.scrollAreaRef} onScroll={scroll.onScroll}>
          <Styled.MonthGroups>
            {planningData.map((dataForMonth, index) => (
              <Month
                key={`${year}-${dataForMonth.month}`}
                year={year}
                dataForMonth={dataForMonth}
                isStart={index === 0}
              />
            ))}
          </Styled.MonthGroups>
        </Styled.TableScrollArea>
      </Styled.TableWithoutLeftHeader>
    </Styled.Table>
  );
};
