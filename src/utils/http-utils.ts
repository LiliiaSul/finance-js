import config from "../config/config";
import {AuthUtils} from "./auth-utils";
import {TokensType} from "../types/tokens.type";
import {HttpRequestResultType} from "../types/http-request-result.type";


export class HttpUtils {
    public static async request<T>(url: string, method: string = "GET", useAuth: boolean = true, body: any = null): Promise<HttpRequestResultType<T>> {
        const result: HttpRequestResultType<T> = { // объект результата запроса
            error: false,
        };

        const params: any = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };

        let token: string | TokensType | null = null;
        if (useAuth) {
            token = AuthUtils.getTokens('accessToken');
            if (token) {
                params.headers['x-auth-token'] = token; // добавляем токен в заголовки
            }
        }

        if (body) {
            params.body = JSON.stringify(body); // преобразуем объект в JSON строку
        }

        let response: (T & Response) | null = null;
        try {
            response = await fetch(config.api + url, params) as T & Response;
            result.response = await response.json(); // получаем ответ сервера в формате JSON
        } catch (e) {
            result.error = true; // была ошибка
            return result;
        }

        if (response.status < 200 || response.status >= 300) {
            result.error = true; // была ошибка
            if (useAuth && response.status === 401) { // если ошибка авторизации
                //1 - токена нет
                if (!token) {
                    result.redirect = '/login'; // перенаправляем на страницу логина
                } else {
                    //2 - токен истек/невалидный (надо обновить)
                    const updateTokenResult: boolean = await AuthUtils.updateRefreshToken();
                    if (updateTokenResult) {
                        //повторяем запрос с новым токеном
                        return this.request(url, method, useAuth, body);
                    } else { //обновить токен не удалось
                        result.redirect = '/login';
                    }
                }
            }
        }
        return result;
    }
}