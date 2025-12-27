"use client";

import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/shared/ui";
import { CreateProjectDialog } from "@/features/create-project";

export function FloatingActionBar() {
  // Simple scroll detection could be added here to hide on scroll down
  // For now, we keep it persistent

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden flex items-center gap-4 bg-background/80 backdrop-blur-lg border p-1.5 rounded-full shadow-premium-lg">
      <Button variant="ghost" size="icon" className="rounded-full">
        <FolderOpen className="w-5 h-5 text-muted-foreground" />
      </Button>

      <CreateProjectDialog>
        <Button size="icon" className="rounded-full h-12 w-12 shadow-sber">
          <Plus className="w-6 h-6" />
        </Button>
      </CreateProjectDialog>
    </div>
  );
}
