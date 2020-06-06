export type IPLog = {
  time: Date;
  count: number;
};

export type IPLogRow = Omit<IPLog, 'time'> & { time: string };
