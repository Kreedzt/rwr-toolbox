import { Route } from '@angular/router';

/**
 * Route metadata interface for type-safe route data access
 */
export interface RouteData {
    /** Page title for display in UI */
    title: string;

    /** Lucide icon name for menu items */
    icon?: string;

    /** Whether this route requires RWR path detection guard */
    requiresPathDetection?: boolean;

    /** Optional description for breadcrumbs or tooltips */
    description?: string;
}

/**
 * Typed route combining Angular Route with our RouteData
 */
export type TypedRoute = Route & {
    data?: RouteData;
};
