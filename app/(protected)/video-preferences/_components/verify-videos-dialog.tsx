'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/convex/_generated/api';
import { YoutubeChannel } from '@/lib/queries/youtube/youtube-types';
import { useVideoPreferencesStore } from '@/lib/store';
import { cn, generateRandomColor } from '@/lib/utils';
import { useMutation, useQuery } from 'convex/react';
import { Check, Loader, TvMinimalPlay } from 'lucide-react';
import { Dispatch, SetStateAction, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface Props {
  showDialog: boolean;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
  providers: string[];
  setIsLoadingFormState: Dispatch<SetStateAction<boolean>>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VerifyVideosDialog({
  showDialog,
  setShowDialog,
  providers,
  setIsLoadingFormState, // loading state for save button
  onSuccess,
  onCancel,
}: Props) {
  const { channels, setChannels } = useVideoPreferencesStore();
  const [selectedChannel, setSelectedChannel] = useState<YoutubeChannel | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const videoPreferences = useQuery(api.videoPreferences.getVideoPreferences);
  const createVideoPreference = useMutation(
    api.videoPreferences.createVideoPreference
  );
  const updateVideoPreferences = useMutation(
    api.videoPreferences.updateVideoPreferences
  );

  const handleSave = () => {
    if (!selectedChannel) {
      toast.error('A channel must be selected to save.');
      return;
    }
    const formattedChannels = [
      {
        channelId: selectedChannel.snippet.channelId,
        name: selectedChannel.snippet.title,
        creatorName: selectedChannel.snippet.title,
        image: selectedChannel.snippet.thumbnails?.high?.url,
        color: generateRandomColor(),
      },
    ];
    startTransition(async () => {
      let result;
      try {
        if (!videoPreferences) {
          result = await createVideoPreference({
            providers,
            channels: formattedChannels,
          });
        } else {
          result = await updateVideoPreferences({
            videoPreferenceId: videoPreferences._id,
            providers,
            channels: formattedChannels,
          });
        }

        if (result.success) {
          toast.success(result.message);
          setShowDialog(false);
          onSuccess();
          setChannels([]);
        } else {
          toast.error(result.message || 'Failed to save video preferences');
        }
      } catch (error) {
        console.error('Error saving video preferences:', error);
        toast.error(result?.message || 'Failed to save video preferences');
      } finally {
        setSelectedChannel(null);
        setChannels([]);
        setIsLoadingFormState(false);
      }
    });
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verify Channels</AlertDialogTitle>
          <AlertDialogDescription>
            Please select the video channel you would like to track.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
          {channels.map((channel, index) => (
            <button
              key={`${channel.snippet.title}-${index}`}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border relative cursor-pointer hover:bg-accent transition-colors',
                selectedChannel?.snippet.channelId === channel.snippet.channelId
                  ? 'bg-accent'
                  : 'bg-background'
              )}
              onClick={() => setSelectedChannel(channel)}
            >
              {selectedChannel?.snippet.channelId ===
              channel.snippet.channelId ? (
                <Check className="size-4 absolute top-2 right-2" />
              ) : (
                <div className="bg-primary/10 size-4 absolute top-2 right-2 rounded-full" />
              )}
              {channel.snippet.thumbnails?.high?.url ? (
                <img
                  src={channel.snippet.thumbnails?.high?.url}
                  alt={channel.snippet.title}
                  className="size-12 rounded-lg object-cover"
                />
              ) : (
                <TvMinimalPlay className="size-12 rounded-lg object-cover" />
              )}
              <div>
                <p className="font-semibold">
                  {index + 1}. {channel.snippet.channelTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  {channel.snippet.channelTitle}
                </p>
              </div>
            </button>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setSelectedChannel(null);
              onCancel();
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSave}
            disabled={isPending || !selectedChannel}
          >
            {isPending ? <Loader className="size-4 animate-spin" /> : 'Save'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
