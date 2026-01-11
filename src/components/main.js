import Chart from 'chart.js/auto';

export class Main {
    constructor() {
        const colors = [
            '#DC3545',
            '#FD7E14',
            '#FFC107',
            '#20C997',
            '#0D6EFD',
        ];

        const labels = ['Red', 'Orange', 'Yellow', 'Green', 'Blue'];

        function createChart(id, title, dataValues) {
            const ctx = document.getElementById(id).getContext('2d');
            return new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: dataValues,
                        backgroundColor: colors,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {size: 12}
                            }
                        },
                        title: {
                            display: true,
                            text: title,
                            color: '#290661',
                            font: {size: 28},
                            padding: {bottom: 20}
                        }
                    }
                }
            });
        }

        createChart('incomeChart', 'Доходы', [35, 45, 10, 15, 5]);
        createChart('expenseChart', 'Расходы', [50, 10, 10, 20, 30]);
    }
}