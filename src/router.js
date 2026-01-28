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
import {AuthUtils} from "./utils/auth-utils";
import {HttpUtils} from "./utils/http-utils";

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
                    new Main(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/login',
                title: 'Страница авторизации',
                template: '/templates/pages/auth/login.html',
                useLayout: false,
                load: () => {
                    new Login(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/sign-up',
                title: 'Страница регистрации',
                template: '/templates/pages/auth/sign-up.html',
                useLayout: false,
                load: () => {
                    new SignUp(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/logout',
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/incomes',
                title: 'Доходы',
                template: '/templates/pages/incomes/incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Incomes(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/create-incomes',
                title: 'Создание категории доходов',
                template: '/templates/pages/incomes/create-incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateIncomes(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/edit-incomes',
                title: 'Редактирование категории доходов',
                template: '/templates/pages/incomes/edit-incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditIncomes(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/expenses',
                title: 'Расходы',
                template: '/templates/pages/expenses/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/create-expenses',
                title: 'Создание категории расходов',
                template: '/templates/pages/expenses/create-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateExpenses(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/edit-expenses',
                title: 'Редактирование категории расходов',
                template: '/templates/pages/expenses/edit-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditExpenses(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/incomes-expenses',
                title: 'Доходы и расходы',
                template: '/templates/pages/incomes-expenses/incomes-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomesExpenses(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/create-incomes-expenses',
                title: 'Создание дохода/расхода',
                template: '/templates/pages/incomes-expenses/create-incomes-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateIncomesExpenses(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/edit-incomes-expenses',
                title: 'Редактирование дохода/расхода',
                template: '/templates/pages/incomes-expenses/edit-incomes-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new EditIncomesExpenses(this.openNewRoute.bind(this));
                }
            },
        ];
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this)); //отслеживаем клики по всему документу

    }

    async openNewRoute(url) { //открываем новую страницу
        history.pushState({}, '', url); //обновление url адреса в браузере
        await this.activateRoute();
    }

    async clickHandler(event) { //обработка клика по ссылке
        let element = null;
        if (event.target.nodeName === 'A') {
            element = event.target;
        } else if (event.target.parentNode.nodeName === 'A') { //если кликнули на вложенный элемент внутри ссылки
            element = event.target.parentNode;
        }

        if (element) { //если кликнули по ссылке
            event.preventDefault(); //отменяем стандартное поведение ссылки

            const url = element.href.replace(window.location.origin, ''); //получаем только путь без домена
            if (!url || url === '/#' || url.startsWith('javascript:void(0)')) { //если ссылка состоит из # или пустая
                return;
            }

            await this.openNewRoute(url);
        }
    }

    async activateRoute() {
        const urlRoute = window.location.pathname;

        const isAuthRoute = urlRoute === '/login' || urlRoute === '/sign-up';

        if (!AuthUtils.getTokens('accessToken') && !isAuthRoute) { //если пользователь не авторизован
            return this.openNewRoute('/login');
        }

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

                this.balanceElement = document.getElementById('balance');
                if (this.balanceElement) {
                    const balanceData = await this.getBalance();
                    if (balanceData && typeof balanceData.balance !== 'undefined') {
                        this.balanceElement.innerText = balanceData.balance + '$';
                    } else {
                        // если не удалось получить баланс пользователя, очищаем поле баланса
                        this.balanceElement.innerText = '';
                    }
                }

                this.userNameElement = document.getElementById('user-name');
                const userInfo = AuthUtils.getUser();
                if (userInfo) {
                    this.userNameElement.innerText = userInfo.name + ' ' + userInfo.lastName;
                }

                this.activateMenuItem(currentRoute);
            }

            if (currentRoute.load && typeof currentRoute.load === 'function') {
                currentRoute.load();
            }


        }
    }

    async getBalance() {
        const result = await HttpUtils.request('/balance');
        if (result.redirect) { // если нужно перенаправление
            await this.openNewRoute(result.redirect);
            return null;
        }

        if (result.error || !result.response || (result.response && result.response.error)) {
            alert('Возникла ошибка при получении баланса. Обратитесь в поддержку.');
            return null;
        }

        return result.response;
    }

    activateMenuItem(route) {
        document.querySelectorAll('.nav .nav-link').forEach(item => {
            const href = item.getAttribute('href');
            if ((route.route.includes(href) && href !== '/') || (route.route === '/' && href === '/')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}