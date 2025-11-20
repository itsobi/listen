import { PageHeading } from '@/components/global/page-heading';
import { ListenAgentsView } from './_components/listen-agents-view';

export default function ListenAgentsPage() {
  return (
    <>
      <PageHeading title="Listen Agent" />
      <ListenAgentsView />
    </>
  );
}
