import React, { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FolderNode as FolderNodeType } from "./types";

const FolderNode = ({ data }: NodeProps<FolderNodeType>) => {
  const [isExpanded, setIsExpanded] = useState(data.isExpanded ?? true);

  return (
    <div className="folder-node">
      <Handle type="target" position={Position.Left} className="folder-node-handle" />

      <div className="folder-node-header">
        <span className="folder-icon">📁</span>
        <span className="folder-label">{data.label}</span>
        <span className="folder-count">({data.childCount})</span>
      </div>

      <Handle type="source" position={Position.Right} className="folder-node-handle" />
    </div>
  );
};

export default memo(FolderNode);
