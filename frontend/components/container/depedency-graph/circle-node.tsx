import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

interface CircleNodeProps {
  id: string;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
}

const CircleNode = memo(({ id, positionAbsoluteX, positionAbsoluteY }: CircleNodeProps) => {
  const label = `Position x:${Math.round(positionAbsoluteX)} y:${Math.round(positionAbsoluteY)}`;

  return (
    <div>
      <div>{label || "no node connected"}</div>
      <Handle type="target" position={Position.Left} className="custom-handle" />
    </div>
  );
});

CircleNode.displayName = "CircleNode";

export default CircleNode;
