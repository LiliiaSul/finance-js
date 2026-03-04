import * as bootstrap from 'bootstrap';
import {HttpUtils} from "../../utils/http-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {GetCategoryType} from "../../types/get-category.type";

export class Incomes {
    readonly openNewRoute: OpenNewRouteType;

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;
        this.getIncomes().then();
    }

    private async getIncomes(): Promise<void> { // Получаем список категорий доходов
        const result = await HttpUtils.request<GetCategoryType[]>('/categories/income');
        if (result.redirect) { // если нужно перенаправление
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.error)) {
            return alert('Возникла ошибка при получении доходов. Обратитесь в поддержку.');
        }

        this.showIncomes(result.response);
    }

    private showIncomes(incomes: GetCategoryType[]): void {
        const incomesListElement: HTMLElement | null = document.getElementById('incomes-list');
        if (incomesListElement === null) {
            throw new Error('Элемент для отображения списка категорий доходов не найден');
        }
        for (let i = 0; i < incomes.length; i++) {
            const column: HTMLDivElement = document.createElement('div');
            column.className = ('col-12 col-sm-6 col-lg-4');
            const card: HTMLDivElement = document.createElement('div');
            card.className = ('card h-100');
            const cardBody: HTMLDivElement = document.createElement('div');
            cardBody.className = ('card-body');
            const cardTitle: HTMLHeadingElement = document.createElement('h5');
            cardTitle.className = ('card-title');
            cardTitle.innerText = incomes[i].title;
            const buttonGroup: HTMLDivElement = document.createElement('div');
            buttonGroup.className = ('d-grid gap-2 d-sm-flex');
            const editButton: HTMLAnchorElement = document.createElement('a');
            editButton.className = ('btn btn-primary');
            editButton.href = '/incomes/edit?id=' + incomes[i].id;
            editButton.innerText = 'Редактировать';
            const deleteButton: HTMLButtonElement = document.createElement('button');
            deleteButton.addEventListener('click', () => {
                this.deleteCategory(incomes[i].id);
            });
            deleteButton.className = ('btn btn-danger');
            deleteButton.setAttribute('data-id', String(incomes[i].id));
            deleteButton.innerText = 'Удалить';

            cardBody.appendChild(cardTitle);
            cardBody.appendChild(buttonGroup);
            buttonGroup.appendChild(editButton);
            buttonGroup.appendChild(deleteButton);
            card.appendChild(cardBody);
            column.appendChild(card);
            incomesListElement.appendChild(column);
        }


        const column: HTMLDivElement = document.createElement('div');
        column.className = ('col-12 col-sm-6 col-lg-4');
        const card: HTMLDivElement = document.createElement('div');
        card.className = ('card h-100');
        const cardBody: HTMLDivElement = document.createElement('div');
        cardBody.className = ('card-body d-flex justify-content-center align-items-center');
        const addButton: HTMLAnchorElement = document.createElement('a');
        addButton.href = '/incomes/create';
        const svgIcon: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgIcon.setAttribute('width', '16');
        svgIcon.setAttribute('height', '33');
        svgIcon.setAttribute('fill', '#CED4DA');
        svgIcon.setAttribute('class', 'bi bi-plus');
        svgIcon.setAttribute('viewBox', '0 0 16 16');
        svgIcon.innerHTML = '<path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>';
        addButton.appendChild(svgIcon);
        cardBody.appendChild(addButton);
        card.appendChild(cardBody);
        column.appendChild(card);
        incomesListElement.appendChild(column);
    }

    private deleteCategory(id: number): void {
        const modalElement: HTMLElement | null = document.getElementById('deleteModal');
        if (modalElement === null) {
            throw new Error('Модальное окно для подтверждения удаления не найдено');
        }
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
        const deleteButton: HTMLElement | null = document.getElementById('deleteButton');
        if (deleteButton === null) {
            throw new Error('Кнопка подтверждения удаления не найдена');
        }
        deleteButton.onclick = () => {
            modalInstance.hide();
            this.deleteIncome(id).then();
        };
    }

    private async deleteIncome(id: number): Promise<void> {
        const result = await HttpUtils.request('/categories/income/' + id, 'DELETE', true);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.error)) {
            return alert('Во время удаления категории доходов произошла ошибка');
        }

        return this.openNewRoute('/incomes');
    }
}