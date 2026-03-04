import config from "../config/config";
import {UserInfoType} from "../types/user-info.type";
import {TokensType} from "../types/tokens.type";
import {RefreshResponseType} from "../types/refresh-response.type";

export class AuthUtils {
    private static tokensKey: string = 'tokens';
    private static userKey: string = 'user';

    public static setTokens(tokens: TokensType): void {
        localStorage.setItem(this.tokensKey, JSON.stringify(tokens));
    }

    public static getTokens(key: keyof TokensType | null): string | TokensType | null { // Если ключ не указан, возвращаем весь объект токенов, иначе возвращаем только указанный токен
        const tokens: string | null = localStorage.getItem(this.tokensKey);

        if (!tokens) {
            return null;
        }

        try {
            const parsedTokens: TokensType = JSON.parse(tokens);
            if (key && parsedTokens.hasOwnProperty(key)) {
                return parsedTokens[key];
            }
            return parsedTokens;
        } catch (error) {
            console.log(error);
            return null;
        }
    }


    public static removeTokens(): void {
        localStorage.removeItem(this.tokensKey);
    }

    public static setUser(user: UserInfoType): void {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    public static getUser(): UserInfoType | null {
        const user: string | null = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    public static removeUser() {
        localStorage.removeItem(this.userKey);
    }

    public static async updateRefreshToken(): Promise<boolean> {
        let result: boolean = false;
        const refreshToken: string | TokensType | null = this.getTokens('refreshToken');

        if (refreshToken) {
            try {
                const response: Response = await fetch(config.api + '/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({refreshToken: refreshToken})
                });

                if (response && response.status === 200) {
                    const data: RefreshResponseType = await response.json();
                    const tokens: TokensType | undefined = data.tokens;
                    if (tokens && tokens.accessToken && tokens.refreshToken && !data.error) {
                        this.setTokens(tokens);
                        result = true;
                    }
                }
            } catch (e) {
                result = false;
            }

            if (!result) {
                this.removeTokens();
                this.removeUser();
            }
        }

        return result;
    }

}
