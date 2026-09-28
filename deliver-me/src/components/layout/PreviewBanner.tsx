export function PreviewBanner({ text }: { text: string }) {
  return (
    <div role="note" className="bg-sage-ink px-4 py-2 text-center text-sm font-semibold text-white">
      {text}
    </div>
  );
}
