export default async function ListenAgentChat({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;

  return <div>TrackId: {trackId}</div>;
}
