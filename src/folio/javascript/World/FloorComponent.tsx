import { Plane } from "@react-three/drei";
import { useControls } from "leva";

export default function FloorComponent() {
  const { topLeftColor, topRightColor, bottomLeftColor, bottomRightColor } =
    useControls(
      "Floor",
    {
  topLeftColor: "#0FB7A8",     // soft sky blue
  topRightColor: "#10C3B7",    // slightly brighter
  bottomLeftColor: "#0EA399",  // richer blue near bottom
  bottomRightColor: "#11C8C1", // smooth transition
},
{ collapsed: true, color: "#0FB7A8" }  // accent color
    );

  return (
    <Plane args={[2, 2]} frustumCulled={false} matrixAutoUpdate={false}>
      <floorMaterial
        topLeftColor={topLeftColor}
        topRightColor={topRightColor}
        bottomRightColor={bottomRightColor}
        bottomLeftColor={bottomLeftColor}
      />
    </Plane>
  );
}
