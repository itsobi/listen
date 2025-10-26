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
  IconBrandYoutubeFilled,
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
import { getPodcastNames } from '@/lib/get-podcast-names';
import { VerifyPodcastDialog } from './verify-podcasts-dialog';
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LoadingScreen } from '@/components/global/loading-screen';
import { Podcast, usePreferencesStore } from '@/lib/store';
import { Id } from '@/convex/_generated/dataModel';

const providers = [
  {
    label: 'Apple',
    value: 'apple',
    icon: <IconBrandAppleFilled className="size-4" />,
  },
  {
    label: 'Spotify',
    value: 'spotify',
    icon: <IconBrandSpotifyFilled className="size-4" />,
  },
  {
    label: 'Youtube',
    value: 'youtube',
    icon: <IconBrandYoutubeFilled className="size-4" />,
  },
];

const formSchema = z.object({
  providers: z.array(z.string()).min(1, 'Please select at least one provider'),
  podcasts: z.array(z.string()).min(1, 'Please add at least one podcast'),
});

type FormValues = z.infer<typeof formSchema>;

export function PreferencesForm() {
  const preferences = useQuery(api.preferences.getPreferences);
  const [currentPodcast, setCurrentPodcast] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { podcasts, setPodcasts } = usePreferencesStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'all', // Validate on blur, change, and submit
    defaultValues: {
      providers: preferences?.providers || [],
      podcasts: preferences?.podcasts.map((podcast) => podcast.name) || [],
    },
    shouldFocusError: false,
  });

  const updatePreferences = useMutation(api.preferences.updatePreferences);

  useEffect(() => {
    if (preferences && preferences.podcasts.length > 0) {
      const podcastNames = preferences.podcasts.map((podcast) => podcast.name);
      form.reset({
        providers: preferences.providers,
        podcasts: podcastNames,
      });
    }
  }, [preferences, form]);

  const addPodcast = (fieldOnChange: (value: string[]) => void) => {
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
      fieldOnChange(updatedPodcasts);
      setCurrentPodcast('');
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    fieldOnChange: (value: string[]) => void
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPodcast(fieldOnChange);
    }
  };

  const removePodcast = (
    podcast: string,
    fieldOnChange: (value: string[]) => void
  ) => {
    const currentPodcasts = form.getValues('podcasts') || [];
    if (currentPodcasts.includes(podcast)) {
      const updatedPodcasts = currentPodcasts.filter((p) => p !== podcast);
      fieldOnChange(updatedPodcasts);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const originalPodcastNames =
        preferences?.podcasts.map((p) => p.name) || [];
      const podcastsChanged =
        JSON.stringify(data.podcasts.sort()) !==
        JSON.stringify(originalPodcastNames.sort());

      if (podcastsChanged) {
        // Verify podcasts before showing confirmation dialog
        await toast.promise(
          (async () => {
            const verifiedPodcasts = await getPodcastNames(data.podcasts);

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
                artistName: podcast.artistName,
                image: podcast.image ?? undefined,
              }));

            if (validPodcasts.length === 0) {
              throw new Error(
                'No valid podcasts found. Please check your podcast names.'
              );
            }

            // Store verified podcasts and show dialog for confirmation
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

      // Podcasts haven't changed — just update providers
      const result = await updatePreferences({
        preferenceId: preferences?._id as Id<'preferences'>,
        providers: data.providers,
      });

      if (result.success) {
        toast.success(result.message);
        form.reset({
          providers: data.providers,
          podcasts: data.podcasts,
        });
      } else {
        toast.error(result.message || 'Failed to update preferences');
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      setIsLoading(false);
    }
  };

  const handleDialogSuccess = () => {
    // Reset form to mark it as not dirty and clear any validation errors
    setIsLoading(false);
    form.reset({
      providers: form.getValues('providers'),
      podcasts: form.getValues('podcasts'),
    });
    setShowDialog(false);
  };

  const handleDialogCancel = () => {
    setShowDialog(false);
    setIsLoading(false);
    setPodcasts([]);
  };

  if (preferences === undefined) return <LoadingScreen message="Loading..." />;

  return (
    <>
      <form id="preferences-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            <div className="min-w-[250px]">
              <FieldLabel htmlFor="provider" className="text-lg">
                Provider
              </FieldLabel>
              <FieldDescription>
                Select the provider(s) you would like to use for your podcasts.
              </FieldDescription>
            </div>
            <Controller
              name="providers"
              control={form.control}
              render={({ field, fieldState }) => (
                <>
                  {providers.map((provider) => (
                    <Field key={provider.value}>
                      <Label
                        key={provider.value}
                        className="flex flex-col hover:bg-accent/50 gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/10 lg:max-w-[250px] cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span>{provider.icon}</span>
                          <Checkbox
                            id={provider.value}
                            name={field.name}
                            checked={
                              field.value?.includes(provider.value)
                                ? true
                                : false
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([
                                  ...(field.value || []),
                                  provider.value,
                                ]);
                              } else {
                                field.onChange(
                                  field.value?.filter(
                                    (value) => value !== provider.value
                                  )
                                );
                              }
                            }}
                            className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white "
                          />
                        </div>
                        <span>{provider.label}</span>
                      </Label>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  ))}
                </>
              )}
            />
          </div>
          <FieldSeparator />

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
                        onKeyDown={(e) => handleKeyDown(e, field.onChange)}
                        className={
                          fieldState.invalid ? 'border-destructive' : ''
                        }
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="ghost"
                          onClick={() => addPodcast(field.onChange)}
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
                              onClick={() =>
                                removePodcast(podcast, field.onChange)
                              }
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
              !form.formState.isValid || !form.formState.isDirty || isLoading
            }
          >
            {isLoading ? <Loader className="size-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </form>
      <VerifyPodcastDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        providers={form.watch('providers')}
        onSuccess={handleDialogSuccess}
        onCancel={handleDialogCancel}
      />
    </>
  );
}
