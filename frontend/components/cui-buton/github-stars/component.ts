interface ComponentMetaType {
  name: string;
  description: string;
  sizePreview: "sm" | "md" | "lg";
  inspiration: string;
  inspirationLink: string;
}
export const Component: ComponentMetaType = {
  name: "Github Stars Button",
  description: "Button with to show the number of stars of a GitHub repository.",
  sizePreview: "sm",
  inspiration: "Refine",
  inspirationLink: "https://refine.dev/",
};

export default Component;
