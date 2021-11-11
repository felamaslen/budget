import { RefObject, useCallback, useEffect, useRef } from 'react';
import { usePlanningContext } from './context';

import { Header } from './header';
import { Month } from './month';
import { MonthHeaders } from './month-headers';
import * as Styled from './styles';
import type { PlanningData } from './types';

export type Props = {
  year: number;
  tableData: PlanningData[];
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
    const cancelScrollEvents = (element: HTMLDivElement | null): void => {
      if (element) {
        // eslint-disable-next-line no-param-reassign
        element.onwheel = (e): void => {
          e.preventDefault();
        };
        // eslint-disable-next-line no-param-reassign
        element.ontouchstart = (e): void => {
          e.preventDefault();
        };
      }
    };
    cancelScrollEvents(monthHeadersRef.current);
    cancelScrollEvents(headerRef.current);
  }, []);

  return { monthHeadersRef, headerRef, scrollAreaRef, onScroll };
}

export const Table: React.FC = () => {
  const scroll = useSynchronisedScroll();
  const { state, table } = usePlanningContext();
  return (
    <Styled.Table>
      <MonthHeaders ref={scroll.monthHeadersRef} tableData={table} />
      <Styled.TableWithoutLeftHeader>
        <Header ref={scroll.headerRef} />
        <Styled.TableScrollArea ref={scroll.scrollAreaRef} onScroll={scroll.onScroll}>
          <Styled.MonthGroups>
            {table.map((dataForMonth, index) => (
              <Month
                key={`${state.year}-${dataForMonth.month}`}
                year={state.year}
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
