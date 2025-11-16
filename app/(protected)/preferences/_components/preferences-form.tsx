'use client';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  IconBrandAppleFilled,
  IconBrandSpotifyFilled,
} from '@tabler/icons-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Loader, SendHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getPodcastNames } from '@/lib/queries/get-podcast-names';
import { VerifyPodcastsDialog } from './verify-podcasts-dialog';
import { cn } from '@/lib/utils';
import { generateRandomColor } from '@/lib/helpers';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LoadingScreen } from '@/components/global/loading-screen';
import { Podcast, usePreferencesStore } from '@/lib/store';
import { Id } from '@/convex/_generated/dataModel';
import { checkProPlanStatus } from '@/lib/actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  podcasts: z.array(z.string()).min(1, 'Please add at least one podcast'),
});

type FormValues = z.infer<typeof formSchema>;

export function PreferencesForm() {
  const preferences = useQuery(api.preferences.getPreferences);
  const [currentPodcast, setCurrentPodcast] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [isLoadingFormState, setIsLoadingFormState] = useState(false);
  const { setPodcasts } = usePreferencesStore();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      podcasts: preferences?.podcasts.map((podcast) => podcast.name) || [],
    },
    shouldFocusError: false,
  });

  const updatePreferences = useMutation(api.preferences.updatePreferences);

  useEffect(() => {
    if (preferences && preferences.podcasts.length > 0) {
      form.reset({
        podcasts: preferences.podcasts.map((podcast) => podcast.name),
      });
    }
    form.trigger();
  }, [preferences, form]);

  const addPodcast = () => {
    const currentPodcasts = form.getValues('podcasts') || [];
    if (currentPodcasts.length >= 5) {
      toast.error('You can only add up to 5 podcasts.');
      return;
    }
    if (
      currentPodcast.trim() &&
      !currentPodcasts.includes(currentPodcast.trim())
    ) {
      const updatedPodcasts = [...currentPodcasts, currentPodcast.trim()];
      form.setValue('podcasts', updatedPodcasts, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setCurrentPodcast('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPodcast();
    }
  };

  const removePodcast = (podcast: string) => {
    const currentPodcasts = form.getValues('podcasts') || [];
    if (currentPodcasts.includes(podcast)) {
      const updatedPodcasts = currentPodcasts.filter((p) => p !== podcast);
      form.setValue('podcasts', updatedPodcasts, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoadingFormState(true);
    try {
      const isOnProPlan = await checkProPlanStatus();

      if (!isOnProPlan && (preferences?.podcasts?.length || 0) >= 2) {
        toast.error(
          'Sorry, you must be on the Pro plan to track more podcasts.'
        );
        setIsLoadingFormState(false);
        router.push('/pricing');
        return;
      }

      const originalPodcastNames =
        preferences?.podcasts.map((p) => p.name) || [];
      const podcastsChanged =
        JSON.stringify(data.podcasts.sort()) !==
        JSON.stringify(originalPodcastNames.sort());

      if (podcastsChanged) {
        // Only verify NEW podcasts (not already in preferences)
        const newPodcastNames = data.podcasts.filter(
          (name) => !originalPodcastNames.includes(name)
        );

        // If there are no new podcasts, just handle removals
        if (newPodcastNames.length === 0) {
          const existingPodcasts =
            preferences?.podcasts.filter((p) =>
              data.podcasts.includes(p.name)
            ) || [];

          const result = await updatePreferences({
            preferenceId: preferences?._id as Id<'preferences'>,
            podcasts: existingPodcasts,
          });

          if (result.success) {
            toast.success(result.message);
            form.reset({
              podcasts: data.podcasts,
            });
          } else {
            toast.error(result.message || 'Failed to update preferences');
          }

          setIsLoadingFormState(false);
          return;
        }

        // Verify only new podcasts before showing confirmation dialog
        await toast.promise(
          (async () => {
            const verifiedPodcasts = await getPodcastNames(newPodcastNames);

            if (!verifiedPodcasts.success || !verifiedPodcasts.data) {
              throw new Error(
                verifiedPodcasts.error || 'Failed to verify podcasts'
              );
            }

            const validPodcasts = verifiedPodcasts.data
              .filter((item) => item.success && item.data)
              .map((item) => item.data![0])
              .map((podcast) => ({
                name: podcast.name,
                creatorName: podcast.artistName,
                image: podcast.image ?? undefined,
                color: generateRandomColor(),
              }));

            if (validPodcasts.length === 0) {
              throw new Error(
                'No valid podcasts found. Please check your podcast names.'
              );
            }

            // Store only NEW verified podcasts and show dialog for confirmation
            setPodcasts(validPodcasts as Podcast[]);
            setShowDialog(true);

            return 'Podcasts verified successfully';
          })(),
          {
            loading: 'Verifying podcasts...',
            success: (msg) => msg,
            error: (err) =>
              err.message || 'Something went wrong verifying podcasts',
          }
        );

        // wait for dialog confirm/cancel
        return;
      }

      setIsLoadingFormState(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      setIsLoadingFormState(false);
    }
  };

  const handleDialogSuccess = () => {
    // Reset form to mark it as not dirty and clear any validation errors
    setIsLoadingFormState(false);
    form.reset({
      podcasts: form.getValues('podcasts'),
    });
    setShowDialog(false);
  };

  const handleDialogCancel = () => {
    setShowDialog(false);
    setIsLoadingFormState(false);
    setPodcasts([]);
  };

  if (preferences === undefined) return <LoadingScreen message="Loading..." />;

  return (
    <>
      <form id="preferences-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="podcasts"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8"
              >
                <div className="min-w-[250px]">
                  <FieldLabel className="text-lg">Podcasts</FieldLabel>
                  <FieldDescription>
                    Enter the name of the podcast(s) you would like to track.
                    You can add up to 5 podcasts.
                  </FieldDescription>
                </div>

                <div className="flex justify-start">
                  <div className="flex flex-col gap-4 w-full">
                    <InputGroup className="w-full">
                      <InputGroupInput
                        aria-invalid={fieldState.invalid}
                        placeholder="The Obi One Podcast"
                        value={currentPodcast}
                        onChange={(e) => setCurrentPodcast(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={
                          fieldState.invalid ? 'border-destructive' : ''
                        }
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="ghost"
                          onClick={addPodcast}
                          disabled={!currentPodcast.trim()}
                        >
                          <SendHorizontal
                            className={cn(
                              currentPodcast.length > 0 && 'animate-pulse'
                            )}
                          />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                    {field.value && field.value.length > 0 ? (
                      <div className="flex flex-wrap gap-2 p-4 rounded-lg border min-h-[60px] shadow-sm max-w-xl">
                        {field.value.map((podcast, index) => (
                          <Badge key={index}>
                            <span>{podcast}</span>
                            <button
                              type="button"
                              onClick={() => removePodcast(podcast)}
                              className="cursor-pointer text-destructive hover:text-destructive/40"
                            >
                              <X className="size-4" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Field>
            )}
          />
          <FieldSeparator />
        </FieldGroup>

        <div className="flex flex-col lg:flex-row gap-4 justify-end mt-4">
          <Button
            type="submit"
            className="w-full lg:w-auto"
            disabled={
              isLoadingFormState ||
              form.formState.isSubmitting ||
              !form.formState.isValid ||
              (preferences !== null && !form.formState.isDirty)
            }
          >
            {isLoadingFormState ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </form>

      <VerifyPodcastsDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        setIsLoadingFormState={setIsLoadingFormState} // pass loading state dispatch for "Save" button in form
        onSuccess={handleDialogSuccess}
        onCancel={handleDialogCancel}
      />
    </>
  );
}
