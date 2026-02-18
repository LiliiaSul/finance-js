import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";

export class EditIncomes {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (!id) {
            return this.openNewRoute('/');
        }

        document.getElementById('update').addEventListener('click', this.updateIncomes.bind(this));
        document.getElementById('cancel').addEventListener('click', () => {
            this.openNewRoute('/incomes');
        });

        this.editTitleElement = document.getElementById('edit-title');

        this.validations = [
            {element: this.editTitleElement}
        ];

        this.getIncome(id).then();
    }

    async getIncome(id) { //получаем данные о категории доходов по id
        const result = await HttpUtils.request('/categories/income/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.error)) {
            return alert('Во время получения категории доходов произошла ошибка');
        }

        this.incomeOriginalData = result.response; //сохраняем оригинальные данные категории доходов
        this.showIncome(result.response);
    }

    showIncome(income) {
        document.getElementById('edit-title').value = income.title;
    }


    async updateIncomes(e) {
        e.preventDefault();
        if (ValidationUtils.validateForm(this.validations)) {
            const changedData = {}; //объект для хранения измененных данных
            if (this.editTitleElement.value !== this.incomeOriginalData.title) { //проверяем, изменилось ли значение
                changedData.title = this.editTitleElement.value;
            }

            if (Object.keys(changedData).length > 0) { //если есть измененные данные, отправляем запрос на обновление
                const result = await HttpUtils.request('/categories/income/' + this.incomeOriginalData.id, 'PUT', true, changedData);
                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }

                if (result.error || !result.response || (result.response && result.error)) {
                    return alert('Во время редактирования категории доходов произошла ошибка');
                }

                return this.openNewRoute('/incomes');
            }
        }
    }
}