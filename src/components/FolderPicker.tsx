import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FolderPickerProps = {
  folderPath: string;
  onFolderPathChange: (value: string) => void;
  onPickFolder: () => void;
};

export function FolderPicker({
  folderPath,
  onFolderPathChange,
  onPickFolder
}: FolderPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="folderPath">Folder</Label>
      <div className="flex gap-2">
        <Input
          id="folderPath"
          value={folderPath}
          onChange={(event) => onFolderPathChange(event.target.value)}
          placeholder="C:\Users\DELL\Documents\Projects"
        />
        <Button type="button" variant="secondary" onClick={onPickFolder} title="Choose folder">
          <FolderOpen className="h-4 w-4" />
          Browse
        </Button>
      </div>
    </div>
  );
}
