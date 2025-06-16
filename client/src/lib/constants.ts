import { Wheat, Leaf, Circle, Droplet } from "lucide-react";

export const GRAIN_PRODUCTS = [
  {
    name: "Basmati Rice",
    icon: Wheat,
    colorClass: "bg-yellow-100",
    iconColorClass: "text-yellow-600",
  },
  {
    name: "Finger Millet",
    icon: Leaf,
    colorClass: "bg-green-100",
    iconColorClass: "text-green-600",
  },
  {
    name: "Red Lentils",
    icon: Circle,
    colorClass: "bg-red-100",
    iconColorClass: "text-red-600",
  },
  {
    name: "Sunflower Oil",
    icon: Droplet,
    colorClass: "bg-amber-100",
    iconColorClass: "text-amber-600",
  },
  {
    name: "Black Gram",
    icon: Circle,
    colorClass: "bg-purple-100",
    iconColorClass: "text-purple-600",
  },
];

export const COUNTRIES = [
  "United States",
  "United Kingdom", 
  "Germany",
  "Japan",
  "Canada",
  "Australia",
  "Netherlands",
  "France",
  "Italy",
  "Spain",
];

export const ESTIMATE_STATUSES = {
  DRAFT: "draft",
  COMPLETED: "completed", 
  ARCHIVED: "archived",
} as const;
