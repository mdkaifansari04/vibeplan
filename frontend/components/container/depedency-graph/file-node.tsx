import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useTheme } from "next-themes";
import type { FileNode as FileNodeType } from "./types";

const FileNode = ({ data }: NodeProps<FileNodeType>) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      typescript: "#3178c6",
      javascript: "#f7df1e",
      json: "#5a5a5a",
      markdown: "#083fa1",
      css: "#264de4",
      html: "#e34c26",
      python: "#3776ab",
    };
    return colors[language.toLowerCase()] || "#6b7280";
  };

  const getFileTypeIcon = (fileType: string) => {
    const icons: Record<string, string> = {
      function: "ƒ",
      config: "⚙",
      component: "◆",
      hook: "⚓",
      utility: "🔧",
      style: "🎨",
    };
    return icons[fileType.toLowerCase()] || "📄";
  };

  return (
    <div className={`file-node ${isDark ? "file-node-dark" : "file-node-light"}`}>
      <Handle type="target" position={Position.Left} className="file-node-handle" />

      <div className="file-node-header">
        <span className="file-node-icon">{getFileTypeIcon(data.fileType)}</span>
        <span className="file-node-label">{data.label}</span>
      </div>

      <div className="file-node-body">
        <div className="file-node-language" style={{ backgroundColor: getLanguageColor(data.language) }}>
          {data.language}
        </div>

        <div className="file-node-stats">
          <div className="stat-item">
            <span className="stat-label">Lines:</span>
            <span className="stat-value">{data.lines}</span>
          </div>
          {data.functions > 0 && (
            <div className="stat-item">
              <span className="stat-label">Fns:</span>
              <span className="stat-value">{data.functions}</span>
            </div>
          )}
          {data.classes > 0 && (
            <div className="stat-item">
              <span className="stat-label">Cls:</span>
              <span className="stat-value">{data.classes}</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="file-node-handle" />
    </div>
  );
};

export default memo(FileNode);
