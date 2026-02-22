import { Fragment, useRef } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { RackConfig, Shelf, Product } from '../types';
import { cmToPx } from '../utils/unitConversion';
import { SHELF_THICKNESS_PX, RACK_PADDING_PX } from '../utils/constants';
import { ProductImage } from './ProductImage';
import { getRemainingSpace } from '../engine/placementEngine';

// Extra space above the rack so the topmost shelf label has room
const TOP_LABEL_PADDING_PX = 20;

interface RackCanvasProps {
  rackConfig: RackConfig;
  shelves: Shelf[];
  products: Product[];
  onRemovePlacement?: (shelfId: string, productId: string) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
  onDrop?: (e: React.DragEvent, shelfIndex: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  flashingShelf?: number | null;
}

export function RackCanvas({
  rackConfig,
  shelves,
  products,
  onRemovePlacement,
  stageRef,
  onDrop,
  onDragOver,
  flashingShelf,
}: RackCanvasProps) {
  const internalRef = useRef<Konva.Stage>(null);
  const ref = stageRef ?? internalRef;

  const stageWidth = cmToPx(rackConfig.widthCm) + 2 * RACK_PADDING_PX;
  // Extra space: TOP_LABEL_PADDING_PX above rack (topmost shelf label) +
  //              20px below rack (Floor label)
  const stageHeight =
    cmToPx(rackConfig.totalHeightCm) + 2 * RACK_PADDING_PX + TOP_LABEL_PADDING_PX + 20;

  const rackWidthPx = cmToPx(rackConfig.widthCm);
  const rackHeightPx = cmToPx(rackConfig.totalHeightCm);

  // The rack rectangle starts lower to leave room for the topmost shelf label above it
  const rackOriginY = RACK_PADDING_PX + TOP_LABEL_PADDING_PX;

  const productMap = new Map(products.map(p => [p.id, p]));

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!ref.current || !onDrop) return;
    ref.current.setPointersPositions(e);
    const pos = ref.current.getPointerPosition();
    if (!pos) return;
    const relY = pos.y - rackOriginY;
    const shelfHeightPx = cmToPx(rackConfig.shelfHeightCm);
    const shelfIndex = Math.floor((rackHeightPx - relY) / shelfHeightPx);
    const clampedIndex = Math.max(0, Math.min(rackConfig.numberOfShelves - 1, shelfIndex));
    onDrop(e, clampedIndex);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); onDragOver?.(e); }}
      style={{ display: 'inline-block' }}
    >
      <Stage width={stageWidth} height={stageHeight} ref={ref}>
        <Layer>
          {/* Rack background */}
          <Rect
            x={RACK_PADDING_PX}
            y={rackOriginY}
            width={rackWidthPx}
            height={rackHeightPx}
            fill="#f8f5f0"
            stroke="#8b7355"
            strokeWidth={2}
          />

          {/* Floor / base of the rack */}
          <Rect
            x={RACK_PADDING_PX}
            y={rackOriginY + rackHeightPx}
            width={rackWidthPx}
            height={6}
            fill="#5c4a32"
          />
          <Text
            x={RACK_PADDING_PX + rackWidthPx / 2 - 12}
            y={rackOriginY + rackHeightPx + 8}
            text="Floor"
            fontSize={10}
            fill="#5c4a32"
            fontStyle="bold"
          />

          {Array.from({ length: rackConfig.numberOfShelves }, (_, i) => {
            const shelfHeightPx = cmToPx(rackConfig.shelfHeightCm);
            // Y position of the bottom divider line of this shelf
            const shelfBottomY = rackOriginY + rackHeightPx - (i + 1) * shelfHeightPx;
            // Y position of the top of this shelf's content area
            const shelfTopY = shelfBottomY - shelfHeightPx;
            const shelf = shelves[i];
            const remaining = shelf
              ? getRemainingSpace(shelf, products, rackConfig)
              : rackConfig.widthCm - 2 * rackConfig.edgeMarginCm;
            const isFlashing = flashingShelf === i;
            const isTopShelf = i === rackConfig.numberOfShelves - 1;

            // Label renders above the shelf bottom line
            // For the topmost shelf: label goes into the TOP_LABEL_PADDING_PX area above the rack
            const labelY = isTopShelf
              ? RACK_PADDING_PX + 4
              : shelfTopY + 4;

            return (
              <Fragment key={`shelf-${i}`}>
                {/* Shelf bottom divider line (skip for topmost — rack border serves as ceiling) */}
                {!isTopShelf && (
                  <Rect
                    x={RACK_PADDING_PX}
                    y={shelfBottomY}
                    width={rackWidthPx}
                    height={SHELF_THICKNESS_PX}
                    fill={isFlashing ? '#ff4444' : '#8b7355'}
                  />
                )}
                {/* Shelf label */}
                <Text
                  x={RACK_PADDING_PX + 4}
                  y={labelY}
                  text={`Shelf ${i + 1}`}
                  fontSize={10}
                  fill="#8b7355"
                />
                {/* Remaining space indicator */}
                <Text
                  x={RACK_PADDING_PX + rackWidthPx - 80}
                  y={labelY}
                  text={`${remaining.toFixed(1)}cm free`}
                  fontSize={10}
                  fill={remaining <= 0 ? '#cc3300' : '#2d6a2d'}
                />
                {/* Left edge margin highlight */}
                <Rect
                  x={RACK_PADDING_PX}
                  y={shelfTopY}
                  width={cmToPx(rackConfig.edgeMarginCm)}
                  height={shelfHeightPx}
                  fill="rgba(255,150,0,0.15)"
                />
                {/* Right edge margin highlight */}
                <Rect
                  x={RACK_PADDING_PX + rackWidthPx - cmToPx(rackConfig.edgeMarginCm)}
                  y={shelfTopY}
                  width={cmToPx(rackConfig.edgeMarginCm)}
                  height={shelfHeightPx}
                  fill="rgba(255,150,0,0.15)"
                />

                {/* Flashing overlay for invalid placement */}
                {isFlashing && (
                  <Rect
                    x={RACK_PADDING_PX}
                    y={shelfTopY}
                    width={rackWidthPx}
                    height={shelfHeightPx}
                    fill="rgba(255,68,68,0.15)"
                  />
                )}

                {shelf?.placements.map(placement => {
                  const product = productMap.get(placement.productId);
                  if (!product) return null;
                  const px = RACK_PADDING_PX + cmToPx(rackConfig.edgeMarginCm) + cmToPx(placement.xPositionCm);
                  const py = shelfBottomY - cmToPx(product.heightCm);
                  const pw = cmToPx(product.widthCm);
                  const ph = cmToPx(product.heightCm);

                  return (
                    <Fragment key={`product-${shelf.id}-${placement.productId}`}>
                      <ProductImage src={product.imageSrc} x={px} y={py} width={pw} height={ph} />
                      <Rect x={px} y={py} width={pw} height={ph} stroke="#555" strokeWidth={1} fill="transparent" />
                      <Text
                        x={px + pw - 14}
                        y={py + 2}
                        text="×"
                        fontSize={14}
                        fill="#cc3300"
                        onClick={() => onRemovePlacement?.(shelf.id, placement.productId)}
                        onTap={() => onRemovePlacement?.(shelf.id, placement.productId)}
                        style={{ cursor: 'pointer' }}
                      />
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
