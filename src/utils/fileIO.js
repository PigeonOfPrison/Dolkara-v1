import {save, open} from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile} from '@tauri-apps/plugin-fs';

/**
* @param {Object} projectData - exported project data from store
* @param {string} suggestedName - Default filename (without extension)
* @returns {string|null} - saved file path or null if cancer
*/

export async function saveProjectToFile(projectData, suggestedName = "untitled") {
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
 * @param {Object} projectData  - exported project data from store
 * @param {string} filePath     - Existing file path to save to
 */
export async function quickSaveProject(projectData, filePath) {
    await writeTextFile(filePath, JSON.stringify(projectData, null, 2));
    return filePath;
}

export async function loadProjectFromFile() {
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
 * export single scene as JSON (for backend cosumption)
 * @param {Object} sceneData - Scene object (use scene.toJSON())
 * @param {string} sceneName - Scene name for default filenme
 * @returns {string|null} - saved file path or null if cancelled
 */
export async function exportSceneJSON(sceneData, sceneName) {
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