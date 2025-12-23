import { Artboard } from '../types';

const STORAGE_KEY = 'orion_x_project_v1';
// We use a new key for the v2 data structure (Artboard[]) to avoid conflicts if we wanted to be very safe,
// but modifying the existing key with a migration check is cleaner for the user experience.
const STORAGE_KEY_V2 = 'orion_x_project_v2';

export const saveProject = (data: Artboard[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save project", e);
    return false;
  }
};

export const loadProject = (): Artboard[] | null => {
  try {
    const v2Data = localStorage.getItem(STORAGE_KEY_V2);
    if (v2Data) {
        return JSON.parse(v2Data);
    }

    // Fallback/Migration from V1 (Single string)
    const v1Data = localStorage.getItem(STORAGE_KEY);
    if (v1Data) {
        // Migrate to Artboard structure
        const migrated: Artboard[] = [{
            id: crypto.randomUUID(),
            name: 'Untitled Project',
            content: v1Data,
            presetName: 'default',
            createdAt: Date.now()
        }];
        return migrated;
    }
    
    return null;
  } catch (e) {
    console.error("Failed to load project", e);
    return null;
  }
};