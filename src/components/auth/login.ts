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
    readonly emailElement: HTMLInputElement | null;
    readonly passwordElement: HTMLInputElement | null;
    readonly rememberMeElement: HTMLInputElement | null;
    readonly commonErrorElement: HTMLElement | null;
    readonly togglePassword: HTMLElement | null;
    readonly validations: ValidatableElementType[] = [];
    readonly submitButton: HTMLElement | null;


    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        this.emailElement = document.getElementById('email') as HTMLInputElement;
        this.passwordElement = document.getElementById('password') as HTMLInputElement;
        this.rememberMeElement = document.getElementById('remember-me') as HTMLInputElement;
        this.commonErrorElement = document.getElementById('common-error');
        this.togglePassword = document.getElementById('togglePassword');
        this.submitButton = document.getElementById('submit');

        if (AuthUtils.getTokens('accessToken')) { // Если есть токен, перенаправляем на главную страницу
            this.openNewRoute('/');
            return;
        }


        if (this.togglePassword) {
            this.togglePassword.addEventListener('click', (e: PointerEvent): void => {
                ToggleUtils.toggleSwitch((this.passwordElement as HTMLInputElement), e);
            })
        }

        this.validations = [
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
            {element: this.passwordElement}
        ];

        if (this.submitButton) {
            this.submitButton.addEventListener('click', this.login.bind(this));
        }
    }


    private async login(): Promise<void> {
        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }
        if (ValidationUtils.validateForm(this.validations)) {
            try {
                // запрос отправляем
                const result = await HttpUtils.request<{
                    user: UserInfoType,
                    tokens: TokensType
                }>('/login', 'POST', false, {
                    email: (this.emailElement as HTMLInputElement).value,
                    password: (this.passwordElement as HTMLInputElement).value,
                    rememberMe: this.rememberMeElement ? this.rememberMeElement.checked : false
                });

                if (result.error || !result.response || (result.response && (!result.response.tokens || !result.response.user))) {
                    if (this.commonErrorElement) {
                        this.commonErrorElement.style.display = 'block';
                    }
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

                this.openNewRoute('/'); // перенаправляем на главную страницу
            } catch (e) {
                if (this.commonErrorElement) {
                    this.commonErrorElement.style.display = 'block';
                }
            }
        }
    }
}