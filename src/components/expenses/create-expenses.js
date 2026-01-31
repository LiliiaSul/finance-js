import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";

export class CreateExpenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        document.getElementById('create').addEventListener('click', this.createExpenses.bind(this));
        document.getElementById('cancel').addEventListener('click', () => {
            this.openNewRoute('/expenses');
        })

        this.expensesTitleElement = document.getElementById('expenses-title');

        this.validations = [
            {element: this.expensesTitleElement}
        ];
    }


    async createExpenses(e) {
        e.preventDefault(); //останавливаем отправку формы
        if (ValidationUtils.validateForm(this.validations)) {
            const result = await HttpUtils.request('/categories/expense', 'POST', true, {
                title: this.expensesTitleElement.value
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.error)) {
                return alert('Во время создания категории расходов произошла ошибка');
            }

            return this.openNewRoute('/expenses');
        }
    }
}