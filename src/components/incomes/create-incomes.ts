import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";

export class CreateIncomes {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        document.getElementById('create').addEventListener('click', this.createIncomes.bind(this));
        document.getElementById('cancel').addEventListener('click', () => {
            this.openNewRoute('/incomes');
        })

        this.incomesTitleElement = document.getElementById('incomes-title');

        this.validations = [
            {element: this.incomesTitleElement}
        ];
    }

    async createIncomes(e) {
        e.preventDefault(); //останавливаем отправку формы
        if (ValidationUtils.validateForm(this.validations)) {
            const result = await HttpUtils.request('/categories/income', 'POST', true, {
                title: this.incomesTitleElement.value
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.error)) {
                return alert('Во время создания категории доходов произошла ошибка');
            }

            return this.openNewRoute('/incomes');
        }
    }
}