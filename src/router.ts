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
import {RouteType} from "./types/route.type";
import {OpenNewRouteType} from "./types/openNewRoute.type";
import {BalanceType} from "./types/balance.type";
import {UserInfoType} from "./types/user-info.type";

export class Router {
    readonly titlePageElement: HTMLElement | null;
    readonly contentPageElement: HTMLElement | null;
    readonly balanceElement: HTMLElement | null;
    readonly userNameElement: HTMLElement | null;
    private routes: RouteType[];

    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.balanceElement = document.getElementById('balance');
        this.userNameElement = document.getElementById('user-name');

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
                route: '/incomes/create',
                title: 'Создание категории доходов',
                template: '/templates/pages/incomes/create-incomes.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateIncomes(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/incomes/edit',
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
                route: '/expenses/create',
                title: 'Создание категории расходов',
                template: '/templates/pages/expenses/create-expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new CreateExpenses(this.openNewRoute.bind(this));
                }
            },
            {
                route: '/expenses/edit',
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

    private initEvents(): void {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this)); //отслеживаем клики по всему документу
    }

    public async openNewRoute(url: string): Promise<void> { //открываем новую страницу
        history.pushState({}, '', url); //обновление url адреса в браузере
        await this.activateRoute();
    }

    private async clickHandler(event: MouseEvent): Promise<void> { //обработка клика по ссылке
        const target = event.target as HTMLElement; //получаем элемент, по которому кликнули
        const anchorElement: HTMLAnchorElement | null = target.closest('a'); //ищем ближайший элемент <a> к месту клика
        if (!anchorElement) return; //если кликнули не по ссылке, ничего не делаем

        const href: string | null = anchorElement.getAttribute('href'); //получаем значение атрибута href
        if (!href || href === '/#' || href.startsWith('javascript:void(0)')) { //если ссылка состоит из # или пустая, ничего не делаем
            return;
        }

        event.preventDefault(); //отменяем стандартное поведение ссылки
        const url: string = href.replace(window.location.origin, ''); //получаем только путь без домена
        await this.openNewRoute(url); //открываем новую страницу
    }


    private async activateRoute(): Promise<void> {
        const urlRoute: string = window.location.pathname;

        const isAuthRoute: boolean = urlRoute === '/login' || urlRoute === '/sign-up';

        if (!AuthUtils.getTokens('accessToken') && !isAuthRoute) { //если пользователь не авторизован
            return this.openNewRoute('/login');
        }

        const currentRoute: RouteType | undefined = this.routes.find(item => item.route === urlRoute);

        if (currentRoute) {
            if (currentRoute.title) {
                if (this.titlePageElement) {
                    this.titlePageElement.innerText = currentRoute.title;
                }
            }

            if (currentRoute.template) { //если есть шаблон
                let contentBlock: HTMLElement | null = this.contentPageElement;

                if (currentRoute.useLayout) { //если есть layout
                    if (this.contentPageElement) { //загружаем layout в content
                        this.contentPageElement.innerHTML = await fetch(currentRoute.useLayout as string).then(response => response.text());
                        contentBlock = document.getElementById('content-layout');
                    }

                    if (this.balanceElement) {
                        const balanceData: BalanceType | null = await this.getBalance();
                        if (balanceData && typeof balanceData.balance !== 'undefined') {
                            this.balanceElement.innerText = balanceData.balance + '$';
                        } else {
                            // если не удалось получить баланс пользователя, очищаем поле баланса
                            this.balanceElement.innerText = '';
                        }
                    }

                    const userInfo: UserInfoType | null = AuthUtils.getUser();
                    if (this.userNameElement && userInfo) {
                        this.userNameElement.innerText = userInfo.name + ' ' + userInfo.lastName;
                    }

                    this.activateMenuItem(currentRoute); //активируем пункт меню
                }
                if (contentBlock) {
                    contentBlock.innerHTML = await fetch(currentRoute.template).then(response => response.text());
                }
            }

            if (currentRoute.load && typeof currentRoute.load === 'function') {
                currentRoute.load();
            }
        } else {
            if (this.contentPageElement) {
                this.contentPageElement.innerHTML = '<h1 class="text-center mt-5">Страница не найдена!</h1>';
            }
        }
    }

    private async getBalance() {
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

    private activateMenuItem(route: RouteType): void {
        document.querySelectorAll('.nav .nav-link').forEach(item => {
            const href: string | null = item.getAttribute('href');
            if (href) {
                if ((route.route.includes(href) && href !== '/') || (route.route === '/' && href === '/')) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });

        const accordionLinks: NodeListOf<Element> = document.querySelectorAll('#accordion a'); //находим все ссылки внутри аккордеона
        accordionLinks.forEach(link => { //проходим по каждой ссылке и сравниваем ее href с текущим маршрутом
            const href: string | null = link.getAttribute('href');
            if (route.route.split('/')[1] === href?.split('/')[1]) {
                const collapseElement: HTMLElement | null = link.closest('.accordion-collapse'); //находим ближайший родительский элемент с классом .accordion-collapse, который отвечает за скрытие/показ вложенных пунктов меню
                if (collapseElement) {
                    collapseElement.classList.add('show');
                }
                const btnCollapsed: HTMLElement | null = document.querySelector(`[data-bs-target="#${collapseElement?.id}"]`);
                if (btnCollapsed) {
                    btnCollapsed.classList.remove('collapsed');
                    btnCollapsed.setAttribute('aria-expanded', 'true');
                }
                const liElement: HTMLElement | null = link.closest('li');
                if (liElement) {
                    liElement.classList.add('bg-primary', 'd-block');
                }
                link.classList.add('text-white');
            }
        });
    }
}