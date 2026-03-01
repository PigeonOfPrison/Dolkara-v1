import { MAX_FPS } from '../constants/hardwareLimits';

/**
 * AnimationMetadata - Defines default animations for entities
 * These animations are initialized for every new entity
 */

export const ANIMATION_DEFINITIONS = [
    {
        id: 'idle',
        label: 'Idle',
        defaultFrameCount: 2,
        defaultFPS: 4,
        defaultLoop: true,
        alwaysEnabled: true
    },
    {
        id: 'running',
        label: 'Running',
        defaultFrameCount: 4,
        defaultFPS: 8,
        defaultLoop: true,
        alwaysEnabled: true
    },
    {
        id: 'jumping',
        label: 'Jumping',
        defaultFrameCount: 2,
        defaultFPS: 6,
        defaultLoop: false,
        alwaysEnabled: false, // Only enabled if canJump is true
        requiresProperty: 'canJump'
    },
    {
        id: 'hurt',
        label: 'Hurt',
        defaultFrameCount: 1,
        defaultFPS: 6,
        defaultLoop: false,
        alwaysEnabled: true
    },
    {
        id: 'death',
        label: 'Death',
        defaultFrameCount: 3,
        defaultFPS: 6,
        defaultLoop: false,
        alwaysEnabled: true
    },
    {
        id: 'melee_attack_01',
        label: 'Melee Attack 1',
        defaultFrameCount: 2,
        defaultFPS: 10,
        defaultLoop: false,
        alwaysEnabled: true
    },
    {
        id: 'melee_attack_02',
        label: 'Melee Attack 2',
        defaultFrameCount: 2,
        defaultFPS: 10,
        defaultLoop: false,
        alwaysEnabled: true
    },
    {
        id: 'shoot_attack',
        label: 'Shoot Attack',
        defaultFrameCount: 2,
        defaultFPS: 8,
        defaultLoop: false,
        alwaysEnabled: true
    },
    {
        id: 'lob_attack',
        label: 'Lob Attack',
        defaultFrameCount: 2,
        defaultFPS: 8,
        defaultLoop: false,
        alwaysEnabled: true
    }
];

/**
 * Check if an animation should be enabled for an entity
 */
export function isAnimationEnabled(animationDef, entity) {
    if (animationDef.alwaysEnabled) return true;
    
    if (animationDef.requiresProperty) {
        return entity[animationDef.requiresProperty] === true;
    }
    
    return false;
}

/**
 * Create default animation object from definition
 */
export function createDefaultAnimation(animationDef) {
    return {
        frameIds: [],
        fps: animationDef.defaultFPS,
        loop: animationDef.defaultLoop
    };
}

/**
 * Initialize all default animations for an entity
 */
export function initializeEntityAnimations(entity) {
    const animations = {};
    
    ANIMATION_DEFINITIONS.forEach(def => {
        animations[def.id] = createDefaultAnimation(def);
    });
    
    return animations;
}

/**
 * Get animation definition by ID
 */
export function getAnimationDefinition(animationId) {
    return ANIMATION_DEFINITIONS.find(def => def.id === animationId);
}

/**
 * Get all enabled animation definitions for an entity
 */
export function getEnabledAnimations(entity) {
    return ANIMATION_DEFINITIONS.filter(def => isAnimationEnabled(def, entity));
}
