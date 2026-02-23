export type ValidatableElementType = {
    element: HTMLInputElement | HTMLSelectElement | null;
    options?: ValidationOptionsType;
}

export type ValidationOptionsType = {
    pattern?: RegExp;
    compareTo?: string;
}

