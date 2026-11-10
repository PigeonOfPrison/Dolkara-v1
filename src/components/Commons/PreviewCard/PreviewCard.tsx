import { useEffect, useRef } from 'react';
import './PreviewCard.css';
import type Entity from '../../../model/Entity';

interface PreviewCardProps {
    entity: Entity;
    scale?: number;
    palette: string[];
    isSelected: boolean;

    onClick: () => void;
    onDoubleClick: () => void;
    showLabel?: boolean;
}

export function PreviewCard({ entity, scale = 4, palette, isSelected = false, onClick, onDoubleClick, showLabel = false }: Readonly<PreviewCardProps>) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const id = entity.getId();
    const name = entity.getName();
    const pixels = entity.getPixels();
    const size = pixels.length;
    const nullPixel = entity.getNullPixel();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const canvasSize = size * scale;
        canvas.width = canvasSize;
        canvas.height = canvasSize;

        // Drawing a checkerboard background for transparency
        for (let y = 0; y < canvasSize; y += scale) {
            for (let x = 0; x < canvasSize; x += scale) {
                ctx.fillStyle = (x + y) % 2 === 0 ? '#2a2a2a' : '#1e1e1e';
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }

        // Draw the pixels
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const colourIndex = pixels[y][x];
                if (colourIndex === nullPixel) continue; // Skip empty vals
                
                const colour = palette[colourIndex] || '#ff00ff'; // Fallback to magenta for out-of-bounds indices
                ctx.fillStyle = colour;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }, [pixels, palette, size, scale]);

    return (
        <button
            className={`preview-card ${isSelected ? 'preview-card--selected' : ''}`}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            title={`${name} (ID: ${id})`}
        >
            <canvas ref={canvasRef} />
            {showLabel && <span className="preview-card__label">{name}</span>}
            <span className="preview-card__id">{id}</span>
        </button>
    ); 
}