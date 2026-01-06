import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MAIN_MENU_ITEMS } from './shared/constants/menu-items';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, RouterLink, LucideAngularModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    menuItems = MAIN_MENU_ITEMS;
    currentYear = new Date().getFullYear();

    constructor(private router: Router) {}

    closeDrawer(): void {
        const drawerInput = document.getElementById('menu-drawer') as HTMLInputElement;
        if (drawerInput) {
            drawerInput.checked = false;
        }
    }

    isActive(link: string | any[]): boolean {
        return this.router.isActive(typeof link === 'string' ? link : link.join('/'), true);
    }
}
