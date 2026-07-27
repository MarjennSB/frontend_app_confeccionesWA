import { Component, inject, OnInit, signal, ElementRef, viewChild, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal(true);
  readonly currentYear = new Date().getFullYear();

  private barChart: Chart | null = null;
  private pieChart: Chart | null = null;

  private barCanvas = viewChild<ElementRef<HTMLCanvasElement>>('barChart');
  private pieCanvas = viewChild<ElementRef<HTMLCanvasElement>>('pieChart');

  constructor() {
    effect(() => {
      const data = this.stats();
      if (!data) return;
      // Espera al siguiente frame para que el canvas esté en el DOM
      setTimeout(() => this.buildCharts(data), 0);
    });
  }

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private buildCharts(data: DashboardStats): void {
    const barEl = this.barCanvas()?.nativeElement;
    const pieEl = this.pieCanvas()?.nativeElement;

    if (barEl) {
      if (this.barChart) this.barChart.destroy();
      this.barChart = new Chart(barEl, {
        type: 'bar',
        data: {
          labels: data.byMonth.map(m => m.label),
          datasets: [{
            label: 'Constancias emitidas',
            data: data.byMonth.map(m => m.total),
            backgroundColor: 'rgba(37, 99, 235, 0.7)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1,
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
        },
      });
    }

    if (pieEl) {
      if (this.pieChart) this.pieChart.destroy();
      this.pieChart = new Chart(pieEl, {
        type: 'doughnut',
        data: {
          labels: data.byStatus.map(s => s.label),
          datasets: [{
            data: data.byStatus.map(s => s.total),
            backgroundColor: ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2'],
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } },
          },
        },
      });
    }
  }

  getLandlordName(cert: any): string {
    const l = cert.request?.landlord;
    if (!l) return '—';
    return [l.first_name, l.last_name].filter(Boolean).join(' ') || l.document_number;
  }

  formatNumber(num?: string): string {
    if (!num) return '—';
    return num.padStart(4, '0');
  }
}
