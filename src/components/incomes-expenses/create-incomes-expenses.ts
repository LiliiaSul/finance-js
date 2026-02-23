import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {ValidatableElementType} from "../../types/validatable.element.type";
import {GetCategoryType} from "../../types/get-category.type";

export class CreateIncomesExpenses {
    readonly openNewRoute: OpenNewRouteType;
    readonly typeElement: HTMLSelectElement;
    readonly categoryElement: HTMLSelectElement;
    readonly amountElement: HTMLInputElement;
    readonly dateElement: HTMLInputElement;
    readonly commentElement: HTMLInputElement;
    readonly createButton: HTMLElement;
    readonly cancelButton: HTMLElement;
    validations: ValidatableElementType[];

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
       const typeElement = document.getElementById('type') as HTMLSelectElement | null;
       if (typeElement === null) {
           throw new Error('Type Element не найден');
       }
        this.typeElement = typeElement;

        const categoryElement = document.getElementById('category') as HTMLSelectElement | null;
        if (categoryElement === null) {
            throw new Error('Category Element не найден');
        }
        this.categoryElement = categoryElement;

        const amountElement = document.getElementById('amount') as HTMLInputElement | null;
        if (amountElement === null) {
            throw new Error('Amount Element не найден');
        }
        this.amountElement = amountElement;

        const dateElement = document.getElementById('date') as HTMLInputElement | null;
        if (dateElement === null) {
            throw new Error('Date Element не найден');
        }
        this.dateElement = dateElement;

        const commentElement = document.getElementById('comment') as HTMLInputElement | null;
        if (commentElement === null) {
            throw new Error('Comment Element не найден');
        }
        this.commentElement = commentElement;

        const createButton: HTMLElement | null = document.getElementById('create');
        if (createButton === null) {
            throw new Error('Create Button не найден');
        }
        this.createButton = createButton;

        const cancelButton: HTMLElement | null = document.getElementById('cancel');
        if (cancelButton === null) {
            throw new Error('Cancel Button не найден');
        }
        this.cancelButton = cancelButton;

        this.createButton.addEventListener('click', this.createIncomesExpenses.bind(this));
        this.cancelButton.addEventListener('click', () => {
            this.openNewRoute('/incomes-expenses').then();
        });

        this.validations = [
            {element: this.typeElement},
            {element: this.categoryElement},
            {element: this.amountElement},
            {element: this.dateElement},
            {element: this.commentElement}
        ];

        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const type: string | null = urlParams.get('type'); //получаем тип из параметров URL
        if (type) {
            this.typeElement.value = type;
        }

        this.chooseCategory(this.typeElement.value).then(); //загружаем категории в зависимости от типа
        this.typeElement.addEventListener('change', () => { //при изменении типа загружаем соответствующие категории
            this.chooseCategory(this.typeElement.value).then();
        });
    }


   private async chooseCategory(type: string) {
        this.categoryElement.innerHTML = ''; //очищаем текущие категории
        const optionElement: HTMLOptionElement = document.createElement('option');
        optionElement.selected = true;
        optionElement.value = '';
        optionElement.innerText = 'Категория...';
        this.categoryElement.appendChild(optionElement);

        if (!type) {
            return;
        }

        const url: string = type === 'income' ? '/categories/income' : '/categories/expense';
        const result = await HttpUtils.request<GetCategoryType[]>(url); //запрашиваем категории в зависимости от типа
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.error)) {
            return alert('Во время получения категорий произошла ошибка');
        }

        result.response.forEach(category => { //добавляем категории в выпадающий список
            const optionValueElement: HTMLOptionElement = document.createElement('option');
            optionValueElement.value = String(category.id);
            optionValueElement.innerText = category.title;
            this.categoryElement.appendChild(optionValueElement);
        });
    }

    async createIncomesExpenses(e: Event) {
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