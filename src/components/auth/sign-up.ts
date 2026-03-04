import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {ToggleUtils} from "../../utils/toggle-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {UserInfoType} from "../../types/user-info.type";
import {ValidatableElementType} from "../../types/validatable.element.type";

export class SignUp {
    readonly openNewRoute: OpenNewRouteType;
    readonly nameElement: HTMLInputElement;
    readonly lastNameElement: HTMLInputElement;
    readonly emailElement: HTMLInputElement;
    readonly passwordElement: HTMLInputElement;
    readonly passwordRepeatElement: HTMLInputElement;
    readonly commonErrorElement: HTMLElement;
    readonly togglePassword: HTMLElement;
    readonly toggleRepeatPassword: HTMLElement;
    readonly validations: ValidatableElementType[] = [];
    readonly submitButton: HTMLElement;

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        const nameElement = document.getElementById('name') as HTMLInputElement | null;
        if (nameElement === null) {
            throw new Error('Name элемент не найден');
        }
        this.nameElement = nameElement;

        const lastNameElement = document.getElementById('last-name') as HTMLInputElement | null;
        if (lastNameElement === null) {
            throw new Error('Last Name элемент не найден');
        }
        this.lastNameElement = lastNameElement;

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

        const passwordRepeatElement = document.getElementById('password-repeat') as HTMLInputElement | null;
        if (passwordRepeatElement === null) {
            throw new Error('Password Repeat элемент не найден');
        }
        this.passwordRepeatElement = passwordRepeatElement;

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

        const toggleRepeatPassword: HTMLElement | null = document.getElementById('toggleRepeatPassword');
        if (toggleRepeatPassword === null) {
            throw new Error('Toggle Repeat Password элемент не найден');
        }
        this.toggleRepeatPassword = toggleRepeatPassword;

        const submitButton: HTMLElement | null = document.getElementById('submit');
        if (submitButton === null) {
            throw new Error('Submit Button элемент не найден');
        }
        this.submitButton = submitButton;

        if (AuthUtils.getTokens('accessToken')) { // Если есть токен, перенаправляем на главную страницу
            this.openNewRoute('/').then();
            return;
        }

        this.submitButton.addEventListener('click', this.signUp.bind(this));

        this.validations = [
            {element: this.nameElement, options: {pattern: /^[А-Я][а-я]+\s*$/}},
            {element: this.lastNameElement, options: {pattern: /^[А-Я][а-я]+\s*$/}},
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
            {element: this.passwordElement, options: {pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/}},
            {element: this.passwordRepeatElement, options: {compareTo: this.passwordElement.value}}
        ];

        this.togglePassword.addEventListener('click', (e) => {
            ToggleUtils.toggleSwitch(this.passwordElement, e);
        })

        this.toggleRepeatPassword.addEventListener('click', (e) => {
            ToggleUtils.toggleSwitch(this.passwordElement, e);
        })
    }

    private async signUp(): Promise<void> {
        this.commonErrorElement.style.display = 'none';

        for (const validation of this.validations) { // обновляем значение для сравнения паролей
            if (validation.element === this.passwordRepeatElement && validation.options) {
                validation.options.compareTo = this.passwordElement.value;
            }

            if (ValidationUtils.validateForm(this.validations)) {
                try {
                    const result = await HttpUtils.request<{ user: UserInfoType }>('/signup', 'POST', false, {
                        name: this.nameElement.value,
                        lastName: this.lastNameElement.value,
                        email: this.emailElement.value,
                        password: this.passwordElement.value,
                        passwordRepeat: this.passwordRepeatElement.value
                    });

                    if (result.error || !result.response || (result.response && !result.response.user)) {
                        this.commonErrorElement.style.display = 'block';
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
                    this.commonErrorElement.style.display = 'block';
                }
            }
        }
    }
}