export function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-6xl space-y-1">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && (
        <p className="text-sm lg:text-base text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
