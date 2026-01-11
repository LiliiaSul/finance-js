import {Main} from "./components/main";
import {Login} from "./components/auth/login";
import {SignUp} from "./components/auth/sign-up";
import {Incomes} from "./components/incomes/incomes";
import {CreateIncomes} from "./components/incomes/create-incomes";
import {EditIncomes} from "./components/incomes/edit-incomes";
import {Expenses} from "./components/expenses/expenses";
import {CreateExpenses} from "./components/expenses/create-expenses";
import {EditExpenses} from "./components/expenses/edit-expenses";
import {IncomesExpenses} from "./components/incomes-expenses/incomes-expenses";
import {CreateIncomesExpenses} from "./components/incomes-expenses/create-incomes-expenses";
import {EditIncomesExpenses} from "./components/incomes-expenses/edit-incomes-expenses";
import {Logout} from "./components/auth/logout";

export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');

        this.initEvents();
        this.routes = [
            {
                route: '/',
                title: 'Главная страница',
                template: '/templates/main.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Main();
                }
            },
            {
                route: '/login',
                title: 'Страница авторизации',
                template: '/templates/pages/auth/login.html',
                useLayout: false,
                load: () => {
                    new Login();
                }
            },
            {
                route: '/sign-up',
                title: 'Страница регистрации',
                template: '/templates/pages/auth/sign-up.html',
                useLayout: false,
                load: () => {
                    new SignUp();
                }
            },
            {
                route: '/logout',
                load: () => {
                    new Logout();
                }
            },
            {
                route: '/incomes',
                title: 'Доходы',
                template: '/templates/pages/incomes/incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Incomes();
                }
            },
            {
                route: '/create-incomes',
                title: 'Создание категории доходов',
                template: '/templates/pages/incomes/create-incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateIncomes();
                }
            },
            {
                route: '/edit-incomes',
                title: 'Редактирование категории доходов',
                template: '/templates/pages/incomes/edit-incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditIncomes();
                }
            },
            {
                route: '/expenses',
                title: 'Расходы',
                template: '/templates/pages/expenses/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses();
                }
            },
            {
                route: '/create-expenses',
                title: 'Создание категории расходов',
                template: '/templates/pages/expenses/create-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateExpenses();
                }
            },
            {
                route: '/edit-expenses',
                title: 'Редактирование категории расходов',
                template: '/templates/pages/expenses/edit-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditExpenses();
                }
            },
            {
                route: '/incomes-expenses',
                title: 'Доходы и расходы',
                template: '/templates/pages/incomes-expenses/incomes-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomesExpenses();
                }
            },
            {
                route: '/create-incomes-expenses',
                title: 'Создание дохода/расхода',
                template: '/templates/pages/incomes-expenses/create-incomes-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateIncomesExpenses();
                }
            },
            {
                route: '/edit-incomes-expenses',
                title: 'Редактирование дохода/расхода',
                template: '/templates/pages/incomes-expenses/edit-incomes-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditIncomesExpenses();
                }
            },
        ];
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
    }

    async activateRoute() {
        const urlRoute = window.location.pathname;
        const currentRoute = this.routes.find(item => item.route === urlRoute);

        if (currentRoute) {
            if (currentRoute.title) {
                this.titlePageElement.innerText = currentRoute.title;
            }

            if (currentRoute.template) { //если есть шаблон
                let contentBlock = this.contentPageElement;
                if (currentRoute.useLayout) { //если есть layout
                    this.contentPageElement.innerHTML = await fetch(currentRoute.useLayout).then(response => response.text());
                    contentBlock = document.getElementById('content-layout');
                }
                contentBlock.innerHTML = await fetch(currentRoute.template).then(response => response.text());
            }

            if (currentRoute.load && typeof currentRoute.load === 'function') {
                currentRoute.load();
            }

        } else {
            window.location = '/';
        }

    }
}