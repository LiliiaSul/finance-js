import {HttpUtils} from "../../utils/http-utils";
import {ValidationUtils} from "../../utils/validation-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {ValidatableElementType} from "../../types/validatable.element.type";
import {GetCategoryType} from "../../types/get-category.type";

export class EditIncomes {
    readonly openNewRoute: OpenNewRouteType;
    readonly editTitleElement: HTMLInputElement;
    readonly updateButton: HTMLInputElement;
    readonly cancelButton: HTMLInputElement;
    private incomeOriginalData: GetCategoryType | undefined;
    readonly validations: ValidatableElementType[] = [];

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        const editTitleElement = document.getElementById('edit-title') as HTMLInputElement | null;
        if (editTitleElement === null) {
            throw new Error('Поле для ввода названия категории доходов не найдено');
        }
        this.editTitleElement = editTitleElement;

        const updateButton = document.getElementById('update') as HTMLInputElement | null;
        if (updateButton === null) {
            throw new Error('Кнопка обновления категории доходов не найдена');
        }
        this.updateButton = updateButton;

        const cancelButton = document.getElementById('cancel') as HTMLInputElement | null;
        if (cancelButton === null) {
            throw new Error('Кнопка отмены редактирования категории доходов не найдена');
        }
        this.cancelButton = cancelButton;

        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const id: string | null = urlParams.get('id');
        if (!id) {
            this.openNewRoute('/').then();
            return;
        }

        this.updateButton.addEventListener('click', this.updateIncomes.bind(this));
        this.cancelButton.addEventListener('click', () => {
            this.openNewRoute('/incomes').then();
        });


        this.validations = [
            {element: this.editTitleElement}
        ];

        this.getIncome(parseInt(id)).then();
    }

    async getIncome(id: number): Promise<void> { //получаем данные о категории доходов по id
        const result = await HttpUtils.request<GetCategoryType>('/categories/income/' + id);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.error)) {
            return alert('Во время получения категории доходов произошла ошибка');
        }

        this.incomeOriginalData = result.response; //сохраняем оригинальные данные категории доходов
        this.showIncome(result.response);
    }

    private showIncome(income: GetCategoryType): void {
        this.editTitleElement.value = income.title;
    }

    private async updateIncomes(e: Event): Promise<void> {
        e.preventDefault();
        if (ValidationUtils.validateForm(this.validations)) {
            if (!this.incomeOriginalData) {
                return;
            }
            const changedData: Partial<GetCategoryType> = {}; //объект для хранения измененных данных
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