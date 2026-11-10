import { useEditorStore } from "../../../state/editorStore";
import { PreviewCard } from "../../Commons/PreviewCard/PreviewCard";
import type { EntityType } from "../../../state/types";

// limits
import { CHARACTER_SIZE, COLLECTIBLE_SIZE, TILE_SIZE } from "../../../utils/HardwareLimits";
import type Entity from "../../../model/Entity";

// models
import Tile from "../../../model/Tile";
import Character from "../../../model/Character";
import Collectible from "../../../model/Collectible";

// styles
import './EntitySet.css';

interface EntityTypeProps {
    type : EntityType;
}


/**
 * EntitySet - Grid display of all tiles/charactes/collectibles with create button
 * - Displays a scrollable grid of entity previews (tiles, characters, collectibles)
 * - Each preview is clickable to select the entity for editing
 * - Contains a "Create New" button that opens the canvas in create mode
 */
export default function EntitySet ({type} : Readonly<EntityTypeProps>) {
    const currentSceneId = useEditorStore(state => state.currentSceneId);
    const project = useEditorStore(state => state.project);
    const setCanvasTab = useEditorStore(state => state.setCanvasTab);

    // tile-specific
    const selectedTileId = useEditorStore(state => state.selectedTileId);
    const selectTile = useEditorStore(state => state.selectTile);
    const addTile = useEditorStore(state => state.addTile);

    // Character-specific
    const selectedCharacterId = useEditorStore(state => state.selectedCharacterId);
    const selectCharacter = useEditorStore(state => state.selectCharacter);
    const addCharacter = useEditorStore(state => state.addCharacter);

    // Collectible-specific
    const selectedCollectibleId = useEditorStore(state => state.selectedCollectibleId);
    const selectCollectible = useEditorStore(state => state.selectCollectible);
    const addCollectible = useEditorStore(state => state.addCollectible);

    // others
    const currentScene = project?.getScenes().find(s => s.getId() === currentSceneId);
    const palette = currentScene?.getPalette()?.getColours() || [];

    // resolve entities, selected id, select action and size based on entity type
    const entityConfig = {
        tile: {
            entities: currentScene?.getTiles() || [] as Entity[],
            selectedId: selectedTileId,
            select: selectTile,
            size: TILE_SIZE,
            createEntity: (id: number) => new Tile(id, `Tile ${id}`, "ground"),
            addEntity: (e: Entity) => addTile(e as Tile),
            canvasTab: 'tile-editor' as const
        },
        character: {
            entities: currentScene?.getCharacters() || [] as Entity[],
            selectedId: selectedCharacterId,
            select: selectCharacter,
            size: CHARACTER_SIZE,
            createEntity: (id: number) => new Character(id, `Character ${id}`, "character"),
            addEntity: (e: Entity) => addCharacter(e as Character),
            canvasTab: 'character-editor' as const
        },
        collectible: {
            entities: currentScene?.getCollectibles() || [] as Entity[],
            selectedId: selectedCollectibleId,
            select: selectCollectible,
            size: COLLECTIBLE_SIZE,
            createEntity: (id: number) => new Collectible(id, `Collectible ${id}`, "collectible"),
            addEntity: (e: Entity) => addCollectible(e as Collectible),
            canvasTab: 'collectible-editor' as const
        },
    };

    const { entities, selectedId, select, size, createEntity, addEntity, canvasTab } = entityConfig[type];

    const handleCreate = () => {
        if (!currentScene) {
            console.error("[EntitySet] No current scene found. Cannot create entity.");
            return;
        }
        const newEntity = createEntity(entities.length);
        addEntity(newEntity);
        setCanvasTab(canvasTab);
    };

    const handleSelect = (id: number) => {
        select(id);
    }

    const handleDoubleClick = (id: number) => {
        select(id);
        setCanvasTab(canvasTab);
    }

    return (
        <div className={`entityset-container entityset-container--${type}`}>
            <button
                className="entityset-create-btn"
                onClick={handleCreate}
                title={`Create New ${type}`}
            >
                +
            </button>

            {entities.map(entity => (
                <PreviewCard
                    key={entity.getId()}
                    entity={entity}
                    scale={8}
                    palette={palette}
                    isSelected={entity.getId() === selectedId}
                    onClick={() => handleSelect(entity.getId())}
                    onDoubleClick={() => handleDoubleClick(entity.getId())}
                    showLabel={false}
                />
            ))}
        </div>
    )
}
