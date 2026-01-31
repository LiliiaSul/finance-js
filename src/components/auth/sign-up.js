import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {ToggleUtils} from "../../utils/toggle-utils";

export class SignUp {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getTokens('accessToken')) { // Если есть токен, перенаправляем на главную страницу
            return this.openNewRoute('/');
        }

        this.nameElement = document.getElementById('name');
        this.lastNameElement = document.getElementById('last-name');
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.passwordRepeatElement = document.getElementById('password-repeat');
        this.rememberMeElement = document.getElementById('remember-me');
        this.commonErrorElement = document.getElementById('common-error');
        this.togglePassword = document.getElementById('togglePassword');
        this.toggleRepeatPassword = document.getElementById('toggleRepeatPassword');

        document.getElementById('submit').addEventListener('click', this.signUp.bind(this));

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
            ToggleUtils.toggleSwitch(this.passwordRepeatElement, e);
        })
    }


    async signUp() {
        this.commonErrorElement.style.display = 'none';
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
                this.commonErrorElement.style.display = 'block';
            }
        }
    }
}