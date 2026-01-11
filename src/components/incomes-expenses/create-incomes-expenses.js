export class CreateIncomesExpenses {
    constructor() {
        this.typeElement = document.getElementById('type');
        this.categoryElement = document.getElementById('category');
        this.amountElement = document.getElementById('amount');
        this.dateElement = document.getElementById('date');
        this.commentElement = document.getElementById('commet');


        document.getElementById('create').addEventListener('click', this.createIncomesExpenses.bind(this));
    }

    validateForm() {
        let isValid = true; //валидна форма или нет

        if (this.typeElement.value) {
            this.typeElement.classList.remove('is-invalid');
        } else {
            this.typeElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.categoryElement.value) {
            this.categoryElement.classList.remove('is-invalid');
        } else {
            this.categoryElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.amountElement.value) {
            this.amountElement.classList.remove('is-invalid');
        } else {
            this.amountElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.dateElement.value) {
            this.dateElement.classList.remove('is-invalid');
        } else {
            this.dateElement.classList.add('is-invalid');
            isValid = false;
        }

        if (this.commentElement.value) {
            this.commentElement.classList.remove('is-invalid');
        } else {
            this.commentElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    createIncomesExpenses() {
        this.validateForm();
    }
}