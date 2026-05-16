import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { RotateCw, Maximize2, Trash2, X, Move } from 'lucide-react';
import { cn } from '../lib/utils';
import { ConfirmationDialog } from './ConfirmationDialog';
import { useStore } from '../store/useStore';

interface DraggableElementProps {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex?: number;
  onUpdate: (updates: { x?: number, y?: number, scale?: number, rotation?: number, text?: string, color?: string, isBold?: boolean, isItalic?: boolean, isUnderline?: boolean, zIndex?: number }) => void;
  onDelete: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  children: React.ReactNode;
  className?: string;
  isSticker?: boolean;
  isText?: boolean;
  initialText?: string;
  textColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  key?: string | number;
  dragConstraints?: { left: number, top: number, right: number, bottom: number };
}

export function DraggableElement({ 
  id, x: initialX, y: initialY, scale: initialScale, rotation: initialRotation, zIndex = 30, onUpdate, onDelete, onBringToFront, onSendToBack, children, className, isSticker, isText, initialText, textColor = '#2C2C2C', isBold, isItalic, isUnderline, dragConstraints
}: DraggableElementProps) {
  const isLayoutMode = useStore(state => state.isLayoutMode);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState(initialText || '');
  
  // Clear editing state if layout mode turns off
  useEffect(() => {
    if (!isLayoutMode) {
      setIsEditing(false);
    }
  }, [isLayoutMode]);

  // Internal state for fluid interaction using useMotionValue
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  const scale = useMotionValue(initialScale);
  const rotation = useMotionValue(initialRotation);
  const invScale = useTransform(scale, s => 1 / s);

  // Sync with props
  useEffect(() => {
    x.set(initialX);
    y.set(initialY);
    scale.set(initialScale);
    rotation.set(initialRotation);
  }, [initialX, initialY, initialScale, initialRotation]);

  const handleTransform = (type: 'rotate' | 'resize', e: React.PointerEvent) => {
    e.stopPropagation();
    
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate center of element in viewport instead of relying on rect state
    const currentCenterX = rect.left + rect.width / 2;
    const currentCenterY = rect.top + rect.height / 2;

    const startX = e.clientX;
    const startY = e.clientY;
    const startDx = startX - currentCenterX;
    const startDy = startY - currentCenterY;
    const startDistance = Math.sqrt(startDx * startDx + startDy * startDy);
    const startScale = scale.get();

    // Use pointer capture to track pointer outside the element reliably
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - currentCenterX;
      const dy = moveEvent.clientY - currentCenterY;

      if (type === 'rotate') {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        // Offset by 90 because the handle is at the top center
        const newRotation = (angle + 90);
        rotation.set(newRotation);
      } else if (type === 'resize') {
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        // Capped Scale between 0.3 and 4.0 for stability
        const newScale = Math.max(0.3, Math.min(4.0, startScale * (currentDistance / Math.max(startDistance, 1))));
        scale.set(newScale);
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      onUpdate({ 
        scale: scale.get(), 
        rotation: rotation.get() 
      });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    onUpdate({ text: e.target.value });
  };

  return (
    <motion.div
      ref={elementRef}
      drag={isLayoutMode}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      style={{
        left: 0,
        top: 0,
        x, 
        y, 
        rotate: rotation,
        scale, // Scale the WHOLE element
        position: 'absolute',
        zIndex: isEditing ? 100 : zIndex
      }}
      onDragEnd={(e, info) => {
        onUpdate({ x: x.get(), y: y.get() });
      }}
      className={cn(
        "group touch-none",
        isLayoutMode ? "cursor-grab active:cursor-grabbing pointer-events-auto" : "pointer-events-none",
        isEditing && "ring-2 ring-dashed ring-[#E8D17E] ring-offset-2",
        className
      )}
      onClick={(e) => {
        if (!isLayoutMode) return;
        e.stopPropagation();
        setIsEditing(!isEditing);
        if (!isEditing && onBringToFront) {
            onBringToFront();
        }
      }}
    >
      <div className={cn(
        "relative flex items-center justify-center",
        isSticker ? "text-5xl sm:text-7xl select-none" : "",
        isText && "min-w-[100px] p-2"
      )}>
        {isText ? (
          <textarea
            value={inputText}
            onChange={handleTextChange}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Type something..."
            className={cn(
              "bg-transparent border-none outline-none resize-none overflow-hidden w-full h-auto text-xl font-bold text-center",
              !isEditing && "pointer-events-none"
            )}
            style={{ 
              minHeight: '1.5em', 
              color: textColor,
              fontWeight: isBold ? '900' : 'bold',
              fontStyle: isItalic ? 'italic' : 'normal',
              textDecoration: isUnderline ? 'underline' : 'none',
              textShadow: '#fff 0px 0px 4px, #fff 0px 0px 4px, #fff 0px 0px 4px, #fff 0px 0px 4px'
            }}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'inherit';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        ) : (
          children
        )}
      </div>

      {/* Control Handles (Inverted Scale) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{ scale: invScale }} // Invert scale for handles
          >
             {/* Delete */}
             <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsDeleteDialogOpen(true);
                }}
                className="absolute -top-4 -left-4 p-1.5 bg-[#FF6B6B] text-white rounded-full border-2 border-[#2C2C2C] pointer-events-auto shadow-md hover:scale-110 active:scale-95 transition-transform"
             >
                <Trash2 size={14} />
             </button>

             {/* Rotation Handle */}
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
                <div className="w-0.5 h-4 bg-[#2C2C2C]" />
                <button
                    onPointerDown={(e) => handleTransform('rotate', e)}
                    className="p-1 bg-[#FDFBF7] text-[#2C2C2C] rounded-full border-2 border-[#2C2C2C] shadow-sm cursor-alias hover:bg-[#E8E4D9]"
                >
                    <RotateCw size={14} />
                </button>
             </div>

             {/* Resize Handle */}
             <button
                onPointerDown={(e) => handleTransform('resize', e)}
                className="absolute -bottom-4 -right-4 p-1.5 bg-[#FDFBF7] text-[#2C2C2C] rounded-full border-2 border-[#2C2C2C] shadow-md pointer-events-auto cursor-nwse-resize hover:bg-[#E8E4D9]"
             >
                <Maximize2 size={14} />
             </button>

             {/* layer order buttons */}
             <div className="absolute top-1/2 -left-10 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto">
               <button onClick={(e) => { e.stopPropagation(); if(onBringToFront) onBringToFront(); }} className="w-8 h-8 flex items-center justify-center bg-white rounded-full border-2 border-[#2C2C2C] shadow-sm hover:bg-[#F4F1EA]">
                 <div className="text-[8px] font-black underline">UP</div>
               </button>
               <button onClick={(e) => { e.stopPropagation(); if(onSendToBack) onSendToBack(); }} className="w-8 h-8 flex items-center justify-center bg-white rounded-full border-2 border-[#2C2C2C] shadow-sm hover:bg-[#F4F1EA]">
                 <div className="text-[8px] font-black overline">DN</div>
               </button>
             </div>

             {/* Text Controls */}
             {isText && (
               <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#FDFBF7] p-2 rounded-xl border-2 border-[#2C2C2C] shadow-[4px_4px_0px_#2C2C2C] pointer-events-auto">
                 <button onClick={(e) => { e.stopPropagation(); onUpdate({ isBold: !isBold }); }} className={cn("px-2 py-1 font-serif font-bold rounded", isBold ? "bg-[#E8D17E]" : "hover:bg-[#E8E4D9]")}>B</button>
                 <button onClick={(e) => { e.stopPropagation(); onUpdate({ isItalic: !isItalic }); }} className={cn("px-2 py-1 font-serif italic rounded", isItalic ? "bg-[#E8D17E]" : "hover:bg-[#E8E4D9]")}>I</button>
                 <button onClick={(e) => { e.stopPropagation(); onUpdate({ isUnderline: !isUnderline }); }} className={cn("px-2 py-1 font-serif underline rounded", isUnderline ? "bg-[#E8D17E]" : "hover:bg-[#E8E4D9]")}>U</button>
                 <div className="w-px h-6 bg-[#2C2C2C] mx-1" />
                 <input type="color" value={textColor} onChange={(e) => onUpdate({ color: e.target.value })} onClick={e => e.stopPropagation()} className="w-6 h-6 p-0 border-none rounded cursor-pointer shrink-0" />
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={onDelete}
        title="Remove Item"
        message="Are you sure you want to remove this from your page? This action cannot be undone."
      />
    </motion.div>
  );
}
