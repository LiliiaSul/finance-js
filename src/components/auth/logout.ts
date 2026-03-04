import {AuthUtils} from "../../utils/auth-utils";
import {HttpUtils} from "../../utils/http-utils";
import {OpenNewRouteType} from "../../types/openNewRoute.type";

export class Logout {
    readonly openNewRoute: OpenNewRouteType;

    constructor(openNewRoute: OpenNewRouteType) {
        this.openNewRoute = openNewRoute;

        if (!AuthUtils.getTokens('accessToken') || !AuthUtils.getTokens('refreshToken')) { // Если нет токенов, перенаправляем на страницу логина
            this.openNewRoute('/login').then();
            return;
        }

        this.logout().then();
    }

    private async logout(): Promise<void> {
        await HttpUtils.request('/logout', 'POST', false, {
            refreshToken: AuthUtils.getTokens('refreshToken')
        });

        // Очищаем локальное хранилище
        AuthUtils.removeTokens();
        AuthUtils.removeUser();

        await this.openNewRoute('/login'); // перенаправляем на страницу логина
    }
}