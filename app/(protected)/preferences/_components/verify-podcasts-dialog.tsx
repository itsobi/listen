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
import { usePreferencesStore } from '@/lib/store';
import { useMutation, useQuery } from 'convex/react';
import { Loader } from 'lucide-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  showDialog: boolean;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
  providers: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function VerifyPodcastDialog({
  showDialog,
  setShowDialog,
  providers,
  onSuccess,
  onCancel,
}: Props) {
  const [isPending, setIsPending] = useState(false);
  const { podcasts, setPodcasts } = usePreferencesStore();
  const preferences = useQuery(api.preferences.getPreferences);
  const createPreference = useMutation(api.preferences.createPreference);
  const updatePreferences = useMutation(api.preferences.updatePreferences);

  const handleSave = async () => {
    setIsPending(true);
    try {
      // Check if preferences exist to determine create vs update
      if (preferences) {
        // Update existing preferences
        const result = await updatePreferences({
          preferenceId: preferences._id,
          providers,
          podcasts,
        });

        if (result.success) {
          toast.success(result.message);
          setShowDialog(false);
          // Clear the store after successful save
          onSuccess();
          setPodcasts([]);
        } else {
          toast.error(result.message || 'Failed to update preferences');
          setIsPending(false);
          return;
        }
      } else {
        // Create new preferences
        const result = await createPreference({
          providers,
          podcasts,
        });

        if (result.success) {
          toast.success(result.message);
          setShowDialog(false);
          onSuccess();
          // Clear the store after successful save
          setPodcasts([]);
        } else {
          toast.error(result.message || 'Failed to create preferences');
          setIsPending(false);
          return;
        }
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verify Podcasts</AlertDialogTitle>
          <AlertDialogDescription>
            Please verify the podcasts you would like to track.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
          {podcasts.map((podcast, index) => (
            <div
              key={`${podcast.name}-${index}`}
              className="flex items-center gap-3 p-3 rounded-lg border"
            >
              {podcast.image && (
                <img
                  src={podcast.image}
                  alt={podcast.name}
                  className="size-12 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-semibold">
                  {index + 1}. {podcast.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {podcast.artistName}
                </p>
              </div>
            </div>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader className="size-4 animate-spin" /> : 'Save'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
