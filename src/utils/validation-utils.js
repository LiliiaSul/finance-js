export class ValidationUtils {
    static validateForm(validatableElements) { //проверяем форму, передаем массив элементов для валидации
        let isValid = true; //валидна форма или нет

        for (let i = 0; i < validatableElements.length; i++) {
            const validationResult = ValidationUtils.validateField(validatableElements[i].element, validatableElements[i].options);
            if (!validationResult) { //если поле не валидно
                isValid = false;
            }
        }

        return isValid;
    }


    static validateField(element, options) { //проверяем одно поле
        let condition = element.value; //по умолчанию проверяем просто на заполненность
        if (options) { //если переданы дополнительные опции
            if (options.hasOwnProperty('pattern')) { //если передан паттерн, проверяем по нему
                condition = element.value && element.value.match(options.pattern);
            } else if (options.hasOwnProperty('compareTo')) { //если передано сравнение с другим полем
                condition = element.value && element.value === options.compareTo;
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