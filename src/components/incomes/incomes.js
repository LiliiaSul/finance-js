import * as bootstrap from 'bootstrap';

export class Incomes {
    constructor() {
        document.querySelectorAll('.delete-category').forEach(button => {
            button.addEventListener('click', this.deleteCategory.bind(this));
        });
    }

    deleteCategory() {
       const modalElement = document.getElementById('deleteModal');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
    }
}