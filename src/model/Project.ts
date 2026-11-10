import Scene from "./Scene";
import Exit from "./Exit";
import SpawnPoint from "./SpawnPoint";
import CharacterTemplate from "./CharacterTemplate";
import { MAX_SCENES } from "../utils/HardwareLimits";

export default class Project {
    private id: number;
    private name: string;
    private version: string;
    private author: string;
    
    private scenes: Scene[];
    private characterTemplates: CharacterTemplate[]; // shared character animation data
    
    //private currentSceneId: number; // tracks which scene is currently being edited
    
    constructor(id: number = 0, name: string = 'Untitled Project', version: string = '1.0.0', author: string = '') {
        this.id = id;
        this.name = name;
        this.version = version;
        this.author = author;
        this.scenes = [];
        this.characterTemplates = [];
        //this.currentSceneId = 0;
    }

    // -----------------------------------------------------------
    // GETTERS AND SETTERS
    // -----------------------------------------------------------

    public getId(): number {
        return this.id;
    }
    public setId(id: number): boolean {
        if (id >= 0) {
            this.id = id;
            return true;
        }
        return false;
    }

    public getName(): string {
        return this.name;
    }
    public setName(name: string): boolean {
        this.name = name;
        return true;
    }

    public getVersion(): string {
        return this.version;
    }
    public setVersion(version: string): boolean {
        this.version = version;
        return true;
    }

    public getAuthor(): string {
        return this.author;
    }
    public setAuthor(author: string): boolean {
        this.author = author;
        return true;
    }

    // -----------------------------------------------------------
    // SCENE MANAGEMENT
    // -----------------------------------------------------------

    public getScenes(): Scene[] {
        return this.scenes.map(scene => scene.clone());
    }

    public setScenes(scenes: Scene[]): boolean {
        if (scenes.length <= MAX_SCENES) {
            this.scenes = scenes.map(scene => scene.clone());
            return true;
        }
        return false;
    }

    public getSceneById(sceneId: number): Scene | null {
        const scene = this.scenes.find(s => s.getId() === sceneId);
        return scene ? scene.clone() : null;
    }

    public setSceneById(sceneId: number, scene: Scene): boolean {
        const idx = this.scenes.findIndex(s => s.getId() === sceneId);
        if (idx !== -1) {
            this.scenes[idx] = scene.clone();
            return true;
        }
        return false;
    }

    public addScene(scene: Scene): boolean {
        if (this.scenes.length < MAX_SCENES) {
            this.scenes.push(scene.clone());
            return true;
        }
        console.warn(`Cannot add more than ${MAX_SCENES} scenes to a project.`);
        return false;
    }

    public deleteScene(sceneId: number): boolean {
        const idx = this.scenes.findIndex(s => s.getId() === sceneId);
        if (idx !== -1) {
            this.scenes.splice(idx, 1);

            // Update scene IDs to stay in sync with array indices
            for (let i = idx; i < this.scenes.length; i++) {
                this.scenes[i].setId(i);
            }

            return true;
        }
        console.warn(`Scene with id ${sceneId} not found in the project.`);
        return false;
    }

    // -----------------------------------------------------------
    // CHARACTER TEMPLATE MANAGEMENT
    // -----------------------------------------------------------

    public getCharacterTemplates(): CharacterTemplate[] {
        return this.characterTemplates.map(template => template.clone());
    }

    public setCharacterTemplates(templates: CharacterTemplate[]): boolean {
        this.characterTemplates = templates.map(template => template.clone());
        return true;
    }

    public getCharacterTemplateById(templateId: number): CharacterTemplate | null {
        const template = this.characterTemplates.find(t => t.getId() === templateId);
        return template ? template.clone() : null;
    }

    public setCharacterTemplateById(templateId: number, template: CharacterTemplate): boolean {
        const idx = this.characterTemplates.findIndex(t => t.getId() === templateId);
        if (idx !== -1) {
            this.characterTemplates[idx] = template.clone();
            return true;
        }
        return false;
    }

    public addCharacterTemplate(template: CharacterTemplate): boolean {
        this.characterTemplates.push(template.clone());
        return true;
    }

    public deleteCharacterTemplate(templateId: number): boolean {
        const idx = this.characterTemplates.findIndex(t => t.getId() === templateId);
        if (idx !== -1) {
            this.characterTemplates.splice(idx, 1);

            // Update template IDs to stay in sync with array indices
            for (let i = idx; i < this.characterTemplates.length; i++) {
                this.characterTemplates[i].setId(i);
            }

            return true;
        }
        return false;
    }

    // -----------------------------------------------------------
    // EXIT VALIDATION AND HELPERS
    // -----------------------------------------------------------

    /**
     * Gets the target scene that an exit leads to
     */
    public getTargetScene(exit: Exit): Scene | null {
        return this.getSceneById(exit.getTargetScene());
    }

    /**
     * Gets the spawn point in the target scene that an exit leads to
     */
    public getTargetSpawn(exit: Exit): SpawnPoint | null {
        const targetScene = this.getTargetScene(exit);
        return targetScene?.getSpawnPointById(exit.getTargetSpawn()) ?? null;
    }

    /**
     * Validates that an exit has valid target scene and spawn point
     */
    public validateExit(exit: Exit): boolean {
        const targetScene = this.getTargetScene(exit);
        if (!targetScene) {
            return false;
        }

        const targetSpawn = targetScene.getSpawnPointById(exit.getTargetSpawn());
        return targetSpawn !== null;
    }

    /**
     * Gets all exits from a scene that lead to a specific target scene
     */
    public getExitsToScene(fromSceneId: number, toSceneId: number): Exit[] {
        const scene = this.getSceneById(fromSceneId);
        if (!scene) return [];

        return scene.getExits().filter(exit => exit.getTargetScene() === toSceneId);
    }

    /**
     * Gets all scenes that have exits leading to a specific scene
     */
    public getScenesWithExitsTo(targetSceneId: number): Scene[] {
        return this.scenes
            .filter(scene => 
                scene.getExits().some(exit => exit.getTargetScene() === targetSceneId)
            )
            .map(scene => scene.clone());
    }

    /**
     * Validates all exits in the entire project
     */
    public validateAllExits(): { sceneId: number; exitId: number; error: string }[] {
        const errors: { sceneId: number; exitId: number; error: string }[] = [];

        for (const scene of this.scenes) {
            for (const exit of scene.getExits()) {
                const targetScene = this.getTargetScene(exit);
                
                if (!targetScene) {
                    errors.push({
                        sceneId: scene.getId(),
                        exitId: exit.getId(),
                        error: `Target scene ${exit.getTargetScene()} does not exist`
                    });
                    continue;
                }

                const targetSpawn = targetScene.getSpawnPointById(exit.getTargetSpawn());
                if (!targetSpawn) {
                    errors.push({
                        sceneId: scene.getId(),
                        exitId: exit.getId(),
                        error: `Target spawn point ${exit.getTargetSpawn()} does not exist in scene ${targetScene.getName()}`
                    });
                }
            }
        }

        return errors;
    }

    // -----------------------------------------------------------
    // SERIALIZATION
    // -----------------------------------------------------------

    public clone(): Project {
        const project = new Project(this.id, this.name, this.version, this.author);
        
        project.scenes = this.scenes.map(scene => scene.clone());
        project.characterTemplates = this.characterTemplates.map(template => template.clone());

        return project;
    }

    public toJSON(): object {
        return {
            id: this.id,
            name: this.name,
            version: this.version,
            author: this.author,
            scenes: this.scenes.map(scene => scene.toJSON()),
            characterTemplates: this.characterTemplates.map(template => template.toJSON()),
        };
    }

    public static fromJSON(json: any): Project {
        const project = new Project(json.id, json.name, json.version, json.author);

        project.scenes = json.scenes.map((s: any) => Scene.fromJSON(s));
        project.characterTemplates = json.characterTemplates.map((t: any) => CharacterTemplate.fromJSON(t));

        return project;
    }
}
