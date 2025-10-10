"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { usePhaseStore } from "@/store/phase";

export function EditPhaseModal({ open, onOpenChange, title, description, onSave, saving = false, phaseId }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; description: string; onSave: (next: string) => Promise<void> | void; saving?: boolean; phaseId: string }) {
  const [value, setValue] = React.useState(description);
  const { updatePhase } = usePhaseStore();
  React.useEffect(() => {
    setValue(description);
  }, [description]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-balance text-sm">Edit Phase: {title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={7} className="text-sm" placeholder="Update the phase description..." />
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                await onSave(value);
                updatePhase(phaseId, { description: value });
                toast({ title: "Phase Updated", description: "The phase description has been updated successfully.", duration: 5000 });
                onOpenChange(false);
              }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
