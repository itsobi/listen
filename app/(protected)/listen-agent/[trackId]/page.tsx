import { PageHeading } from '@/components/global/page-heading';
import { ChatView } from '../_components/chat-view';

export default async function ListenAgentChat({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;

  return (
    <>
      <PageHeading title="Chat" />

      <ChatView trackId={trackId} />
    </>
  );
}
