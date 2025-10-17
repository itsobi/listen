import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Listen</h1>
      <p className="text-sm text-muted-foreground">
        Brought to you by{' '}
        <Link
          href="https://justobii.com"
          target="_blank"
          rel="noopener noreferrer"
          className="animate-pulse underline underline-offset-2"
        >
          justobii
        </Link>
      </p>
    </div>
  );
}
