export type ValidatableElementType = {
    element: HTMLInputElement | null;
    options?: ValidationOptionsType;
}

export type ValidationOptionsType = {
    pattern?: RegExp;
    compareTo?: string;
}

