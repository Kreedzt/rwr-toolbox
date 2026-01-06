import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Route guard that checks if RWR installation path has been detected.
 * Redirects to settings/paths page if path is not configured.
 *
 * @returns True if path is detected, UrlTree for redirect otherwise
 */
export const pathDetectedGuard: CanActivateFn = async (route, state) => {
    const router = inject(Router);

    // TODO: Implement actual path detection logic via Tauri backend
    // For now, we'll allow access but this should be enhanced with real path checking
    //
    // Example implementation:
    // try {
    //     const pathDetected = await invoke<boolean>('check_rwr_path');
    //
    //     if (!pathDetected) {
    //         return router.createUrlTree(['/settings/paths'], {
    //             queryParams: { returnUrl: state.url }
    //         });
    //     }
    //
    //     return true;
    // } catch (error) {
    //     console.error('Path detection failed:', error);
    //     // Allow access but show warning in component
    //     return true;
    // }

    // Temporary: allow all access
    return true;
};
