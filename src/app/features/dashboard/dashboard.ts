import { Component, inject, OnInit, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService, DashboardData } from '../../core/services/dashboard.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  
  isLoading = signal<boolean>(true);
  stats = signal<DashboardData | null>(null);
  filterDate = signal<string>('');

  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;

  private donutChartInstance: Chart | null = null;
  private barChartInstance: Chart | null = null;
  incomeLineChartInstance: any;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  onDateChange(date: string): void {
    this.filterDate.set(date);
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.dashboardService.getDashboardData(this.filterDate()).subscribe({
      next: (res) => {
        if (res.success) {
          this.stats.set(res.data);
        }
        this.isLoading.set(false);
        // Usamos setTimeout con un pequeño retraso para asegurar que Angular
        // haya destruido el spinner de carga y pintado los canvas en el DOM.
        setTimeout(() => {
          this.renderCharts();
        }, 150);
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
        this.isLoading.set(false);
      }
    });
  }

  renderCharts(): void {
    const data = this.stats();
    if (!data) return;

    // Destruir gráficos anteriores si existen
    if (this.donutChartInstance) {
      this.donutChartInstance.destroy();
    }
    if (this.barChartInstance) {
      this.barChartInstance.destroy();
    }
    if (this.incomeLineChartInstance) {
      this.incomeLineChartInstance.destroy();
    }

    // Renderizar Dona (Facturas)
    const donutCanvas = document.getElementById('donutCanvas') as HTMLCanvasElement;
    if (donutCanvas) {
      this.donutChartInstance = new Chart(donutCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Pagadas', 'Pendientes'],
          datasets: [{
            data: [data.donut_chart.pagadas, data.donut_chart.pendientes],
            backgroundColor: ['#198754', '#dc3545'], // Bootstrap success/danger colors
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }

    // Renderizar Barras (Producción 7 días)
    const barCanvas = document.getElementById('barCanvas') as HTMLCanvasElement;
    if (barCanvas) {
      const labels = data.bar_chart.map(item => item.date);
      const values = data.bar_chart.map(item => item.total);

      this.barChartInstance = new Chart(barCanvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Prendas Producidas',
            data: values,
            backgroundColor: '#0d6efd', // Bootstrap primary color
            borderRadius: 4,
            maxBarThickness: 40
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }

    // Renderizar Líneas (Tendencia de Ingresos)
    const incomeLineCanvas = document.getElementById('incomeLineCanvas') as HTMLCanvasElement;
    if (incomeLineCanvas) {
      const isDaily = !!this.filterDate();
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      let labels: string[] = [];
      let valuesPagadas: number[] = [];
      let valuesPendientes: number[] = [];

      if (!isDaily) {
        labels = monthNames;
        valuesPagadas = Array(12).fill(0);
        valuesPendientes = Array(12).fill(0);
        
        data.income_trend.forEach(item => {
          const index = parseInt(item.label.toString()) - 1;
          if (index >= 0 && index < 12) {
            if (item.payment_status === 'PAGADA') valuesPagadas[index] = Number(item.total);
            if (item.payment_status === 'PENDIENTE') valuesPendientes[index] = Number(item.total);
          }
        });
      } else {
        const selectedDate = new Date(this.filterDate());
        const lastDay = new Date(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth() + 1, 0).getDate();
        
        labels = Array.from({length: lastDay}, (_, i) => `Día ${i + 1}`);
        valuesPagadas = Array(lastDay).fill(0);
        valuesPendientes = Array(lastDay).fill(0);
        
        data.income_trend.forEach(item => {
          const index = parseInt(item.label.toString()) - 1;
          if (index >= 0 && index < lastDay) {
            if (item.payment_status === 'PAGADA') valuesPagadas[index] = Number(item.total);
            if (item.payment_status === 'PENDIENTE') valuesPendientes[index] = Number(item.total);
          }
        });
      }

      this.incomeLineChartInstance = new Chart(incomeLineCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Ingresos Pagados (USD)',
              data: valuesPagadas,
              borderColor: '#198754', // success color
              backgroundColor: 'rgba(25, 135, 84, 0.2)',
              borderWidth: 2,
              pointBackgroundColor: '#198754',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Ingresos Pendientes (USD)',
              data: valuesPendientes,
              borderColor: '#dc3545', // danger color
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              borderWidth: 2,
              pointBackgroundColor: '#dc3545',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    }
  }
}
