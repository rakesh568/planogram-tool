import { Image } from 'react-konva';
import { useImage } from 'react-konva-utils';

interface ProductImageProps {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onClick?: () => void;
}

export function ProductImage({ src, x, y, width, height, onClick }: ProductImageProps) {
  const [image] = useImage(src, 'anonymous');
  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      onClick={onClick}
      onTap={onClick}
    />
  );
}
