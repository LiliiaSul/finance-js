import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {ValidatableElementType} from "../../types/validatable.element.type";

export class CreateExpenses {
    readonly openNewRoute: OpenNewRouteType;
    readonly expensesTitleElement: HTMLInputElement | null;
    readonly createButton: HTMLElement | null;
    readonly cancelButton: HTMLElement | null;
    readonly validations: ValidatableElementType[] = [];

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        this.createButton = document.getElementById('create');
        this.cancelButton = document.getElementById('cancel');
        this.expensesTitleElement = document.getElementById('expenses-title') as HTMLInputElement;


        if (this.createButton) {
            this.createButton.addEventListener('click', this.createExpenses.bind(this));
        }
        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', () => {
                this.openNewRoute('/expenses').then();
            });
        }


        this.validations = [
            {element: this.expensesTitleElement}
        ];
    }

    private async createExpenses(e: Event): Promise<void> {
        e.preventDefault(); //останавливаем отправку формы
        if (ValidationUtils.validateForm(this.validations)) {
            const result = await HttpUtils.request('/categories/expense', 'POST', true, {
                title: (this.expensesTitleElement as HTMLInputElement).value
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