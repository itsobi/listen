import { Loader } from 'lucide-react';

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="flex flex-col gap-2 justify-center items-center pt-20 w-full">
      <Loader className="size-4 animate-spin" />
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
