import { Avatar } from "@base-ui/react/avatar";
import { cn } from "@/lib/cn";
import { initialOf } from "@/lib/format";

// الصورة الافتراضية هي أول حرف من اسم المستخدم
export function UserAvatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  return (
    <Avatar.Root
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 align-middle font-bold text-brand-700 select-none",
        className,
      )}
    >
      {src && <Avatar.Image src={src} alt={name} className="size-full object-cover" />}
      <Avatar.Fallback className="flex size-full items-center justify-center">{initialOf(name)}</Avatar.Fallback>
    </Avatar.Root>
  );
}
