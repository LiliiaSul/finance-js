import {HttpUtils} from "../../utils/http-utils";
import * as bootstrap from "bootstrap";
import {OpenNewRouteType} from "../../types/openNewRoute.type";
import {GetOperationParamsType} from "../../types/get-operation-params.type";
import {OperationsDataType} from "../../types/operations-data.type";

export class IncomesExpenses {
    readonly openNewRoute: OpenNewRouteType;
    readonly todayElement: HTMLElement;
    readonly weekElement: HTMLElement;
    readonly monthElement: HTMLElement;
    readonly yearElement: HTMLElement;
    readonly allElement: HTMLElement;
    readonly intervalElement: HTMLElement;

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;

        this.getIncomesExpenses().then();

        const todayElement: HTMLElement | null = document.getElementById('today');
        if (todayElement === null) {
            throw new Error('Ошибка при получении элемента "Сегодня"');
        }
        this.todayElement = todayElement;

        const weekElement: HTMLElement | null = document.getElementById('week');
        if (weekElement === null) {
            throw new Error('Ошибка при получении элемента "Неделя"');
        }
        this.weekElement = weekElement;

        const monthElement: HTMLElement | null = document.getElementById('month');
        if (monthElement === null) {
            throw new Error('Ошибка при получении элемента "Месяц"');
        }
        this.monthElement = monthElement;

        const yearElement: HTMLElement | null = document.getElementById('year');
        if (yearElement === null) {
            throw new Error('Ошибка при получении элемента "Год"');
        }
        this.yearElement = yearElement;

        const allElement: HTMLElement | null = document.getElementById('all');
        if (allElement === null) {
            throw new Error('Ошибка при получении элемента "Все"');
        }
        this.allElement = allElement;

        const intervalElement: HTMLElement | null = document.getElementById('interval');
        if (intervalElement === null) {
            throw new Error('Ошибка при получении элемента "Интервал"');
        }
        this.intervalElement = intervalElement;

        const dateFrom = document.getElementById('dateFrom') as HTMLInputElement | null;
        const dateTo = document.getElementById('dateTo') as HTMLInputElement | null;

        if (dateFrom === null || dateTo === null) {
            throw new Error('Ошибка при получении элементов "Дата"');
        }

        const changeDate = () => {
            this.getIncomesExpenses({period: 'interval', dateFrom: dateFrom.value, dateTo: dateTo.value}).then();
        }

        dateFrom.addEventListener('change', changeDate);
        dateTo.addEventListener('change', changeDate);

        this.todayElement.addEventListener('click', () => {
            const today: string = new Date().toISOString().split('T')[0];
            dateFrom.value = today;
            dateTo.value = today;
            this.getIncomesExpenses({period: 'today'}).then();
        });
        this.weekElement.addEventListener('click', () => {
            const week: Date = new Date();
            week.setDate(week.getDate() - 7);
            dateFrom.value = week.toISOString().split('T')[0];
            dateTo.value = new Date().toISOString().split('T')[0];
            this.getIncomesExpenses({period: 'week'}).then();
        });
        this.monthElement.addEventListener('click', () => {
            const month: Date = new Date();
            month.setMonth(month.getMonth() - 1);
            dateFrom.value = month.toISOString().split('T')[0];
            dateTo.value = new Date().toISOString().split('T')[0];
            this.getIncomesExpenses({period: 'month'}).then();
        });
        this.yearElement.addEventListener('click', () => {
            const year: Date = new Date();
            year.setFullYear(year.getFullYear() - 1);
            dateFrom.value = year.toISOString().split('T')[0];
            dateTo.value = new Date().toISOString().split('T')[0];
            this.getIncomesExpenses({period: 'year'}).then();
        });
        this.allElement.addEventListener('click', () => {
            this.getIncomesExpenses({period: 'all'}).then(date => {
                const allDates = date.map(item => new Date(item.date));
                const minDate = new Date(Math.min.apply(null, allDates));
                const maxDate = new Date(Math.max.apply(null, allDates));
                dateFrom.value = minDate.toISOString().split('T')[0];
                dateTo.value = maxDate.toISOString().split('T')[0];
            });
        });
        this.intervalElement.addEventListener('click', changeDate);

        this.activateButtons();
    }

    async getIncomesExpenses(params?: GetOperationParamsType): Promise<OperationsDataType[]> { // Получение данных о доходах и расходах
        if (params === null || params === undefined) {
            params = {};
        }
        const paramsToString: string = new URLSearchParams(params).toString();

        const result = await HttpUtils.request<OperationsDataType[]>(`/operations?${paramsToString}`);
        if (result.redirect) {
           await this.openNewRoute(result.redirect);
            return []; // Возвращаем пустой массив
        }

        if (result.error || !result.response || (result.response && result.error)) {
            alert('Не удалось получить данные о доходах и расходах.');
            return [];
        }

        this.showIncomesExpenses(result.response);
        return result.response;
    }

    showIncomesExpenses(incomesExpenses: OperationsDataType[]) { // Отображение данных о доходах и расходах в таблице
        const recordsElement: HTMLElement | null = document.getElementById('records');
        if (recordsElement === null) {
            throw new Error('Ошибка при получении элемента "records"');
        }
        recordsElement.innerHTML = '';

        for (let i = 0; i < incomesExpenses.length; i++) {
            const trElement: HTMLTableRowElement = document.createElement('tr');
            trElement.insertCell().innerText = String(i + 1);

            let textClass: string = '';
            let typeName: string = '';
            switch (incomesExpenses[i].type) {
                case 'income':
                    textClass = 'text-success';
                    typeName = 'доход';
                    break;
                case 'expense':
                    textClass = 'text-danger';
                    typeName = 'расход';
                    break;
                default:
                    textClass = '';
                    typeName = incomesExpenses[i].type;
                    break;
            }

            const typeCell: HTMLTableCellElement = trElement.insertCell();
            typeCell.innerText = typeName;
            if (textClass) {
                typeCell.classList.add(textClass);
            }

            trElement.insertCell().innerText = incomesExpenses[i].category ?? '-';
            trElement.insertCell().innerText = String(incomesExpenses[i].amount);
            trElement.insertCell().innerText = incomesExpenses[i].date;
            trElement.insertCell().innerText = incomesExpenses[i].comment;

            // Последняя ячейка с кнопками
            const buttonCell: HTMLTableCellElement = trElement.insertCell();

            const buttonWrapper: HTMLDivElement = document.createElement('div');
            buttonWrapper.className = 'd-inline-flex gap-2 align-items-center';

            const deleteButton: HTMLButtonElement = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn p-0';
            deleteButton.setAttribute('aria-label', 'Удалить');
            deleteButton.dataset.id = String(incomesExpenses[i].id);
            deleteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                </svg>
            `;
            deleteButton.addEventListener('click', () => {
                this.deleteCategory(incomesExpenses[i].id);
            });

            const editButton: HTMLAnchorElement = document.createElement('a');
            editButton.href = '/edit-incomes-expenses?id=' + incomesExpenses[i].id;
            editButton.className = 'link-dark text-decoration-none';
            editButton.setAttribute('aria-label', 'Редактировать');
            editButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                </svg>
            `;

            buttonWrapper.appendChild(deleteButton);
            buttonWrapper.appendChild(editButton);
            buttonCell.appendChild(buttonWrapper);

            recordsElement.appendChild(trElement);
        }
    }

    deleteCategory(id: number) {
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
            this.deleteIncomeExpense(id).then();
        };
    }

    async deleteIncomeExpense(id: number) {
        const result = await HttpUtils.request('/operations/' + id, 'DELETE', true);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.error)) {
            return alert('Во время удаления категории доходов/расходов произошла ошибка');
        }

        return this.openNewRoute('/incomes-expenses');
    }

    activateButtons() {
        const buttons: NodeListOf<Element> = document.querySelectorAll('.btn-date-filters .btn');
        if (buttons.length > 0) {
            buttons[0].classList.add('active');
        }
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const currentButton: Element | null = document.querySelector('.btn.active');
                if (currentButton) {
                    currentButton.classList.remove('active');
                }
                button.classList.add('active');
            })
        });
    }
}