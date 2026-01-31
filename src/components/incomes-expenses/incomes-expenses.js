import {HttpUtils} from "../../utils/http-utils";
import * as bootstrap from "bootstrap";

export class IncomesExpenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.getIncomesExpenses().then();

        this.todayElement = document.getElementById('today');
        this.weekElement = document.getElementById('week');
        this.monthElement = document.getElementById('month');
        this.yearElement = document.getElementById('year');
        this.allElement = document.getElementById('all');
        this.intervalElement = document.getElementById('interval');

        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');

        const changeDate = () => {
            this.getIncomesExpenses({period: 'interval', dateFrom: dateFrom.value, dateTo: dateTo.value}).then();
        }

        dateFrom.addEventListener('change', changeDate);
        dateTo.addEventListener('change', changeDate);

        this.todayElement.addEventListener('click', () => {
            const today = new Date().toISOString().split('T')[0];
            dateFrom.value = today;
            dateTo.value = today;
            this.getIncomesExpenses({period: 'today'}).then();
        });
        this.weekElement.addEventListener('click', () => {
            const week = new Date();
            week.setDate(week.getDate() - 7);
            dateFrom.value = week.toISOString().split('T')[0];
            dateTo.value = new Date().toISOString().split('T')[0];
            this.getIncomesExpenses({period: 'week'}).then();
        });
        this.monthElement.addEventListener('click', () => {
            const month = new Date();
            month.setMonth(month.getMonth() - 1);
            dateFrom.value = month.toISOString().split('T')[0];
            dateTo.value = new Date().toISOString().split('T')[0];
            this.getIncomesExpenses({period: 'month'}).then();
        });
        this.yearElement.addEventListener('click', () => {
            const year = new Date();
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

    async getIncomesExpenses(params) { // Получение данных о доходах и расходах
        if (params === null || params === undefined) {
            params = {};
        }
        const paramsToString = new URLSearchParams(params).toString();

        const result = await HttpUtils.request(`/operations?${paramsToString}`);
        if (result.redirect) {
            return this.openNewRoute(result.redirect);
        }

        if (result.error || !result.response || (result.response && result.error)) {
            return alert('Не удалось получить данные о доходах и расходах.');
        }

        this.showIncomesExpenses(result.response);
        return result.response;
    }

    showIncomesExpenses(incomesExpenses) { // Отображение данных о доходах и расходах в таблице
        const recordsElement = document.getElementById('records');
        recordsElement.innerHTML = '';

        for (let i = 0; i < incomesExpenses.length; i++) {
            const trElement = document.createElement('tr');
            trElement.insertCell().innerText = i + 1;

            let textClass = '';
            let typeName = '';
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

            const typeCell = trElement.insertCell();
            typeCell.innerText = typeName;
            if (textClass) {
                typeCell.classList.add(textClass);
            }

            trElement.insertCell().innerText = incomesExpenses[i].category ?? '-';
            trElement.insertCell().innerText = incomesExpenses[i].amount;
            trElement.insertCell().innerText = incomesExpenses[i].date;
            trElement.insertCell().innerText = incomesExpenses[i].comment;

            // Последняя ячейка с кнопками
            const buttonCell = trElement.insertCell();

            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'd-inline-flex gap-2 align-items-center';

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn p-0';
            deleteButton.setAttribute('aria-label', 'Удалить');
            deleteButton.dataset.id = incomesExpenses[i].id;
            deleteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                </svg>
            `;
            deleteButton.addEventListener('click', () => {
                this.deleteCategory(incomesExpenses[i].id);
            });

            const editButton = document.createElement('a');
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

    deleteCategory(id) {
        const modalElement = document.getElementById('deleteModal');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
        const deleteButton = document.getElementById('deleteButton');
        deleteButton.onclick = () => {
            modalInstance.hide();
            this.deleteIncomeExpense(id).then();
        };
    }

    async deleteIncomeExpense(id) {
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
        const buttons = document.querySelectorAll('.btn-date-filters .btn');
        if (buttons.length > 0) {
            buttons[0].classList.add('active');
        }
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const currentButton = document.querySelector('.btn.active');
                if (currentButton) {
                    currentButton.classList.remove('active');
                }
                button.classList.add('active');
            })
        });
    }
}