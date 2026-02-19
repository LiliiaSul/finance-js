import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {ValidatableElementType} from "../../types/validatable.element.type";
import {GetCategoryType} from "../../types/get-category.type";

export class EditExpenses {
    readonly openNewRoute: OpenNewRouteType;
    readonly editTitleElement: HTMLInputElement | null;
    readonly updateButton: HTMLElement | null;
    readonly cancelButton: HTMLElement | null;
    private expenseOriginalData: GetCategoryType | undefined; //объект для хранения оригинальных данных категории расходов
    readonly validations: ValidatableElementType[] = [];

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        this.editTitleElement = document.getElementById('edit-title') as HTMLInputElement;
        this.updateButton = document.getElementById('update');
        this.cancelButton = document.getElementById('cancel');

        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const id: string | null = urlParams.get('id');
        if (!id) {
            this.openNewRoute('/').then();
            return;
        }

        if (this.updateButton) {
            this.updateButton.addEventListener('click', this.updateExpenses.bind(this));
        }
        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', () => {
                this.openNewRoute('/expenses').then();
            });
        }

        this.validations = [
            {element: this.editTitleElement}
        ];

        this.getExpense(parseInt(id)).then();
    }

    private async getExpense(id: number): Promise<void> { //получаем данные о категории расходов по id
        const result = await HttpUtils.request('/categories/expense/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.error)) {
            return alert('Во время получения категории расходов произошла ошибка');
        }


        this.expenseOriginalData = result.response as unknown as GetCategoryType; //сохраняем оригинальные данные категории расходов
        this.showExpense(this.expenseOriginalData);
    }

    private showExpense(expense: GetCategoryType): void {
        if (this.editTitleElement) {
            this.editTitleElement.value = expense.title;
        }
    }


    private async updateExpenses(e: Event): Promise<void> {
        e.preventDefault();
        if (ValidationUtils.validateForm(this.validations)) {
            if (!this.expenseOriginalData) {
                return;
            }
            const changedData: Partial<GetCategoryType> = {}; //объект для хранения измененных данных
            if (this.editTitleElement) {
                if (this.editTitleElement.value !== this.expenseOriginalData.title) { //проверяем, изменилось ли значение
                    changedData.title = this.editTitleElement.value;
                }
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