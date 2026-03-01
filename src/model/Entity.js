import { MAX_HEALTH, MAX_DAMAGE, MAX_SPEED, MAX_PATROL_WAYPOINTS, MAX_CURRENCY, MAX_ENTITY_MOVES, CHARACTER_SIZE } from "../constants/hardwareLimits";
import { initializeEntityAnimations } from './AnimationMetadata';

class Entity {
    constructor(id, name = "entity_", tag = "enemy") {
        this.id = id;
        // Only append ID if name ends with underscore (indicating it's a template name)
        this.name = name.endsWith('_') ? name + id : name;
        this.tag = tag;
        
        // Preview pixel data - flat array of CHARACTER_SIZE * CHARACTER_SIZE
        // This represents the default/idle pose for quick preview
        this.pixels = new Array(CHARACTER_SIZE * CHARACTER_SIZE).fill(-1);
        
        this.health = 100;
        this.damage = 10;
        this.speed = 2;
        this.canJump = false;
        this.canFly = false;
        this.moves = [0];

        // Initialize animations from metadata
        this.animations = initializeEntityAnimations(this);

        // when a new entity is created, the drawn character is the first frame of the default animation
        this.defaultAnimation = "idle";
        this.patrolPath = [];
        this.dropCurrency = 50;
        this.dropChance = 50;
    }

    // Name
    getName() {
        return this.name;
    }
    setName(name) {
        if (typeof name !== 'string' || name.trim() === '')
            throw new Error('Name must be a non-empty string');
        this.name = name.trim();
    }

    // Tag
    getTag() {
        return this.tag;
    }
    setTag(tag) {
        this.tag = tag;
    }

    // Health
    getHealth() {
        return this.health;
    }
    setHealth(health) {
        if (health < 0 || health > MAX_HEALTH)
            throw new Error(`Health must be between 0-${MAX_HEALTH - 1}`);
        this.health = Math.floor(health);
    }

    // Damage
    getDamage() {
        return this.damage;
    }
    setDamage(damage) {
        if (damage < 0 || damage > MAX_DAMAGE)
            throw new Error(`Damage must be between 0-${MAX_DAMAGE - 1}`);
        this.damage = Math.floor(damage);
    }

    // Speed
    getSpeed() {
        return this.speed;
    }
    setSpeed(speed) {
        if (speed < 0 || speed > MAX_SPEED)
            throw new Error(`Speed must be between 0-${MAX_SPEED - 1}`);
        this.speed = Math.floor(speed);
    }

    // Can Jump
    getCanJump() {
        return this.canJump;
    }
    setCanJump(canJump) {
        if (typeof canJump !== 'boolean')
            throw new Error('CanJump must be a boolean');
        this.canJump = canJump;
    }

    // Can Fly
    getCanFly() {
        return this.canFly;
    }
    setCanFly(canFly) {
        if (typeof canFly !== 'boolean')
            throw new Error('CanFly must be a boolean');
        this.canFly = canFly;
    }

    // Moves (moveset indices)
    getMoves() {
        return this.moves;
    }
    setMoves(moves) {
        if (!Array.isArray(moves) || moves.length === 0 || moves.length >= MAX_ENTITY_MOVES)
            throw new Error(`Moves must be a non-empty array and limited to ${MAX_ENTITY_MOVES - 1} moves.`);
        if (moves.some(m => m < 0 || m > 255))
            throw new Error('Move indices must be between 0-255');
        this.moves = moves;
    }
    addMove(moveIndex) {
        if (moveIndex < 0 || moveIndex > 255 )
            throw new Error('Move index must be between 0-255');
        if (this.moves.length >= MAX_ENTITY_MOVES - 1)
            throw new Error(`Max amount of moves reached (${MAX_ENTITY_MOVES - 1})! delete to make room for more!`)
        if (!this.moves.includes(moveIndex))
            this.moves.push(moveIndex);
    }
    removeMove(moveIndex) {
        this.moves = this.moves.filter(m => m !== moveIndex);
    }

    // Default Animation
    getDefaultAnimation() {
        return this.defaultAnimation;
    }
    setDefaultAnimation(animName) {
        this.defaultAnimation = animName;
    }

    // Patrol Path
    getPatrolPath() {
        return this.patrolPath;
    }
    setPatrolPath(path) {
        if (!Array.isArray(path))
            throw new Error('Patrol path must be an array');
        if (path.length > MAX_PATROL_WAYPOINTS)
            throw new Error(`Patrol path cannot exceed ${MAX_PATROL_WAYPOINTS} waypoints`);
        this.patrolPath = path;
    }
    addWaypoint(waypoint) {
        if (this.patrolPath.length >= MAX_PATROL_WAYPOINTS)
            throw new Error(`Cannot exceed ${MAX_PATROL_WAYPOINTS} waypoints`);
        this.patrolPath.push(waypoint);
    }
    clearPatrolPath() {
        this.patrolPath = [];
    }

    // Drop Currency
    getDropCurrency() {
        return this.dropCurrency;
    }
    setDropCurrency(amount) {
        if (amount < 0 || amount > MAX_CURRENCY)
            throw new Error(`Drop currency must be between 0-${MAX_CURRENCY - 1}`);
        this.dropCurrency = Math.floor(amount);
    }

    // Drop Chance
    getDropChance() {
        return this.dropChance;
    }
    setDropChance(chance) {
        if (chance < 0 || chance > 100)
            throw new Error('Drop chance must be between 0-100 (percentage)');
        this.dropChance = Math.floor(chance);
    }

    // Animation methods
    getAnimation(name) {
        if (!this.animations[name])
            throw new Error(`Animation "${name}" does not exist`);
        return this.animations[name];
    }
    
    setAnimationFrames(name, frameIds) {
        if (!this.animations[name])
            throw new Error(`Animation "${name}" does not exist`);
        if (!Array.isArray(frameIds))
            throw new Error('Frame IDs must be an array');
        this.animations[name].frameIds = frameIds;
    }

    setAnimationFPS(name, fps) {
        if (!this.animations[name])
            throw new Error(`Animation "${name}" does not exist`);
        if (fps < 1 || fps > 30)
            throw new Error('FPS must be between 1-30');
        this.animations[name].fps = Math.floor(fps);
    }

    setAnimationLoop(name, loop) {
        if (!this.animations[name])
            throw new Error(`Animation "${name}" does not exist`);
        if (typeof loop !== 'boolean')
            throw new Error('Loop must be a boolean');
        this.animations[name].loop = loop;
    }

    // Helper methods
    isPlayer() {
        return this.tag === 'player';
    }

    isEnemy() {
        return this.tag === 'enemy';
    }

    hasPatrolPath() {
        return this.patrolPath.length > 0;
    }

    // refactorPatroPath(path) {
    //     path.sort((a, b) => b.x - a.x)
    // }

    isPatrolPathLooping(path) {
        const start = path[0];
        const end = path[path.length];

        return Math.abs(start.x - end.x) + Math.abs(start.y - end.y) == 1;
    }

    createDeltaPath(start, path) {
        if(this.isPatrolPathLooping(path))
            path = loopPatrolPath(path);

        for(const element of path) {
            element.x = start.x;
            element.y = start.y;

            start = element;
        }
        
        this.patrolPath = path;
    }

    loopPatrolPath(path) {
        let newPath = [...path];

        for(let i = path.length - 2; i > 0; i--) {
            newPath.add(path[i]);
        }
        
        return newPath;
    }

    // Update preview pixels from scene's characterFrames
    updatePreviewPixels(characterFrames) {
        const defaultAnim = this.animations[this.defaultAnimation];
        if (defaultAnim?.frameIds?.length > 0) {
            const frameIndex = defaultAnim.frameIds[0];
            const framePixels = characterFrames[frameIndex];
            if (framePixels) {
                this.pixels = [...framePixels];
            }
        }
    }

    clone() {
        const entity = new Entity(this.id, this.name, this.tag);
        // Constructor already set the name correctly, no need to modify
        entity.pixels = [...this.pixels];
        entity.health = this.health;
        entity.damage = this.damage;
        entity.speed = this.speed;
        entity.canJump = this.canJump;
        entity.canFly = this.canFly;
        entity.moves = [...this.moves];
        entity.animations = structuredClone(this.animations);
        entity.defaultAnimation = this.defaultAnimation;
        entity.patrolPath = [...this.patrolPath];
        entity.dropCurrency = this.dropCurrency;
        entity.dropChance = this.dropChance;
        return entity;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            tag: this.tag,
            // pixels NOT included in export - backend rebuilds from animations
            health: this.health,
            damage: this.damage,
            speed: this.speed,
            canJump: this.canJump,
            canFly: this.canFly,
            moves: this.moves,
            animations: this.animations,
            defaultAnimation: this.defaultAnimation,
            patrolPath: this.patrolPath,
            dropCurrency: this.dropCurrency,
            dropChance: this.dropChance
        };
    }

    static fromJSON(json) {
        const entity = new Entity(json.id, json.name, json.tag);
        // pixels initialized to empty in constructor - will be populated from characterFrames after load
        entity.health = json.health;
        entity.damage = json.damage;
        entity.speed = json.speed;
        entity.canJump = json.canJump;
        entity.canFly = json.canFly || false;
        entity.moves = json.moves;
        entity.animations = json.animations;
        entity.defaultAnimation = json.defaultAnimation;
        entity.patrolPath = json.patrolPath;
        entity.dropCurrency = json.dropCurrency;
        entity.dropChance = json.dropChance;
        return entity;
    }
}

export default Entity;