import { Component } from '@angular/core';
import { WeaponsComponent } from '../weapons/weapons.component';

@Component({
  selector: 'app-local',
  imports: [WeaponsComponent],
  templateUrl: './local.component.html',
  styleUrl: './local.component.css',
})
export class LocalComponent {

}
