import {save, open} from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile} from '@tauri-apps/plugin-fs';

/**
* @param projectData - exported project data from store
* @param suggestedName - Default filename (without extension)
* @returns saved file path or null if cancelled
*/

export async function saveProjectToFile(projectData: any, suggestedName = "untitled"): Promise<string | null> {
    const filePath = await save({
        defaultPath: `${suggestedName}.dlkra`,
        filters: [{
            name: 'Dolkaraa Project', 
            extensions: ['dlkra'] 
        }]
    });

    if(!filePath) return null;

    await writeTextFile(filePath, JSON.stringify(projectData, null, 2));
    return filePath;
}

/**
 * Quick save to existing file path without dialog
 * @param projectData  - exported project data from store
 * @param filePath     - Existing file path to save to
 */
export async function quickSaveProject(projectData: any, filePath: string): Promise<string> {
    await writeTextFile(filePath, JSON.stringify(projectData, null, 2));
    return filePath;
}

export async function loadProjectFromFile(): Promise<{ data: any; path: string } | null> {
    const filePath = await open({
        multiple: false,
        filters: [{
            name: 'Dokaraa Project',
            extensions: ['dlkra']
        }]
    });

    if (!filePath) return null;

    const content = await readTextFile(filePath);
    return {
        data: JSON.parse(content),
        path: filePath
    };
}

/**
 * export single scene as JSON (for backend consumption)
 * @param sceneData - Scene object (use scene.toJSON())
 * @param sceneName - Scene name for default filename
 * @returns saved file path or null if cancelled
 */
export async function exportSceneJSON(sceneData: any, sceneName: string): Promise<string | null> {
    const filePath = await save({
        defaultPath: `${sceneName}.json`,
        filters: [{
            name: 'Scene JSON',
            extensions: ['json']
        }]
    });

    if (!filePath) return null;

    await writeTextFile(filePath, JSON.stringify(sceneData, null, 2));
    return filePath;
}