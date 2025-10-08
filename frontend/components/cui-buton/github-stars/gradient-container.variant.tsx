import { ModernGradientContainerContent, ModernGradientContainerRoot } from "./simple-container";

export default function PreviewGradientContainer() {
  return (
    <ModernGradientContainerRoot className="w-1/2">
      <ModernGradientContainerContent className="p-2">preview.gradient-container</ModernGradientContainerContent>
    </ModernGradientContainerRoot>
  );
}
