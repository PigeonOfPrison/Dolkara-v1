import React, { useState } from 'react'
import useEditorStore from '../state/editorStore'
import { ANIMATION_DEFINITIONS, isAnimationEnabled } from '../model/AnimationMetadata'
import { MAX_ANIMATION_FRAMES_PER_ANIMATION } from '../constants/hardwareLimits'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import '../css/AnimationEditor.css'

/**
 * AnimationEditor - Animation frame editor
 * Left: List of animations with frame count and loop settings
 * Right: Frame slots for selected animation
 */
export default function AnimationEditor() {
  const selectedEntityId = useEditorStore(state => state.selectedEntityId)
  const scenes = useEditorStore(state => state.scenes)
  const currentSceneId = useEditorStore(state => state.currentSceneId)
  const selectedAnimationId = useEditorStore(state => state.selectedAnimationId)
  const setSelectedAnimation = useEditorStore(state => state.setSelectedAnimation)
  const startEditingFrame = useEditorStore(state => state.startEditingFrame)
  const clearFrameEditing = useEditorStore(state => state.clearFrameEditing)
  const updateAnimationSettings = useEditorStore(state => state.updateAnimationSettings)
  const removeAnimationFrame = useEditorStore(state => state.removeAnimationFrame)
  const setCharacterAreaTab = useEditorStore(state => state.setCharacterAreaTab)
  const addAnimationFrame = useEditorStore(state => state.addAnimationFrame)
  const editingFrameIndex = useEditorStore(state => state.editingFrameIndex)

  // Get fresh scene and entity data from store to ensure reactivity
  const scene = scenes.find(s => s.id === currentSceneId)
  const entity = scene?.entities.find(e => e.id === selectedEntityId)

  if (!entity) {
    return (
      <div className="animation-editor-empty">
        <p>Select an entity from the Characters tab to edit animations</p>
      </div>
    )
  }

  const enabledAnimations = ANIMATION_DEFINITIONS.filter(def => isAnimationEnabled(def, entity))
  const selectedAnimation = entity.animations[selectedAnimationId]

  const handleAnimationSelect = (animationId) => {
    setSelectedAnimation(animationId)
    // Ensure we stay on animation tab
    setCharacterAreaTab('animation')
  }

  const handleFPSChange = (fps) => {
    updateAnimationSettings(entity.id, selectedAnimationId, { fps })
  }

  const handleLoopChange = (e) => {
    updateAnimationSettings(entity.id, selectedAnimationId, { loop: e.target.checked })
  }

  const handleAddFrame = () => {
    console.log('[AnimationEditor] handleAddFrame called');
    console.log('[AnimationEditor] selectedAnimationId:', selectedAnimationId);
    console.log('[AnimationEditor] entity.id:', entity.id);
    console.log('[AnimationEditor] selectedAnimation:', selectedAnimation);
    
    // Make sure an animation is selected
    if (!selectedAnimationId) {
      console.warn('[AnimationEditor] No animation selected');
      return;
    }
    
    // Check if max frames reached
    if (selectedAnimation?.frameIds.length >= MAX_ANIMATION_FRAMES_PER_ANIMATION) {
      console.warn(`[AnimationEditor] Maximum ${MAX_ANIMATION_FRAMES_PER_ANIMATION} frames per animation reached`);
      return;
    }
    
    console.log('[AnimationEditor] Creating new frame for:', selectedAnimationId);
    
    // Calculate the index where the new frame will be added
    const newFrameIndex = selectedAnimation?.frameIds.length || 0;
    console.log('[AnimationEditor] New frame will be at index:', newFrameIndex);
    
    // Copy pixels from previous frame (last frame in the animation)
    let pixelsToCopy;
    if (newFrameIndex === 0) {
      // First frame - create empty
      pixelsToCopy = new Array(16 * 16).fill(-1);
    } else {
      // Copy from previous frame (the frame just before this one)
      const prevFrameIndex = selectedAnimation.frameIds[newFrameIndex - 1];
      const prevFramePixels = scene.characterFrames[prevFrameIndex];
      pixelsToCopy = prevFramePixels ? [...prevFramePixels] : new Array(16 * 16).fill(-1);
      console.log('[AnimationEditor] Copying from previous frame');
    }
    
    console.log('[AnimationEditor] Created pixels array, length:', pixelsToCopy.length);
    
    // Add the frame immediately to the animation
    console.log('[AnimationEditor] Calling addAnimationFrame');
    addAnimationFrame(entity.id, selectedAnimationId, pixelsToCopy);
    console.log('[AnimationEditor] Frame added');
    
    // Start editing the newly created frame
    console.log('[AnimationEditor] Starting to edit frame at index:', newFrameIndex);
    startEditingFrame(newFrameIndex);
    console.log('[AnimationEditor] Done');
  }

  const handleEditFrame = (frameSlotIndex) => {
    // Start editing existing frame
    startEditingFrame(frameSlotIndex)
  }

  const handleRemoveFrame = (frameSlotIndex) => {
    // Remove without confirmation to avoid Tauri dialog permission issues
    removeAnimationFrame(entity.id, selectedAnimationId, frameSlotIndex)
  }

  return (
    <div className="animation-editor">
      {/* Left Panel - Animation List */}
      <div className="animation-list">
        {enabledAnimations.map(def => {
          const animation = entity.animations[def.id]
          const isSelected = selectedAnimationId === def.id
          
          return (
            <div
              key={def.id}
              className={`animation-list-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleAnimationSelect(def.id)}
            >
              <span className="animation-name">{def.label}</span>
              <div className="loop-checkbox" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={animation?.loop || false}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateAnimationSettings(entity.id, def.id, { loop: e.target.checked });
                  }}
                />
                <span>Loop</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right Panel - Frame Slots */}
      <div className="animation-frames">
        {!selectedAnimationId ? (
          <div className="animation-frames-empty">
            <p>Select an animation to edit frames</p>
          </div>
        ) : (
          <div className="frame-slots">
            {/* Existing Frames */}
            {selectedAnimation?.frameIds.map((frameIndex, slotIndex) => {
              const pixelData = scene.characterFrames[frameIndex]
              // Create unique key based on frame data to force re-render when pixels change
              const frameKey = `${frameIndex}-${pixelData?.join(',').substring(0, 50) || 'empty'}`
              const isEditing = editingFrameIndex === slotIndex
              
              return (
                <div key={frameKey} className={`frame-slot filled ${isEditing ? 'selected' : ''}`}>
                  <canvas
                    width={16}
                    height={16}
                    ref={(canvas) => {
                      if (canvas && pixelData) {
                        const ctx = canvas.getContext('2d')
                        const palette = scene.palette
                        for (let y = 0; y < 16; y++) {
                          for (let x = 0; x < 16; x++) {
                            const colorIndex = pixelData[y * 16 + x]
                            if (colorIndex === -1 || colorIndex < 0 || colorIndex >= 16) {
                              ctx.fillStyle = 'transparent'
                            } else {
                              ctx.fillStyle = palette.getColour(colorIndex)
                            }
                            ctx.fillRect(x, y, 1, 1)
                          }
                        }
                      }
                    }}
                  />
                  <div className="frame-actions">
                    <button onClick={() => handleEditFrame(slotIndex)} title="Edit"><FiEdit2 /></button>
                    <button onClick={() => handleRemoveFrame(slotIndex)} title="Remove"><FiTrash2 /></button>
                  </div>
                </div>
              )
            })}
            
            {/* Add New Frame Button */}
            <div className="frame-slot add-new" onClick={handleAddFrame}>
              <span className="plus-icon">+</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
