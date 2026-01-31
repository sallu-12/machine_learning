"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Bell, User } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  showDatasetSelector?: boolean;
  dataset?: string;
  onDatasetChange?: (value: string) => void;
}

export function TopBar({
  title,
  subtitle,
  showDatasetSelector = false,
  dataset,
  onDatasetChange,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-lg">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showDatasetSelector && onDatasetChange && (
          <Select value={dataset} onValueChange={onDatasetChange}>
            <SelectTrigger className="w-40 bg-secondary border-border">
              <SelectValue placeholder="Dataset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="sparse">Sparse</SelectItem>
              <SelectItem value="dense">Dense</SelectItem>
              <SelectItem value="noisy">Noisy</SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
          <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
