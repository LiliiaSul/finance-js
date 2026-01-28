import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";

export class Logout {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (!AuthUtils.getTokens('accessToken') || !AuthUtils.getTokens('refreshToken')) { // Если нет токенов, перенаправляем на страницу логина
            return this.openNewRoute('/login');
        }

        this.logout().then();
    }

    async logout() {
        await HttpUtils.request('/logout', 'POST', false, {
            refreshToken: AuthUtils.getTokens('refreshToken')
        });

        // Очищаем локальное хранилище
        AuthUtils.removeTokens();
        AuthUtils.removeUser();

        this.openNewRoute('/login'); // перенаправляем на страницу логина
    }
}