declare module 'slonik-interceptor-query-logging' {
  import { InterceptorType } from 'slonik';

  export const createQueryLoggingInterceptor: () => InterceptorType;
}
