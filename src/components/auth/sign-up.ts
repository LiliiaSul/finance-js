import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {ToggleUtils} from "../../utils/toggle-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {ValidatableElementType} from "../../types/validatable.element.type";

export class SignUp {
    readonly openNewRoute: OpenNewRouteType;
    readonly nameElement: HTMLElement | null;
    readonly lastNameElement: HTMLElement | null;
    readonly emailElement: HTMLElement | null;
    readonly passwordElement: HTMLElement | null;
    readonly passwordRepeatElement: HTMLElement | null;
    readonly rememberMeElement: HTMLElement | null;
    readonly commonErrorElement: HTMLElement | null;
    readonly togglePassword: HTMLElement | null;
    readonly toggleRepeatPassword: HTMLElement | null;
    readonly validations: ValidatableElementType[] = [];
    readonly submitButton: HTMLElement | null;

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        this.nameElement = document.getElementById('name');
        this.lastNameElement = document.getElementById('last-name');
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.passwordRepeatElement = document.getElementById('password-repeat');
        this.rememberMeElement = document.getElementById('remember-me');
        this.commonErrorElement = document.getElementById('common-error');
        this.togglePassword = document.getElementById('togglePassword');
        this.toggleRepeatPassword = document.getElementById('toggleRepeatPassword');
        this.submitButton = document.getElementById('submit');


        if (AuthUtils.getTokens('accessToken')) { // Если есть токен, перенаправляем на главную страницу
            this.openNewRoute('/');
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
            ToggleUtils.toggleSwitch(this.passwordElement, e);
        })}

        if(this.toggleRepeatPassword) {
        this.toggleRepeatPassword.addEventListener('click', (e) => {
            ToggleUtils.toggleSwitch(this.passwordRepeatElement, e);
        })}
    }


   private async signUp(): Promise<void> {
        if (this.commonErrorElement) {
            this.commonErrorElement.style.display = 'none';
        }

        for (let i = 0; i < this.validations.length; i++) { // обновляем значение для сравнения паролей
            if (this.validations[i].element === this.passwordRepeatElement) {
                this.validations[i].options.compareTo = this.passwordElement.value;
            }
        }
        if (ValidationUtils.validateForm(this.validations)) {
            try {
                const result = await HttpUtils.request('/signup', 'POST', false, {
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

                this.openNewRoute('/');
            } catch (e) {
                if (this.commonErrorElement) {
                    this.commonErrorElement.style.display = 'block';
                }
            }
        }
    }
}