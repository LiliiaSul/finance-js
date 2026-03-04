import { TokensType } from "./tokens.type";
import { ValidationErrorType } from "./validation-error.type";

export type RefreshResponseType = {
    tokens?: TokensType;
    error?: boolean;
    message?: string;
    validation?: ValidationErrorType[];
}