import config from "../config/config";

export class HttpUtils {
    static async request(url, method = "GET", body = null) {
        const result = { // объект результата запроса
            error: false, // была ли ошибка
            response: null, // ответ сервера
        };

        const params = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };

        if (body) {
            params.body = JSON.stringify(body); // преобразуем объект в JSON строку
        }

        let response = null;
        try {
            response = await fetch(config.api + url, params);
            result.response = await response.json(); // получаем ответ сервера в формате JSON
        } catch (e) {
            result.error = true; // была ошибка
            return result;
        }

        if (response.status < 200 || response.status >= 300) {
            result.error = true; // была ошибка
        }

        return result;
    }
}