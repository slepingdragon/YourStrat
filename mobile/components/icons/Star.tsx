import Svg, { Polygon } from "react-native-svg";

type Props = { size?: number };

export function Star({ size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="-50 -50 100 100">
      <Polygon points="0,-50 -3,0 0,0" fill="#FFFFFF" />
      <Polygon points="0,-50 3,0 0,0" fill="#D1D5DB" />
      <Polygon points="50,0 0,-3 0,0" fill="#D1D5DB" />
      <Polygon points="50,0 0,3 0,0" fill="#FFFFFF" />
      <Polygon points="0,50 -3,0 0,0" fill="#D1D5DB" />
      <Polygon points="0,50 3,0 0,0" fill="#FFFFFF" />
      <Polygon points="-50,0 0,-3 0,0" fill="#FFFFFF" />
      <Polygon points="-50,0 0,3 0,0" fill="#D1D5DB" />
      <Polygon points="25,-25 -2,-2 0,0" fill="#9CA3AF" />
      <Polygon points="25,-25 2,2 0,0" fill="#6B7280" />
      <Polygon points="25,25 -2,2 0,0" fill="#6B7280" />
      <Polygon points="25,25 2,-2 0,0" fill="#9CA3AF" />
      <Polygon points="-25,25 2,2 0,0" fill="#9CA3AF" />
      <Polygon points="-25,25 -2,-2 0,0" fill="#6B7280" />
      <Polygon points="-25,-25 2,-2 0,0" fill="#6B7280" />
      <Polygon points="-25,-25 -2,2 0,0" fill="#9CA3AF" />
    </Svg>
  );
}
