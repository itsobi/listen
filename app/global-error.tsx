'use client';

import { IconAlertCircle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

// Error boundaries must be Client Components

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  console.error(error);
  return (
    <html>
      <body className="flex items-center justify-center h-screen">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconAlertCircle />
            </EmptyMedia>
            <EmptyTitle>App Error!</EmptyTitle>
            <EmptyDescription>
              {error instanceof Error ? error.message : 'Unknown error'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => window.location.reload()}>
              Refresh application
            </Button>
          </EmptyContent>
        </Empty>
      </body>
    </html>
  );
}
