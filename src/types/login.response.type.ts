import {ValidationErrorType} from "./validation-error.type";

export type LoginResponseType = {
    tokens?: {
        accessToken: string;
        refreshToken: string;
    };
    user?: {
        name: string;
        lastName: string;
        id: number;
    };
    error?: boolean;
    message?: string;
    validation?: ValidationErrorType[];
}