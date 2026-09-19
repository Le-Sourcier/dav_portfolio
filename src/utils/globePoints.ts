export function createGlobePoints(count: number, minRadius: number, maxRadius = minRadius): number[] {
  const positions: number[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index++) {
    const y = 1 - 2 * (index + 0.5) / count;
    const ring = Math.sqrt(1 - y * y);
    const angle = index * goldenAngle;
    const radius = minRadius + (maxRadius - minRadius) * ((index * 0.61803398875) % 1);
    positions.push(radius * ring * Math.cos(angle), radius * y, radius * ring * Math.sin(angle));
  }
  return positions;
}
