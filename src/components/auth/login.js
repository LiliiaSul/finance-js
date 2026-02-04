import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {ToggleUtils} from "../../utils/toggle-utils";

export class Login {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (AuthUtils.getTokens('accessToken')) { // Если есть токен, перенаправляем на главную страницу
            return this.openNewRoute('/');
        }

        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.rememberMeElement = document.getElementById('remember-me');
        this.commonErrorElement = document.getElementById('common-error');
        this.togglePassword = document.getElementById('togglePassword');

        this.togglePassword.addEventListener('click', (e) => {
            ToggleUtils.toggleSwitch(this.passwordElement, e);
        })

        this.validations = [
            {element: this.emailElement, options: {pattern: /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/}},
            {element: this.passwordElement}
        ];

        document.getElementById('submit').addEventListener('click', this.login.bind(this));
    }


    async login() {
        this.commonErrorElement.style.display = 'none';
        if (ValidationUtils.validateForm(this.validations)) {
            try {
                // запрос отправляем
                const result = await HttpUtils.request('/login', 'POST', false, {
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

                this.openNewRoute('/'); // перенаправляем на главную страницу
            } catch (e) {
                this.commonErrorElement.style.display = 'block';
            }
        }
    }
}