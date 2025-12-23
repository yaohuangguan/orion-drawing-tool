const STORAGE_KEY = 'orion_x_project_v1';

export const saveProject = (code: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, code);
    return true;
  } catch (e) {
    console.error("Failed to save project", e);
    return false;
  }
};

export const loadProject = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to load project", e);
    return null;
  }
};