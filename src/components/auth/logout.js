import {AuthUtils} from "../../utils/auth-utils";

export class Logout {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (!AuthUtils.getTokens('accessToken') || !AuthUtils.getTokens('refreshToken'))  { // Если нет токенов, перенаправляем на страницу логина
            return this.openNewRoute('/login');
        }

        this.logout().then();
    }

    async logout() {
        const response = await fetch('http://localhost:3000/api/logout', { // Здесь будет наш ответ от сервера
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                refreshToken: AuthUtils.getTokens('refreshToken')
            })
        });

        const result = await response.json();
        console.log(result);

        // Очищаем локальное хранилище
        AuthUtils.removeTokens();
        AuthUtils.removeUser();

        this.openNewRoute('/login'); // перенаправляем на страницу логина
    }
}