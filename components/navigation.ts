import { LayoutDashboard, TrendingUp, Layers, Database, Orbit, Hexagon, Sigma } from "lucide-react";

export const navItems = [
  {
    title: "Explorer",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Algorithm overview",
    color: "text-primary",
  },
  {
    title: "Linear Regression",
    href: "/dashboard/regression",
    icon: TrendingUp,
    description: "Gradient descent",
    color: "text-chart-1",
  },
  {
    title: "Clustering & Trees",
    href: "/dashboard/clustering",
    icon: Layers,
    description: "K-Means & Decision Tree",
    color: "text-chart-2",
  },
  {
    title: "Datasets",
    href: "/dashboard/datasets",
    icon: Database,
    description: "Data & insights",
    color: "text-chart-3",
  },
  {
    title: "PCA",
    href: "/dashboard/pca",
    icon: Sigma,
    description: "Dimensionality reduction",
    color: "text-chart-1",
  },
  {
    title: "DBSCAN",
    href: "/dashboard/dbscan",
    icon: Hexagon,
    description: "Density clustering",
    color: "text-chart-2",
  },
  {
    title: "GMM",
    href: "/dashboard/gmm",
    icon: Orbit,
    description: "Probabilistic clusters",
    color: "text-chart-4",
  },
];
