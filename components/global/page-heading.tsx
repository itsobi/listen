export function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-4xl space-y-1 mb-10">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 bg-primary rounded-full inline-block" />
        <h1 className="text-2xl font-semibold tracking-wide">{title}</h1>
      </div>
      {description && (
        <p className="text-base text-muted-foreground tracking-wide">
          {description}
        </p>
      )}
    </div>
  );
}
