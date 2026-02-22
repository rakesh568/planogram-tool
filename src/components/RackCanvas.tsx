import { Fragment, useRef } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import type { RackConfig, Shelf, Product } from '../types';
import { cmToPx } from '../utils/unitConversion';
import { SHELF_THICKNESS_PX, RACK_PADDING_PX } from '../utils/constants';
import { ProductImage } from './ProductImage';
import { getRemainingSpace } from '../engine/placementEngine';

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
  const stageHeight = cmToPx(rackConfig.totalHeightCm) + 2 * RACK_PADDING_PX;
  const rackWidthPx = cmToPx(rackConfig.widthCm);
  const rackHeightPx = cmToPx(rackConfig.totalHeightCm);

  const productMap = new Map(products.map(p => [p.id, p]));

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!ref.current || !onDrop) return;
    ref.current.setPointersPositions(e);
    const pos = ref.current.getPointerPosition();
    if (!pos) return;
    const relY = pos.y - RACK_PADDING_PX;
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
          <Rect
            x={RACK_PADDING_PX}
            y={RACK_PADDING_PX}
            width={rackWidthPx}
            height={rackHeightPx}
            fill="#f8f5f0"
            stroke="#8b7355"
            strokeWidth={2}
          />

          {Array.from({ length: rackConfig.numberOfShelves }, (_, i) => {
            const shelfBottomY = RACK_PADDING_PX + rackHeightPx - (i + 1) * cmToPx(rackConfig.shelfHeightCm);
            const shelfTopY = shelfBottomY - cmToPx(rackConfig.shelfHeightCm);
            const shelf = shelves[i];
            const remaining = shelf ? getRemainingSpace(shelf, products, rackConfig) : rackConfig.widthCm - 2 * rackConfig.edgeMarginCm;
            const isFlashing = flashingShelf === i;

            return (
                    <Fragment key={`shelf-${i}`}>
                <Rect
                  x={RACK_PADDING_PX}
                  y={shelfBottomY}
                  width={rackWidthPx}
                  height={SHELF_THICKNESS_PX}
                  fill={isFlashing ? '#ff4444' : '#8b7355'}
                />
                <Text
                  x={RACK_PADDING_PX + 4}
                  y={shelfTopY + 4}
                  text={`Shelf ${i + 1}`}
                  fontSize={10}
                  fill="#8b7355"
                />
                <Text
                  x={RACK_PADDING_PX + rackWidthPx - 80}
                  y={shelfTopY + 4}
                  text={`${remaining.toFixed(1)}cm free`}
                  fontSize={10}
                  fill={remaining <= 0 ? '#cc3300' : '#2d6a2d'}
                />
                <Rect
                  x={RACK_PADDING_PX}
                  y={shelfTopY}
                  width={cmToPx(rackConfig.edgeMarginCm)}
                  height={cmToPx(rackConfig.shelfHeightCm)}
                  fill="rgba(255,150,0,0.15)"
                />
                <Rect
                  x={RACK_PADDING_PX + rackWidthPx - cmToPx(rackConfig.edgeMarginCm)}
                  y={shelfTopY}
                  width={cmToPx(rackConfig.edgeMarginCm)}
                  height={cmToPx(rackConfig.shelfHeightCm)}
                  fill="rgba(255,150,0,0.15)"
                />

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
