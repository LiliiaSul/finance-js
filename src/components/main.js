import Chart from 'chart.js/auto';
import {HttpUtils} from "../utils/http-utils";

export class Main {
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

        this.colors = [
            '#DC3545',
            '#FD7E14',
            '#FFC107',
            '#20C997',
            '#0D6EFD',
            '#6F42C1',
            '#E83E8C',
        ];

        this.charts = {};
    }

    createChart(id, title, labels, dataValues) {
        const ctx = document.getElementById(id).getContext('2d');

        if (this.charts[id]) { // Удаляем предыдущий график, если он существует
            this.charts[id].destroy();
        }

        this.charts[id] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: dataValues,
                    backgroundColor: this.colors,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {size: 12}
                        }
                    },
                    title: {
                        display: true,
                        text: title,
                        color: '#290661',
                        font: {size: 28},
                        padding: {bottom: 20}
                    }
                }
            }
        });
        return this.charts[id];
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

    showIncomesExpenses(incomesExpenses) {
        const incomeFilter = incomesExpenses.filter(item => item.type === 'income');
        const expenseFilter = incomesExpenses.filter(item => item.type === 'expense');

        let incomeTotal = {};
        incomeFilter.forEach(item => {
            if (Object.hasOwn(incomeTotal, item.category)) {
                incomeTotal[item.category] += item.amount;
            } else {
                incomeTotal[item.category] = item.amount;
            }
        });

        let expenseTotal = {};
        expenseFilter.forEach(item => {
            if (Object.hasOwn(expenseTotal, item.category)) {
                expenseTotal[item.category] += item.amount;
            } else {
                expenseTotal[item.category] = item.amount;
            }
        });

        this.createChart(
            'incomeChart',
            'Доходы',
            Object.keys(incomeTotal),
            Object.values(incomeTotal)
        );

        this.createChart(
            'expenseChart',
            'Расходы',
            Object.keys(expenseTotal),
            Object.values(expenseTotal)
        );
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