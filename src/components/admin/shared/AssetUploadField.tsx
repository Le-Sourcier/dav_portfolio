import { useRef, useState, type ChangeEvent } from "react";
import { Image, Link2, Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { assetsApi, type AssetScope } from "@/services/api/assets.api";
import { cn } from "@/lib/utils";

type AssetUploadFieldProps = {
  value?: string;
  label: string;
  emptyLabel: string;
  scope: AssetScope;
  onChange: (url: string) => void;
  className?: string;
  variant?: "default" | "compact";
};

export function AssetUploadField({
  value,
  label,
  emptyLabel,
  scope,
  onChange,
  className,
  variant = "default",
}: AssetUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isCompact = variant === "compact";

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setUploading(true);
      const asset = await assetsApi.uploadImage(file, scope);
      onChange(asset.url);
      toast.success("Image optimisee et envoyee");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible d'envoyer l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = () => {
    const url = prompt(label, value || "");
    if (url !== null) onChange(url.trim());
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border/70 bg-card/60", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        <div className="group relative">
          <img src={value} alt="" className={cn("w-full object-cover", isCompact ? "h-28" : "h-48")} />
          <div className={cn(
            "absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100",
            isCompact && "gap-1.5",
          )}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg bg-white text-xs font-semibold text-zinc-950 disabled:opacity-60",
                isCompact ? "px-2" : "px-3",
              )}
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
              {!isCompact ? "Upload" : null}
            </button>
            <button
              type="button"
              onClick={handleUrlChange}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/90 text-xs font-semibold text-zinc-950",
                isCompact ? "px-2" : "px-3",
              )}
            >
              <Link2 className="h-3.5 w-3.5" />
              {!isCompact ? "URL" : null}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-500 text-xs font-semibold text-white",
                isCompact ? "px-2" : "px-3",
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {!isCompact ? "Retirer" : null}
            </button>
          </div>
        </div>
      ) : (
        <div className={cn(
          "flex flex-col items-center justify-center gap-3 p-4 text-center",
          isCompact ? "h-28" : "h-36",
        )}>
          <Image className={cn("text-zinc-400", isCompact ? "h-5 w-5" : "h-6 w-6")} />
          <div>
            <p className="text-[12px] font-semibold text-foreground">{emptyLabel}</p>
            {!isCompact ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                URL externe ou upload WebP optimise.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-amber-300/35 bg-amber-300/15 px-3 text-[11px] font-semibold text-amber-200 transition-colors hover:bg-amber-300/25 disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
              Upload
            </button>
            <button
              type="button"
              onClick={handleUrlChange}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/70 px-3 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <Link2 className="h-3.5 w-3.5" />
              URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetUploadField;
