import { Component, inject, OnInit, signal } from '@angular/core';
import { CertificatesService } from '../../../core/services/certificates.service';
import { Certificate } from '../../../core/models/certificate.model';
import { Landlord } from '../../../core/models/landlord.model';

@Component({
  selector: 'app-certificates-list',
  standalone: true,
  imports: [],
  templateUrl: './certificates-list.html',
})
export class CertificatesListComponent implements OnInit {
  private readonly certificatesService = inject(CertificatesService);

  certificates = signal<Certificate[]>([]);
  filteredCertificates = signal<Certificate[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  searchTerm = signal('');

  // Detalle seleccionado
  selected = signal<Certificate | null>(null);

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.isLoading.set(true);
    this.certificatesService.getAll().subscribe({
      next: (data) => {
        this.certificates.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar las constancias.');
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredCertificates.set(this.certificates());
      return;
    }
    this.filteredCertificates.set(
      this.certificates().filter(
        (c) =>
          (c.certificate_number ?? '').toLowerCase().includes(term) ||
          String(c.certificate_year ?? '').includes(term) ||
          (c.responsible_name ?? '').toLowerCase().includes(term) ||
          (c.user_initials ?? '').toLowerCase().includes(term) ||
          (c.request ? this.getLandlordName(c.request.landlord) : '').toLowerCase().includes(term) ||
          (c.request?.file_number ?? '').toLowerCase().includes(term)
      )
    );
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilter();
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

  formatNumber(num?: string): string {
    if (!num) return '—';
    return num.padStart(4, '0');
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
