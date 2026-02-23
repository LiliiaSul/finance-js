import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {ValidatableElementType} from "../../types/validatable.element.type";
import {GetCategoryType} from "../../types/get-category.type";

export class CreateExpenses {
    readonly openNewRoute: OpenNewRouteType;
    readonly expensesTitleElement: HTMLInputElement;
    readonly createButton: HTMLElement;
    readonly cancelButton: HTMLElement;
    readonly validations: ValidatableElementType[] = [];

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        const createButton: HTMLElement | null = document.getElementById('create');
        if (createButton === null) {
            throw new Error('Кнопка создания категории расходов не найдена');
        }
        this.createButton = createButton;

        const cancelButton: HTMLElement | null = document.getElementById('cancel');
        if (cancelButton === null) {
            throw new Error('Кнопка отмены создания категории расходов не найдена');
        }
        this.cancelButton = cancelButton;

        const expensesTitleElement = document.getElementById('expenses-title') as HTMLInputElement | null;
        if (expensesTitleElement === null) {
            throw new Error('Поле для ввода названия категории расходов не найдена');
        }
        this.expensesTitleElement = expensesTitleElement;


        this.createButton.addEventListener('click', this.createExpenses.bind(this));
        this.cancelButton.addEventListener('click', () => {
            this.openNewRoute('/expenses').then();
        });

        this.validations = [
            {element: this.expensesTitleElement}
        ];
    }

    private async createExpenses(e: Event): Promise<void> {
        e.preventDefault(); //останавливаем отправку формы
        if (ValidationUtils.validateForm(this.validations)) {
            const result = await HttpUtils.request<void>('/categories/expense', 'POST', true, {
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