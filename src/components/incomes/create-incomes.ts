import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {ValidatableElementType} from "../../types/validatable.element.type";

export class CreateIncomes {
    readonly openNewRoute: OpenNewRouteType;
    readonly incomesTitleElement: HTMLInputElement;
    readonly createButton: HTMLInputElement;
    readonly cancelButton: HTMLInputElement;
    readonly validations: ValidatableElementType[];

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        const incomesTitleElement = document.getElementById('incomes-title') as HTMLInputElement | null;
        if (incomesTitleElement === null) {
            throw new Error('Поле для ввода названия категории доходов не найдено');
        }
        this.incomesTitleElement = incomesTitleElement;

        const createButton = document.getElementById('create') as HTMLInputElement | null;
        if (createButton === null) {
            throw new Error('Кнопка создания категории доходов не найдена');
        }
        this.createButton = createButton;

        const cancelButton = document.getElementById('cancel') as HTMLInputElement | null;
        if (cancelButton === null) {
            throw new Error('Кнопка отмены создания категории доходов не найдена');
        }
        this.cancelButton = cancelButton;

        this.createButton.addEventListener('click', this.createIncomes.bind(this));
        this.cancelButton.addEventListener('click', () => {
            this.openNewRoute('/incomes').then();
        })


        this.validations = [
            {element: this.incomesTitleElement}
        ];
    }

   private async createIncomes(e: Event): Promise<void> {
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