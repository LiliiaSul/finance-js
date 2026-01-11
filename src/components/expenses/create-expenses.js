export class CreateExpenses {
    constructor() {
        this.createBtn = document.getElementById('create');
        this.cancelBtn = document.getElementById('cancel');
        this.inputCreateElement = document.getElementById('create-expenses');

        this.createBtn.addEventListener('click', this.createExpenses.bind(this));
        this.cancelBtn.addEventListener('click', this.cancelExpenses.bind(this));
    }

    validateForm() {
        let isValid = true;

        if (this.inputCreateElement.value) {
            this.inputCreateElement.classList.remove('is-invalid');
            this.inputCreateElement.value = '';
        } else {
            this.inputCreateElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }


    createExpenses() {
        this.validateForm();
    }

    cancelExpenses() {
        this.inputCreateElement.classList.remove('is-invalid');
        this.inputCreateElement.value = '';
    }

}