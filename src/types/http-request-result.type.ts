export type HttpRequestResultType<T> = {
    error: boolean; // была ли ошибка
    response?: T & Response; // ответ сервера
    redirect?: string; // если нужно перенаправить, то указываем путь
}