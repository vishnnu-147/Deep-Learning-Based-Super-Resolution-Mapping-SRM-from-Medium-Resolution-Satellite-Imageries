import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { CopernicusModalComponent } from './shared/components/copernicus-modal/copernicus-modal.component';
import { ModelDetailsModalComponent } from './shared/components/model-details-modal/model-details-modal.component';
import { HelpModalComponent } from './shared/components/help-modal/help-modal.component';
import { SettingsModalComponent } from './shared/components/settings-modal/settings-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    CopernicusModalComponent,
    ModelDetailsModalComponent,
    HelpModalComponent,
    SettingsModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly showCopernicusModal = signal<boolean>(false);
  readonly showModelModal = signal<boolean>(false);
  readonly showHelpModal = signal<boolean>(false);
  readonly showSettingsModal = signal<boolean>(false);
}
