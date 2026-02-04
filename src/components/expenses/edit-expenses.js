import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";

export class EditExpenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (!id) {
            return this.openNewRoute('/');
        }
        document.getElementById('update').addEventListener('click', this.updateExpenses.bind(this));
        document.getElementById('cancel').addEventListener('click', () => {
            this.openNewRoute('/expenses');
        });

        this.editTitleElement = document.getElementById('edit-title');

        this.validations = [
            {element: this.editTitleElement}
        ];

        this.getExpense(id).then();
    }

    async getExpense(id) { //получаем данные о категории расходов по id
        const result = await HttpUtils.request('/categories/expense/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.error)) {
            return alert('Во время получения категории расходов произошла ошибка');
        }

        this.expenseOriginalData = result.response; //сохраняем оригинальные данные категории расходов
        this.showExpense(result.response);
    }

    showExpense(expense) {
        document.getElementById('edit-title').value = expense.title;
    }


    async updateExpenses(e) {
        e.preventDefault();
        if (ValidationUtils.validateForm(this.validations)) {
            const changedData = {}; //объект для хранения измененных данных
            if (this.editTitleElement.value !== this.expenseOriginalData.title) { //проверяем, изменилось ли значение
                changedData.title = this.editTitleElement.value;
            }
            if (Object.keys(changedData).length > 0) { //если есть измененные данные, отправляем запрос на обновление
                const result = await HttpUtils.request('/categories/expense/' + this.expenseOriginalData.id, 'PUT', true, changedData);
                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }

                if (result.error || !result.response || (result.response && result.error)) {
                    return alert('Во время обновления категории расходов произошла ошибка');
                }
                return this.openNewRoute('/expenses');
            }
        }
    }
}