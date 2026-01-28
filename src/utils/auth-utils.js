import config from "../config/config";

export class AuthUtils {
    static tokensKey = 'tokens';
    static userKey = 'user';

    static setTokens(tokens) {
        localStorage.setItem(this.tokensKey, JSON.stringify(tokens));
    }

    static getTokens(key = null) {
        const tokens = localStorage.getItem(this.tokensKey);

        if (!tokens) {
            return null;
        }

        try {
            const parsedTokens = JSON.parse(tokens);
            if (key && parsedTokens.hasOwnProperty(key)) {
                return parsedTokens[key];
            }
            return parsedTokens;
        } catch (error) {
            console.log(error);
            return null;
        }
    }


    static removeTokens() {
        localStorage.removeItem(this.tokensKey);
    }

    static setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    static getUser() {
        const user = localStorage.getItem(this.userKey);
        return user ? JSON.parse(user) : null;
    }

    static removeUser() {
        localStorage.removeItem(this.userKey);
    }

    static async updateRefreshToken() {
        let result = false;
        const refreshToken = this.getTokens('refreshToken');

        if (refreshToken) {
            try {
                const response = await fetch(config.api + '/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({refreshToken: refreshToken})
                });

                if (response && response.status === 200) {
                    const data = await response.json();
                    const tokens = data.tokens;
                    if (tokens.accessToken && tokens.refreshToken && !data.error) {
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
