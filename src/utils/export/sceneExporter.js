const backendUploadLink = 'http://localhost:8080/place-holder-link';


export async function uploadProject(data) {
    try {
        const response = await fetch(backendUploadLink, {
            method: 'POST',
            headers: {'Content-Type:' : 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error('Upload failes: ', response.status);
        }

        return await response.json();
    }
    catch (error) {
        console.error('Failed to upload project: ', error);
        throw error;
    }
}


// this function will also get back the binaries processed by platform.io
// and then it will also convert it into a uint8Array and save it (user dialog for this)
export async function uploadAndCompile(projectData) {
    try {
        const response = await fetch(backendUploadLink, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Compilation failed: ${error.message}`);
        }

        // Backend returns binary file
        const blob = await response.blob();
        
        // Show save dialog for the .bin file
        const filePath = await save({
            defaultPath: `${projectData.projectName}.bin`,
            filters: [
                { name: 'ESP32 Binary', extensions: ['bin'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!filePath) {
            return { success: false, message: 'Save cancelled' };
        }

        // Convert blob to Uint8Array and write to disk
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await writeBinaryFile(filePath, uint8Array);

        return { 
            success: true, 
            message: `Binary saved to ${filePath}`,
            filePath 
        };

    } catch (error) {
        console.error('Failed to compile project:', error);
        return { 
            success: false, 
            message: error.message 
        };
    }
}

// if the build takes too long
// can use this to show the progress bar
export async function getCompilationStatus(jobId) {
    const response = await fetch(`${backendUploadLink}/status/${jobId}`);
    return await response.json();
}

// currently useless functions for the backend. 
// The backend is only supposed to take the project, validate it and
// generate the .pak (or whatever) file for the esp32 to be flashed with

export async function listProjects() {
    const response = await fetch(`${backendUploadLink}/projects`);
    return await response.json();
}

export async function downloadProject(projectId) {
    const response = await fetch(`${backendUploadLink}/projects/${projectId}`);
    return await response.json();
}

export async function deleteProject(projectId) {
    const response = await fetch(`${backendUploadLink}i/projects/${projectId}`, {
        method: 'DELETE'
    });
    return response.ok;
}