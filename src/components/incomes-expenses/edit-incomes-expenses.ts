import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {ValidatableElementType} from "../../types/validatable.element.type";
import {OperationsDataType} from "../../types/operations-data.type";
import {GetCategoryType} from "../../types/get-category.type";

export class EditIncomesExpenses {
    readonly openNewRoute: OpenNewRouteType;
    readonly typeElement: HTMLSelectElement;
    readonly categoryElement: HTMLSelectElement;
    readonly amountElement: HTMLInputElement;
    readonly dateElement: HTMLInputElement;
    readonly commentElement: HTMLInputElement;
    readonly updateButton: HTMLElement;
    readonly cancelButton: HTMLElement;
    private operationOriginalData: OperationsDataType | undefined; //оригинальные данные операции, которые были получены с сервера
    readonly validations: ValidatableElementType[] = [];

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

        const updateButton: HTMLElement | null = document.getElementById('update');
        if (updateButton === null) {
            throw new Error('Update Button не найден');
        }
        this.updateButton = updateButton;
        this.updateButton.addEventListener('click', this.updateOperation.bind(this));

        const cancelButton: HTMLElement | null = document.getElementById('cancel');
        if (cancelButton === null) {
            throw new Error('Cancel Button не найден');
        }
        this.cancelButton = cancelButton;
        this.cancelButton.addEventListener('click', () => {
            this.openNewRoute('/incomes-expenses').then();
        });

        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const id: string | null = urlParams.get('id');
        if (!id) {
            this.openNewRoute('/').then();
            return;
        }

        this.validations = [
            {element: this.typeElement},
            {element: this.categoryElement},
            {element: this.amountElement},
            {element: this.dateElement},
            {element: this.commentElement}
        ];

        this.getOperation(parseInt(id)).then();
    }

    async getOperation(id: number) { //Получение операции по id
        const result = await HttpUtils.request<OperationsDataType>('/operations/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.error)) {
            return alert('Возникла ошибка при получении операции. Обратитесь в поддержку.');
        }

        this.operationOriginalData = result.response; //сохраняем оригинальные данные операции
        await this.showOperation(result.response);
    }

    async showOperation(operation: OperationsDataType) { //Отображение операции в форме
        this.typeElement.value = operation.type;

        await this.chooseCategory(operation.type);

        this.categoryElement.value = operation.category;
        this.amountElement.value = String(operation.amount);
        this.dateElement.value = operation.date.split('T')[0];
        this.commentElement.value = operation.comment || '';

        for (let i = 0; i < this.categoryElement.options.length; i++) { //ищем категорию, которая совпадает с названием категории операции
            if (this.operationOriginalData === undefined) {
                break;
            }

            if (this.categoryElement.options[i].innerText === operation.category) {
                this.categoryElement.selectedIndex = i;
                this.operationOriginalData.category_id = parseInt(this.categoryElement.options[i].value);
                break;
            }
        }
    }

    async chooseCategory(type: string) { //Выбор категории в зависимости от типа операции
        if (!type) {
            return;
        }

        const url: string = type === 'income' ? '/categories/income' : '/categories/expense';
        const result = await HttpUtils.request<GetCategoryType[]>(url);
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

    async updateOperation(e: Event) {
        e.preventDefault(); //останавливаем отправку формы
        if (ValidationUtils.validateForm(this.validations)) {
            const changedData: Partial<OperationsDataType> = {}; //данные, которые были изменены
            if (this.operationOriginalData === undefined) {
                throw new Error('Оригинальные данные операции не были загружены');
            }

            if (this.typeElement.value !== this.operationOriginalData.type) {
                const type: string = this.typeElement.value; //проверяем, что тип операции является допустимым
                if (type === 'income' || type === 'expense') {
                    changedData.type = type;
                } else {
                   throw new Error('Недопустимое значение типа операции');
                }
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