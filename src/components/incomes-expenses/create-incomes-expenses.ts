import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";

export class CreateIncomesExpenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.typeElement = document.getElementById('type');
        this.categoryElement = document.getElementById('category');
        this.amountElement = document.getElementById('amount');
        this.dateElement = document.getElementById('date');
        this.commentElement = document.getElementById('comment');

        this.validations = [
            {element: this.typeElement},
            {element: this.categoryElement},
            {element: this.amountElement},
            {element: this.dateElement},
            {element: this.commentElement}
        ];

        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type'); //получаем тип из параметров URL
        if (type) {
            this.typeElement.value = type;
        }

        this.chooseCategory(this.typeElement.value).then(); //загружаем категории в зависимости от типа
        this.typeElement.addEventListener('change', () => { //при изменении типа загружаем соответствующие категории
            this.chooseCategory(this.typeElement.value).then();
        });

        document.getElementById('create').addEventListener('click', this.createIncomesExpenses.bind(this));
        document.getElementById('cancel').addEventListener('click', () => {
            this.openNewRoute('/incomes-expenses');
        });
    }


    async chooseCategory(type) {
        this.categoryElement.innerHTML = ''; //очищаем текущие категории
        const optionElement = document.createElement('option');
        optionElement.selected = true;
        optionElement.value = '';
        optionElement.innerText = 'Категория...';
        this.categoryElement.appendChild(optionElement);

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

    async createIncomesExpenses(e) {
        e.preventDefault(); //останавливаем отправку формы
        if (ValidationUtils.validateForm(this.validations)) {
            const result = await HttpUtils.request('/operations', 'POST', true, {
                type: this.typeElement.value,
                amount: this.amountElement.value,
                date: this.dateElement.value,
                comment: this.commentElement.value,
                category_id: parseInt(this.categoryElement.value) //преобразуем к числу
            });
            if (result.redirect) {
                return this.openNewRoute(result.redirect);
            }

            if (result.error || !result.response || (result.response && result.error)) {
                return alert('Во время создания записи о доходе/расходе произошла ошибка');
            }

            return this.openNewRoute('/incomes-expenses');
        }
    }
}