import Chart from 'chart.js/auto';
import {HttpUtils} from "../utils/http-utils";
import {OpenNewRouteType} from "../types/openNewRoute.type";
import {GetOperationParamsType} from "../types/get-operation-params.type";
import {OperationsDataType} from "../types/operations-data.type";

export class Main {
    readonly openNewRoute: OpenNewRouteType;
    readonly todayElement: HTMLElement;
    readonly weekElement: HTMLElement;
    readonly monthElement: HTMLElement;
    readonly yearElement: HTMLElement;
    readonly allElement: HTMLElement;
    readonly intervalElement: HTMLElement;

    readonly colors: string[];
    readonly charts: { [key: string]: Chart }; // Объект для хранения экземпляров графиков

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

        const changeDate = () => { // Функция для получения данных о доходах и расходах при изменении дат в полях
            this.getIncomesExpenses({
                period: 'interval',
                dateFrom: dateFrom.value,
                dateTo: dateTo.value
            }).then();
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
            this.getIncomesExpenses({period: 'all'}).then(date => { // Получаем все даты из данных о доходах и расходах
                const allDates = date.map(item => new Date(item.date));
                const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
                const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
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

    private createChart(id: string, title: string, labels: string[], dataValues: number[]): Chart {
        const canvas = document.getElementById(id) as HTMLCanvasElement | null;
        const ctx = canvas?.getContext('2d');
        if (ctx === null || ctx === undefined) {
            throw new Error('Не найден контекст canvas');
        }

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

    private async getIncomesExpenses(params?: GetOperationParamsType): Promise<OperationsDataType[]> { // Получение данных о доходах и расходах
        if (params === null || params === undefined) {
            params = {}; // Если params не передан, создаем пустой объект
        }
        const paramsToString: string = new URLSearchParams(params).toString(); // Преобразуем объект params в строку параметров для URL

        const result = await HttpUtils.request<OperationsDataType[]>(`/operations?${paramsToString}`);
        if (result.redirect) {
            await this.openNewRoute(result.redirect);
            return [];
        }

        if (result.error || !result.response || (result.response && result.error)) {
            alert('Не удалось получить данные о доходах и расходах.');
            return [];
        }

        this.showIncomesExpenses(result.response);
        return result.response;
    }

    private showIncomesExpenses(incomesExpenses: OperationsDataType[]) {
        const incomeFilter = incomesExpenses.filter(item => item.type === 'income');
        const expenseFilter = incomesExpenses.filter(item => item.type === 'expense');

        let incomeTotal: { [key: string]: number } = {}; // Суммируем доходы по категориям
        incomeFilter.forEach(item => {
            if (Object.hasOwn(incomeTotal, item.category)) {
                incomeTotal[item.category] += item.amount;
            } else {
                incomeTotal[item.category] = item.amount;
            }
        });

        let expenseTotal: { [key: string]: number } = {}; // Суммируем расходы по категориям
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
            Object.keys(expenseTotal), // Категории расходов
            Object.values(expenseTotal) // Суммы расходов по категориям
        );
    }


    private activateButtons(): void {
        const buttons: NodeListOf<Element> = document.querySelectorAll('.btn-date-filters .btn');
        if (buttons.length > 0) { // Активируем первую кнопку по умолчанию
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