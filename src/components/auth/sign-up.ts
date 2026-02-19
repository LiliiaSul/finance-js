import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {ToggleUtils} from "../../utils/toggle-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {ValidatableElementType, ValidationOptionsType} from "../../types/validatable.element.type";
import {UserInfoType} from "../../types/user-info.type";

export class SignUp {
    readonly openNewRoute: OpenNewRouteType;
    readonly nameElement: HTMLInputElement | null;
    readonly lastNameElement: HTMLInputElement | null;
    readonly emailElement: HTMLInputElement | null;
    readonly passwordElement: HTMLInputElement | null;
    readonly passwordRepeatElement: HTMLInputElement | null;
    readonly rememberMeElement: HTMLInputElement | null;
    readonly commonErrorElement: HTMLElement | null;
    readonly togglePassword: HTMLElement | null;
    readonly toggleRepeatPassword: HTMLElement | null;
    readonly validations: ValidatableElementType[] = [];
    readonly submitButton: HTMLElement | null;

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        this.nameElement = document.getElementById('name') as HTMLInputElement;
        this.lastNameElement = document.getElementById('last-name') as HTMLInputElement;
        this.emailElement = document.getElementById('email') as HTMLInputElement;
        this.passwordElement = document.getElementById('password') as HTMLInputElement;
        this.passwordRepeatElement = document.getElementById('password-repeat') as HTMLInputElement;
        this.rememberMeElement = document.getElementById('remember-me') as HTMLInputElement;
        this.commonErrorElement = document.getElementById('common-error');
        this.togglePassword = document.getElementById('togglePassword');
        this.toggleRepeatPassword = document.getElementById('toggleRepeatPassword');
        this.submitButton = document.getElementById('submit');


        if (AuthUtils.getTokens('accessToken')) { // Если есть токен, перенаправляем на главную страницу
            this.openNewRoute('/').then();
            return;
        }

        if (this.submitButton) {
            this.submitButton.addEventListener('click', this.signUp.bind(this));
        }

        this.validations = [
            {element: this.nameElement, options: {pattern: /^[А-Я][а-я]+\s*$/}},
            {element: this.lastNameElement, options: {pattern: /^[А-Я][а-я]+\s*$/}},
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
            {element: this.passwordElement, options: {pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/}},
            {element: this.passwordRepeatElement, options: {compareTo: this.passwordElement.value}}
        ];

        if (this.togglePassword) {
            this.togglePassword.addEventListener('click', (e) => {
                ToggleUtils.toggleSwitch((this.passwordElement as HTMLInputElement), e);
            })
        }

        if (this.toggleRepeatPassword) {
            this.toggleRepeatPassword.addEventListener('click', (e) => {
                ToggleUtils.toggleSwitch((this.passwordElement as HTMLInputElement), e);
            })
        }
    }


    private async signUp(): Promise<void> {
        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }

        for (let i = 0; i < this.validations.length; i++) { // обновляем значение для сравнения паролей
            if (this.validations[i].element === this.passwordRepeatElement) {
                (this.validations[i].options as ValidationOptionsType).compareTo = (this.passwordElement as HTMLInputElement).value;
            }
        }
        if (ValidationUtils.validateForm(this.validations)) {
            try {
                const result = await HttpUtils.request<{ user: UserInfoType }>('/signup', 'POST', false, {
                    name: (this.nameElement as HTMLInputElement).value,
                    lastName: (this.lastNameElement as HTMLInputElement).value,
                    email: (this.emailElement as HTMLInputElement).value,
                    password: (this.passwordElement as HTMLInputElement).value,
                    passwordRepeat: (this.passwordRepeatElement as HTMLInputElement).value
                });

                if (result.error || !result.response || (result.response && !result.response.user)) {
                    if (this.commonErrorElement) {
                        this.commonErrorElement.style.display = 'block';
                    }
                    return;
                }

                // сохраняем пользователя
                AuthUtils.setUser({
                    id: result.response.user.id,
                    email: result.response.user.email,
                    name: result.response.user.name,
                    lastName: result.response.user.lastName
                });

                await this.openNewRoute('/');
            } catch (e) {
                if (this.commonErrorElement) {
                    this.commonErrorElement.style.display = 'block';
                }
            }
        }
    }
}