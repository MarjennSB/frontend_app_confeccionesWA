import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworksService } from '../../core/services/networks.service';
import { VlansService } from '../../core/services/vlans.service';
import { Network } from '../../core/models/network.model';
import { Vlan } from '../../core/models/vlan.model';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

declare const bootstrap: any;

@Component({
  selector: 'app-networks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './networks.html',
  styleUrls: ['./networks.css']
})
export class Networks implements OnInit {
  private networksService = inject(NetworksService);
  private vlansService = inject(VlansService);
  private fb = inject(FormBuilder);

  networks: Network[] = [];
  vlans: Vlan[] = [];
  isLoading = true;

  // Pagination state
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;

  isEditing = signal(false);
  editingId = signal<number | null>(null);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  vlanErrorMsg = signal<string | null>(null);

  networkForm = this.fb.nonNullable.group({
    cidr: ['', [Validators.required]],
    vlan_id: [null as number | null, [Validators.required]],
    scan_interval_minutes: [5, [Validators.min(1)]],
    is_active: [true]
  });

  vlanForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    is_active: [true]
  });

  ngOnInit() {
    this.loadVlans();
    this.loadNetworks();
  }

  loadVlans() {
    this.vlansService.getVlans().subscribe({
      next: (response) => {
        this.vlans = response.data;
      },
      error: (err) => {
        console.error('Error cargando VLANs', err);
      }
    });
  }

  loadNetworks() {
    this.isLoading = true;
    this.networksService.getNetworks().subscribe({
      next: (response) => {
        this.networks = response.data;
        this.totalItems = response.meta.total;
        this.totalPages = response.meta.total_pages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando redes', err);
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.networkForm.reset({
      cidr: '',
      vlan_id: null,
      scan_interval_minutes: 5,
      is_active: true
    });
    this.errorMsg.set(null);
    this.getModal('networkModal').show();
  }

  openEditModal(network: Network) {
    this.isEditing.set(true);
    this.editingId.set(network.id);
    this.networkForm.reset({
      cidr: network.cidr,
      vlan_id: network.vlan_id ?? null,
      scan_interval_minutes: network.scan_interval ? network.scan_interval / 60 : 5,
      is_active: network.is_active ?? true
    });
    this.errorMsg.set(null);
    this.getModal('networkModal').show();
  }

  saveNetwork() {
    if (this.networkForm.invalid) {
      this.networkForm.markAllAsTouched();
      return;
    }

    const formValue = this.networkForm.getRawValue();
    const data: any = { 
      ...formValue,
      scan_interval: formValue.scan_interval_minutes * 60 
    };

    if (this.isEditing() && this.editingId()) {
      const updateData = {
        cidr: data.cidr,
        vlan_id: data.vlan_id,
        scan_interval: data.scan_interval,
        is_active: data.is_active
      };
      
      this.networksService.updateNetwork(this.editingId()!, updateData).subscribe({
        next: () => {
          this.getModal('networkModal').hide();
          this.showSuccess('Red actualizada exitosamente.');
          this.loadNetworks();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al actualizar la red.');
        }
      });
    } else {
      this.networksService.createNetwork(data).subscribe({
        next: () => {
          this.getModal('networkModal').hide();
          this.showSuccess('Red creada exitosamente.');
          this.loadNetworks();
        },
        error: (err) => {
          this.errorMsg.set(err?.error?.message || 'Error al crear la red.');
        }
      });
    }
  }

  networkToDeleteId: number | null = null;

  deleteNetwork(id: number) {
    this.networkToDeleteId = id;
    this.getModal('deleteRecordModal').show();
  }

  confirmDelete() {
    if (this.networkToDeleteId !== null) {
      this.networksService.deleteNetwork(this.networkToDeleteId).subscribe({
        next: () => {
          this.getModal('deleteRecordModal').hide();
          this.showSuccess('Red eliminada exitosamente.');
          this.networkToDeleteId = null;
          this.loadNetworks();
        },
        error: (err) => {
          console.error('Error eliminando red', err);
          this.getModal('deleteRecordModal').hide();
          this.errorMsg.set('Error eliminando la red.');
          this.networkToDeleteId = null;
        }
      });
    }
  }

  // --- VLAN logic ---
  openCreateVlanModal() {
    this.vlanForm.reset({
      name: '',
      description: '',
      is_active: true
    });
    this.vlanErrorMsg.set(null);
    this.getModal('vlanModal').show();
  }

  closeCreateVlanModal() {
    this.getModal('vlanModal').hide();
  }

  saveVlan() {
    if (this.vlanForm.invalid) {
      this.vlanForm.markAllAsTouched();
      return;
    }
    const data = this.vlanForm.getRawValue();
    this.vlansService.createVlan(data).subscribe({
      next: (vlan) => {
        this.vlans.push(vlan);
        this.networkForm.patchValue({ vlan_id: vlan.id });
        this.showSuccess('VLAN creada y seleccionada exitosamente.');
        this.closeCreateVlanModal();
      },
      error: (err) => {
        this.vlanErrorMsg.set(err?.error?.message || 'Error al crear la VLAN.');
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.networkForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  isVlanFieldInvalid(field: string): boolean {
    const control = this.vlanForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3000);
  }

  private getModal(modalId: string): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId));
  }
}
