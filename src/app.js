import "./styles/styles.scss";
import * as bootstrap from 'bootstrap';
import {Router} from "./router";

class App {
    constructor() {
        new Router();
    }
}

(new App());