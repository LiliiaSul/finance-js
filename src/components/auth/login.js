import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";

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

        document.getElementById('submit').addEventListener('click', this.login.bind(this));
    }

    validateForm() {
        let isValid = true; //валидна форма или нет

        if (this.emailElement.value && this.emailElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
            this.emailElement.classList.remove('is-invalid');
        } else {
            this.emailElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.passwordElement.value) {
            this.passwordElement.classList.remove('is-invalid');
        } else {
            this.passwordElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    async login() {
        this.commonErrorElement.style.display = 'none';
        if (this.validateForm()) {
            try {
                // запрос отправляем
                const result = await HttpUtils.request('/login' , 'POST', {
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