import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="row">
      <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
          <h4 class="mb-sm-0">Inicio</h4>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Bienvenido al Sistema de Gestión de Certificados</h5>
            <p class="text-muted">Selecciona una opción del menú para comenzar.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {}
