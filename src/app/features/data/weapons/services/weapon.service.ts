import { Injectable, signal, computed, inject } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  Weapon,
  WeaponScanResult,
  AdvancedFilters,
  ColumnVisibility,
  StanceAccuracy,
} from '../../../../shared/models/weapons.models';

/**
 * Manages weapon data state and communicates with Rust backend via Tauri commands.
 * Uses Angular v20 Signals pattern for reactive state management.
 */
@Injectable({ providedIn: 'root' })
export class WeaponService {
  private transloco = inject(TranslocoService);

  // Private writable signals
  private weapons = signal<Weapon[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private searchTerm = signal<string>('');
  private advancedFilters = signal<AdvancedFilters>({});
  private _visibleColumns = signal<ColumnVisibility[]>(this.getDefaultColumns());

  // Public computed signals
  readonly filteredWeapons = computed(() => {
    const weapons = this.weapons();
    const term = this.searchTerm();
    const filters = this.advancedFilters();

    return weapons.filter(
      (w) => this.matchesSearch(w, term) && this.matchesFilters(w, filters)
    );
  });

  readonly weaponsSig = this.weapons.asReadonly();
  readonly loadingSig = this.loading.asReadonly();
  readonly errorSig = this.error.asReadonly();
  readonly visibleColumnsSig = this._visibleColumns.asReadonly();

  /** Scan weapons from game directory */
  async scanWeapons(gamePath: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const result = await invoke<WeaponScanResult>('scan_weapons', {
        gamePath,
      });
      console.log('result', result);
      this.weapons.set(result.weapons);

      // Report errors if any
      if (result.errors.length > 0) {
        const errorMsg = this.transloco.translate('weapons.scanError', {
          error: `${result.errors.length} files failed`,
        });
        this.error.set(errorMsg);
      }

      // Report duplicate keys if any
      if (result.duplicateKeys.length > 0) {
        const duplicateMsg = this.transloco.translate(
          'weapons.errors.duplicateKeys',
          { keys: result.duplicateKeys.join(', ') }
        );
        this.error.set(duplicateMsg);
      }
    } catch (e) {
      const errorMsg = this.transloco.translate('weapons.scanError', {
        error: String(e),
      });
      this.error.set(errorMsg);
    } finally {
      this.loading.set(false);
    }
  }

  /** Refresh weapons using stored game path */
  async refreshWeapons(gamePath: string): Promise<void> {
    return this.scanWeapons(gamePath);
  }

  /** Update search term */
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  /** Update advanced filters */
  setAdvancedFilters(filters: AdvancedFilters): void {
    this.advancedFilters.set(filters);
  }

  /** Clear all filters */
  clearFilters(): void {
    this.searchTerm.set('');
    this.advancedFilters.set({});
  }

  /** Set column visibility */
  setColumnVisibility(columns: ColumnVisibility[]): void {
    this._visibleColumns.set(columns);
    // Persist to localStorage
    try {
      localStorage.setItem('weapons.column.visibility', JSON.stringify(columns));
    } catch {
      // Ignore localStorage errors
    }
  }

  /** Get current column visibility */
  getColumnVisibility(): ColumnVisibility[] {
    return this._visibleColumns();
  }

  /** Get weapon details by key */
  getWeaponDetails(weaponKey: string): Weapon | undefined {
    return this.weapons().find((w) => w.key === weaponKey);
  }

  /** Check if weapon matches search term */
  private matchesSearch(weapon: Weapon, term: string): boolean {
    if (!term) return true;
    const lowerTerm = term.toLowerCase();
    return (
      weapon.name.toLowerCase().includes(lowerTerm) ||
      weapon.key?.toLowerCase().includes(lowerTerm) ||
      weapon.classTag.toLowerCase().includes(lowerTerm)
    );
  }

  /** Check if weapon matches advanced filters */
  private matchesFilters(weapon: Weapon, filters: AdvancedFilters): boolean {
    // Range filters
    if (filters.damage) {
      const dmg = weapon.killProbability;
      if (dmg < filters.damage.min || dmg > filters.damage.max) return false;
    }

    if (filters.fireRate) {
      const rate = weapon.retriggerTime;
      if (rate < filters.fireRate.min || rate > filters.fireRate.max) return false;
    }

    if (filters.magazineSize) {
      const mag = weapon.magazineSize;
      if (mag < filters.magazineSize.min || mag > filters.magazineSize.max)
        return false;
    }

    if (filters.encumbrance) {
      const enc = weapon.encumbrance ?? 0;
      if (enc < filters.encumbrance.min || enc > filters.encumbrance.max)
        return false;
    }

    if (filters.price) {
      const price = weapon.price ?? 0;
      if (price < filters.price.min || price > filters.price.max) return false;
    }

    // Stance accuracy filters
    if (filters.stanceAccuracies) {
      for (const [stance, range] of Object.entries(
        filters.stanceAccuracies
      ) as [string, { min: number; max: number }][]) {
        const accuracy = weapon.stanceAccuracies.find(
          (sa: StanceAccuracy) => sa.stance === stance
        );
        if (!accuracy) return false;
        if (accuracy.accuracy < range.min || accuracy.accuracy > range.max)
          return false;
      }
    }

    // Exact match filters
    if (filters.classTag && weapon.classTag !== filters.classTag) {
      return false;
    }

    if (filters.suppressed !== undefined && weapon.suppressed !== filters.suppressed) {
      return false;
    }

    if (
      filters.canRespawnWith !== undefined &&
      weapon.canRespawnWith !== filters.canRespawnWith
    ) {
      return false;
    }

    return true;
  }

  /** Get default column visibility */
  private getDefaultColumns(): ColumnVisibility[] {
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem('weapons.column.visibility');
      if (stored) {
        return JSON.parse(stored) as ColumnVisibility[];
      }
    } catch {
      // Use defaults
    }

    // Default columns
    return [
      { columnId: 'key', visible: true, order: 0 },
      { columnId: 'name', visible: true, order: 1 },
      { columnId: 'classTag', visible: true, order: 2 },
      { columnId: 'magazineSize', visible: true, order: 3 },
      { columnId: 'killProbability', visible: true, order: 4 },
      { columnId: 'retriggerTime', visible: true, order: 5 },
    ];
  }
}
