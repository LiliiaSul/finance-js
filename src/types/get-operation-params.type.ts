export type GetOperationParamsType = {
    period?: 'today' | 'week' | 'month' | 'year' | 'all' | 'interval';
    dateFrom?: string;
    dateTo?: string;
}