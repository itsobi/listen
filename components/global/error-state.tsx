'use client';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

interface Props {
  heading: string;
  description?: string;
  linkText?: string;
  linkHref?: string;
  goBack?: boolean;
}

export function ErrorState({
  heading,
  description,
  linkText,
  linkHref,
  goBack,
}: Props) {
  const router = useRouter();
  return (
    <Empty className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
      <EmptyHeader>
        <EmptyTitle>{heading}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          {goBack ? (
            <Button onClick={() => router.back()}>Go Back</Button>
          ) : (
            <Link href={linkHref || '/'}>{linkText || 'Go back home'}</Link>
          )}
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
