export type OperationsDataType = {
    id: number;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    comment: string;
    category_id?: number;
}
