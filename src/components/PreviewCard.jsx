//props = {type, size, scale, pixels, palette, isSelected, onClick}
import { useEffect, useRef } from "react";
import "../css/PreviewCard.css";

export function PreviewCard(props) {

    console.log(`A new previe card has been created for type : ${props.type}`);
    const canvasRef = useRef(null);
    

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = props.size * props.scale;
        canvas.height = props.size * props.scale

        // draw a checker-board background
        for(let y = 0; y < props.size; y++) {
            for(let x = 0; x < props.size; x++) {
                const isLight = (x + y) % 2 === 0;

                ctx.fillStyle = isLight ? '#2a2a2a' : '#1e1e1e';
                ctx.fillRect(x * props.scale, y * props.scale, props.scale, props.scale);
            }
        }

        let pixels;
        if (props.entity.getAllPixels2D) {
            pixels = props.entity.getAllPixels2D();
        } else if (Array.isArray(props.entity.pixels)) {
            // Convert flat array to 2D
            pixels = [];
            for (let y = 0; y < props.size; y++) {
                pixels[y] = props.entity.pixels.slice(y * props.size, (y + 1) * props.size);
            }
        } else if (Array.isArray(props.entity)) {
            // Direct pixel array (for character frames)
            pixels = [];
            for (let y = 0; y < props.size; y++) {
                pixels[y] = props.entity.slice(y * props.size, (y + 1) * props.size);
            }
        }

        // Draw pixels
        for (let y = 0; y < props.size; y++) {
            for (let x = 0; x < props.size; x++) {
                const colourIndex = pixels[y][x];
                if (colourIndex === -1 || colourIndex < 0) continue; // Skip transparent (-1 = transparent)

                // Direct mapping: pixel values 0-29 = palette indices 0-29
                const colour = props.palette[colourIndex];
                if (!colour) {
                    console.warn(`[PreviewCard:${props.type}] No color at index`, colourIndex);
                }
            
                ctx.fillStyle = colour || '#FF00FF'; // Magenta fallback
                ctx.fillRect(x * props.scale, y * props.scale, props.scale, props.scale);
            }
        }
    }, [props.entity, props.palette, props.size, props.scale, props.type]);

    return (
    <button
      className={`${props.type}-card ${props.isSelected ? 'active' : ''}`}
      onClick={props.onClick}
      title={props.entity.name ? `${props.entity.name} (ID: ${props.entity.id})` : undefined}
    >
      <canvas ref={canvasRef} />
    </button>
  );
}