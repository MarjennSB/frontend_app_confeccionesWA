import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestCertificatesService } from '../../../core/services/request-certificates.service';
import { LandlordServiceService } from '../../../core/services/landlord-service.service';
import { CertificatesService } from '../../../core/services/certificates.service';
import { RequestCertificate } from '../../../core/models/request-certificate.model';
import { LandlordService } from '../../../core/models/landlord-service.model';
import { Landlord } from '../../../core/models/landlord.model';

interface ServiceGroup {
  year: number;
  services: LandlordService[];
}

@Component({
  selector: 'app-generate-certificate',
  standalone: true,
  imports: [],
  templateUrl: './generate-certificate.html',
})
export class GenerateCertificateComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly requestCertificatesService = inject(RequestCertificatesService);
  private readonly landlordServiceService = inject(LandlordServiceService);
  private readonly certificatesService = inject(CertificatesService);

  request = signal<RequestCertificate | null>(null);
  services = signal<LandlordService[]>([]);
  selectedServiceIds = signal<Set<string>>(new Set());
  isLoading = signal(false);
  isGenerating = signal(false);
  errorMsg = signal<string | null>(null);

  // Servicios agrupados por año de start_date, ordenados por año DESC y por start_date ASC dentro de cada grupo
  groupedServices = computed<ServiceGroup[]>(() => {
    const all = this.services();
    const map = new Map<number, LandlordService[]>();

    for (const s of all) {
      const year = s.start_date ? new Date(s.start_date).getFullYear() : 0;
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(s);
    }

    for (const [, list] of map) {
      list.sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? ''));
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => b - a)
      .map(([year, services]) => ({ year, services }));
  });

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('requestId');
    if (!requestId) {
      this.router.navigate(['/request-certificates']);
      return;
    }
    this.loadRequest(requestId);
  }

  private loadRequest(requestId: string): void {
    this.isLoading.set(true);
    this.requestCertificatesService.getById(requestId).subscribe({
      next: (data) => {
        this.request.set(data);
        if (data.landlord?.id) {
          this.loadServices(data.landlord.id);
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.errorMsg.set('Error al cargar la solicitud.');
        this.isLoading.set(false);
      },
    });
  }

  private loadServices(landlordId: string): void {
    this.landlordServiceService.getByLandlord(landlordId).subscribe({
      next: (data) => {
        this.services.set(data.filter(s => s.is_active));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar los servicios del locador.');
        this.isLoading.set(false);
      },
    });
  }

  toggleService(serviceId: string): void {
    const current = new Set(this.selectedServiceIds());
    if (current.has(serviceId)) {
      current.delete(serviceId);
    } else {
      current.add(serviceId);
    }
    this.selectedServiceIds.set(current);
  }

  isServiceSelected(serviceId: string): boolean {
    return this.selectedServiceIds().has(serviceId);
  }

  selectAll(): void {
    this.selectedServiceIds.set(new Set(this.services().map(s => s.id)));
  }

  selectGroup(services: LandlordService[]): void {
    const current = new Set(this.selectedServiceIds());
    for (const s of services) current.add(s.id);
    this.selectedServiceIds.set(current);
  }

  clearAll(): void {
    this.selectedServiceIds.set(new Set());
  }

  generate(): void {
    if (this.selectedServiceIds().size === 0) {
      this.errorMsg.set('Debe seleccionar al menos un servicio.');
      return;
    }

    this.errorMsg.set(null);
    this.isGenerating.set(true);

    const dto = {
      request_id: this.request()!.id,
      service_ids: Array.from(this.selectedServiceIds()),
    };

    this.certificatesService.generate(dto).subscribe({
      next: () => {
        this.router.navigate(['/request-certificates']);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Error al generar la constancia.');
        this.isGenerating.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/request-certificates']);
  }

  getLandlordName(landlord: Landlord): string {
    return [landlord.first_name, landlord.last_name, landlord.last_name_mother]
      .filter(v => !!v)
      .join(' ') || landlord.document_number;
  }
}
