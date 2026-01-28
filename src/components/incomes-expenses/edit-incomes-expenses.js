import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";

export class EditIncomesExpenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.typeElement = document.getElementById('type');
        this.categoryElement = document.getElementById('category');
        this.amountElement = document.getElementById('amount');
        this.dateElement = document.getElementById('date');
        this.commentElement = document.getElementById('comment');

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (!id) {
            return this.openNewRoute('/');
        }

        document.getElementById('update').addEventListener('click', this.updateOperation.bind(this));
        document.getElementById('cancel').addEventListener('click', () => {
            this.openNewRoute('/incomes-expenses');
        });

        this.validations = [
            {element: this.typeElement},
            {element: this.categoryElement},
            {element: this.amountElement},
            {element: this.dateElement},
            {element: this.commentElement}
        ];

        this.getOperation(id).then();
    }

    async getOperation(id) { //Получение операции по id
        const result = await HttpUtils.request('/operations/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Возникла ошибка при получении операции. Обратитесь в поддержку.');
        }

        this.operationOriginalData = result.response; //сохраняем оригинальные данные операции
        await this.showOperation(result.response);
    }

    async showOperation(operation) { //Отображение операции в форме
        this.typeElement.value = operation.type;

        await this.chooseCategory(operation.type);

        this.categoryElement.value = operation.category;
        this.amountElement.value = operation.amount;
        this.dateElement.value = operation.date.split('T')[0];
        this.commentElement.value = operation.comment || '';

        for (let i = 0; i < this.categoryElement.options.length; i++) { //ищем категорию, которая совпадает с названием категории операции
            if (this.categoryElement.options[i].innerText === operation.category) {
                this.categoryElement.selectedIndex = i;
                this.operationOriginalData.category_id = parseInt(this.categoryElement.options[i].value);
                break;
            }
        }
    }

    async chooseCategory(type) { //Выбор категории в зависимости от типа операции
        if (!type) {
            return;
        }

        const url = type === 'income' ? '/categories/income' : '/categories/expense';
        const result = await HttpUtils.request(url);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            return alert('Во время получения категорий произошла ошибка');
        }

        result.response.forEach(category => { //добавляем категории в выпадающий список
            const optionValueElement = document.createElement('option');
            optionValueElement.value = category.id;
            optionValueElement.innerText = category.title;
            this.categoryElement.appendChild(optionValueElement);
        });
    }

    async updateOperation(e) {
        e.preventDefault(); //останавливаем отправку формы
        if (ValidationUtils.validateForm(this.validations)) {
            const changedData = {}; //данные, которые были изменены

            if (this.typeElement.value !== this.operationOriginalData.type) {
                changedData.type = this.typeElement.value;
            }

            if (this.categoryElement.innerText !== this.operationOriginalData.category) {
                changedData.category_id = parseInt(this.categoryElement.value);
            }

            if (this.amountElement.value !== String(this.operationOriginalData.amount)) {
                changedData.amount = parseInt(this.amountElement.value);
            }
            if (this.dateElement.value !== this.operationOriginalData.date.split('T')[0]) {
                changedData.date = this.dateElement.value;
            }
            if (this.commentElement.value !== (this.operationOriginalData.comment || '')) {
                changedData.comment = this.commentElement.value;
            }

            if (Object.keys(changedData).length > 0) { //если есть измененные данные
                const result = await HttpUtils.request('/operations/' + this.operationOriginalData.id, 'PUT', true, {
                    type: changedData.type || this.operationOriginalData.type,
                    category_id: changedData.category_id || this.operationOriginalData.category_id,
                    amount: changedData.amount || this.operationOriginalData.amount,
                    date: changedData.date || this.operationOriginalData.date.split('T')[0],
                    comment: changedData.comment || this.operationOriginalData.comment || ''
                });
                if (result.redirect) {
                    return this.openNewRoute(result.redirect);
                }

                if (result.error || !result.response || (result.response && result.error)) {
                    return alert('Во время редактировании записи о доходе/расходе произошла ошибка');
                }

                return this.openNewRoute('/incomes-expenses');
            }
        }
    }
}