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
}

