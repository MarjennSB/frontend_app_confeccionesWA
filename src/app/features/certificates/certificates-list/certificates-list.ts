import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificatesService } from '../../../core/services/certificates.service';
import { Certificate } from '../../../core/models/certificate.model';
import { Landlord } from '../../../core/models/landlord.model';

@Component({
  selector: 'app-certificates-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './certificates-list.html',
})
export class CertificatesListComponent implements OnInit {
  private readonly certificatesService = inject(CertificatesService);

  certificates = signal<Certificate[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  searchTerm = signal('');
  dateFrom = signal('');
  dateTo = signal('');

  page = signal(1);
  limit = signal(10);
  total = signal(0);

  totalPages = computed(() => Math.ceil(this.total() / this.limit()) || 1);
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  selected = signal<Certificate | null>(null);

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.isLoading.set(true);
    this.errorMsg.set(null);
    const filters = {
      search: this.searchTerm() || undefined,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
      page: this.page(),
      limit: this.limit(),
    };
    this.certificatesService.getAll(filters).subscribe({
      next: (res) => {
        this.certificates.set(res.data);
        this.total.set(res.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar las constancias.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  onSearchEnter(): void {
    this.page.set(1);
    this.fetch();
  }

  onDateFromChange(value: string): void {
    this.dateFrom.set(value);
  }

  onDateToChange(value: string): void {
    this.dateTo.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.page.set(1);
    this.fetch();
  }

  hasActiveFilters(): boolean {
    return !!this.searchTerm() || !!this.dateFrom() || !!this.dateTo();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.fetch();
  }

  onLimitChange(value: string): void {
    this.limit.set(Number(value));
    this.page.set(1);
    this.fetch();
  }

  openDetail(cert: Certificate): void {
    this.certificatesService.getById(cert.id).subscribe({
      next: (data) => this.selected.set(data),
    });
  }

  closeDetail(): void {
    this.selected.set(null);
  }

  getLandlordName(landlord?: Landlord): string {
    if (!landlord) return '—';
    return [landlord.first_name, landlord.last_name, landlord.last_name_mother]
      .filter(v => !!v)
      .join(' ') || landlord.document_number;
  }

  getLandlordDocument(landlord?: Landlord): string {
    if (!landlord) return '—';
    const acronym = landlord.type_document?.acronym ?? '';
    const num = landlord.document_number ?? '';
    return acronym ? `${acronym} - ${num}` : num || '—';
  }

  getFileNumber(cert: Certificate): string {
    const num = cert.request?.file_number;
    const date = cert.request?.file_date;
    if (!num) return '—';
    const year = date ? new Date(date).getFullYear() : null;
    return year ? `${num}-${year}` : num;
  }

  formatNumber(num?: string): string {
    if (!num) return '—';
    return num.padStart(4, '0');
  }

  exportExcel(): void {
    const filters = {
      search: this.searchTerm() || undefined,
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
    };
    this.certificatesService.exportExcel(filters).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `constancias-${new Date().toISOString().substring(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.errorMsg.set('Error al exportar el Excel.'),
    });
  }

  downloadWord(cert: Certificate): void {
    this.certificatesService.downloadWord(cert.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `constancia-${this.formatNumber(cert.certificate_number)}-${cert.certificate_year}.docx`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.errorMsg.set('Error al descargar la constancia.'),
    });
  }
}
