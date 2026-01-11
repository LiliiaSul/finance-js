export class Login {
    constructor() {
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');

        document.getElementById('submit').addEventListener('click',  this.login.bind(this));
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

    login() {
        this.validateForm();
    }
}