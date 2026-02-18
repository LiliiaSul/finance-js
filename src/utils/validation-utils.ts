import {ValidatableElementType, ValidationOptionsType} from "../types/validatable.element.type";

export class ValidationUtils {
    public static validateForm(validatableElements: ValidatableElementType[]): boolean { //проверяем форму, передаем массив элементов для валидации
        let isValid: boolean = true; //валидна форма или нет

        for (let i = 0; i < validatableElements.length; i++) {
            const validationResult: boolean = ValidationUtils.validateField(validatableElements[i].element, validatableElements[i].options);
            if (!validationResult) { //если поле не валидно
                isValid = false;
            }
        }

        return isValid;
    }


    private static validateField(element: HTMLInputElement | null, options?: ValidationOptionsType): boolean { //проверяем одно поле
        if (!element) return false; //если элемент не найден, считаем его невалидным

        let condition: boolean = element.value.trim().length > 0; //по умолчанию проверяем просто на заполненность
        if (options) { //если переданы дополнительные опции
            if (options.pattern) {
                if (options.hasOwnProperty('pattern')) { //если передан паттерн, проверяем по нему
                    condition = options.pattern.test(element.value);
                } else if (options.hasOwnProperty('compareTo')) { //если передано сравнение с другим полем
                    condition = element.value === options.compareTo;
                }
            }
        }

        if (condition) { //если поле заполнено
            element.classList.remove('is-invalid');
            return true; //валидно
        } else {
            element.classList.add('is-invalid');
            return false; //невалидно
        }
    }
}