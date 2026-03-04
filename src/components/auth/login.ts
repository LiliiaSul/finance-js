import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {ToggleUtils} from "../../utils/toggle-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {ValidatableElementType} from "../../types/validatable.element.type";
import {UserInfoType} from "../../types/user-info.type";
import {TokensType} from "../../types/tokens.type";

export class Login {
    readonly openNewRoute: OpenNewRouteType;
    readonly emailElement: HTMLInputElement;
    readonly passwordElement: HTMLInputElement;
    readonly rememberMeElement: HTMLInputElement;
    readonly commonErrorElement: HTMLElement;
    readonly togglePassword: HTMLElement;
    readonly validations: ValidatableElementType[] = [];
    readonly submitButton: HTMLElement;


    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        const emailElement = document.getElementById('email') as HTMLInputElement | null;
        if (emailElement === null) {
            throw new Error('Email элемент не найден');
        }
        this.emailElement = emailElement;

        const passwordElement = document.getElementById('password') as HTMLInputElement | null;
        if (passwordElement === null) {
            throw new Error('Password элемент не найден');
        }
        this.passwordElement = passwordElement;

        const rememberMeElement = document.getElementById('remember-me') as HTMLInputElement | null;
        if (rememberMeElement === null) {
            throw new Error('Remember Me элемент не найден');
        }
        this.rememberMeElement = rememberMeElement;

        const commonErrorElement: HTMLElement | null = document.getElementById('common-error');
        if (commonErrorElement === null) {
            throw new Error('Common Error элемент не найден');
        }
        this.commonErrorElement = commonErrorElement;

        const togglePassword: HTMLElement | null = document.getElementById('togglePassword');
        if (togglePassword === null) {
            throw new Error('Toggle Password элемент не найден');
        }
        this.togglePassword = togglePassword;

        const submitButton: HTMLElement | null = document.getElementById('submit');
        if (submitButton === null) {
            throw new Error('Submit Button элемент не найден');
        }
        this.submitButton = submitButton;

        if (AuthUtils.getTokens('accessToken')) { // Если есть токен, перенаправляем на главную страницу
            this.openNewRoute('/').then();
            return;
        }


        this.togglePassword.addEventListener('click', (e: PointerEvent): void => {
            ToggleUtils.toggleSwitch((this.passwordElement as HTMLInputElement), e);
        })

        this.validations = [
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
            {element: this.passwordElement}
        ];


        this.submitButton.addEventListener('click', this.login.bind(this));
    }


    private async login(): Promise<void> {
        this.commonErrorElement.style.display = 'none';

        if (ValidationUtils.validateForm(this.validations)) {
            try {
                // запрос отправляем
                const result = await HttpUtils.request<{
                    user: UserInfoType,
                    tokens: TokensType
                }>('/login', 'POST', false, {
                    email: this.emailElement.value,
                    password: this.passwordElement.value,
                    rememberMe: this.rememberMeElement ? this.rememberMeElement.checked : false
                });

                if (result.error || !result.response || (result.response && (!result.response.tokens || !result.response.user))) {
                    this.commonErrorElement.style.display = 'block';
                    return;
                }

                // сохраняем токены
                AuthUtils.setTokens({
                    accessToken: result.response.tokens.accessToken,
                    refreshToken: result.response.tokens.refreshToken
                });
                AuthUtils.setUser({
                    id: result.response.user.id,
                    name: result.response.user.name,
                    lastName: result.response.user.lastName
                })

                await this.openNewRoute('/'); // перенаправляем на главную страницу
            } catch (e) {
                this.commonErrorElement.style.display = 'block';
            }
        }
    }
}