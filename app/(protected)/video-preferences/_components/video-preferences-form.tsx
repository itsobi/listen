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
import { IconBrandAppleFilled } from '@tabler/icons-react';
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
import { cn } from '@/lib/utils';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LoadingScreen } from '@/components/global/loading-screen';
import { useVideoPreferencesStore } from '@/lib/store';
import { VerifyVideosDialog } from './verify-videos-dialog';

const providers = [
  {
    label: 'YouTube',
    value: 'youtube',
    icon: <IconBrandAppleFilled className="size-4" />,
  },
];

const formSchema = z.object({
  providers: z.array(z.string()).min(1, 'Please select at least one provider'),
  channels: z.array(z.string()).min(1, 'Please add at least one channel'),
});

type FormValues = z.infer<typeof formSchema>;

export function VideoPreferencesForm() {
  const videoPreferences = useQuery(api.videoPreferences.getVideoPreferences);
  const [currentChannel, setCurrentChannel] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [isLoadingFormState, setIsLoadingFormState] = useState(false);
  const { setChannels } = useVideoPreferencesStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      providers: videoPreferences?.providers || [],
      channels:
        videoPreferences?.channels.map((channels) => channels.name) || [],
    },
    shouldFocusError: false,
  });

  const updateVideoPreferences = useMutation(
    api.videoPreferences.updateVideoPreferences
  );

  useEffect(() => {
    if (videoPreferences && videoPreferences.channels.length > 0) {
      const channelNames = videoPreferences.channels.map(
        (channel) => channel.name
      );
      form.reset({
        providers: videoPreferences.providers,
        channels: channelNames,
      });
    }
    // Trigger validation when form initializes to get correct validation state
    if (videoPreferences !== undefined) {
      form.trigger();
    }
  }, [videoPreferences, form]);

  const addPodcast = () => {
    const currentChannels = form.getValues('channels') || [];
    if (currentChannels.length >= 1) {
      toast.error(
        'You are only allowed to add one channel on your current plan.'
      );
      return;
    }
    if (
      currentChannel.trim() &&
      !currentChannels.includes(currentChannel.trim())
    ) {
      const updatedChannels = [...currentChannels, currentChannel.trim()];
      form.setValue('channels', updatedChannels, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setCurrentChannel('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPodcast();
    }
  };

  const removeChannel = (channel: string) => {
    const currentChannels = form.getValues('channels') || [];
    if (currentChannels.includes(channel)) {
      const updatedChannels = currentChannels.filter((c) => c !== channel);
      form.setValue('channels', updatedChannels, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoadingFormState(true);

    // TODO: add rate lime here

    toast.promise(
      async () => {
        const response = await fetch(
          `/api/youtube/channels/${data.channels[0]}`
        );

        const result = await response.json();

        if (!result.success) {
          setShowDialog(false);
          setIsLoadingFormState(false);
          return result.message;
        }
        setChannels(result.data);
        setShowDialog(true);
        return result.message;
      },
      {
        loading: 'Verifying channels...',
        success: (message) => message,
        error: (message) => message,
      }
    );
  };

  const handleDialogSuccess = () => {
    // Reset form to mark it as not dirty and clear any validation errors
    setIsLoadingFormState(false);
    form.reset({
      providers: form.getValues('providers'),
      channels: form.getValues('channels'),
    });
    setShowDialog(false);
  };

  const handleDialogCancel = () => {
    setShowDialog(false);
    setIsLoadingFormState(false);
    setChannels([]);
  };

  if (videoPreferences === undefined)
    return <LoadingScreen message="Loading..." />;

  return (
    <>
      <form id="preferences-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col lg:flex-row  gap-4 lg:gap-8">
            <div>
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
                        className="lg:max-w-[400px] flex flex-col hover:bg-accent/50 gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/10 cursor-pointer"
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
                              const updatedProviders = checked
                                ? [...(field.value || []), provider.value]
                                : field.value?.filter(
                                    (value) => value !== provider.value
                                  ) || [];

                              form.setValue('providers', updatedProviders, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
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
            name="channels"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8"
              >
                <div className="min-w-[250px]">
                  <FieldLabel className="text-lg">Channels</FieldLabel>
                  <FieldDescription>
                    Enter the name of the channel you would like to track. You
                    are allowed to add only one channel on your current plan.
                  </FieldDescription>
                </div>

                <div className="flex justify-start">
                  <div className="flex flex-col gap-4 w-full">
                    <InputGroup className="w-full">
                      <InputGroupInput
                        aria-invalid={fieldState.invalid}
                        placeholder="The Obi One Podcast"
                        value={currentChannel}
                        onChange={(e) => setCurrentChannel(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={
                          fieldState.invalid ? 'border-destructive' : ''
                        }
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="ghost"
                          onClick={addPodcast}
                          disabled={!currentChannel.trim()}
                        >
                          <SendHorizontal
                            className={cn(
                              currentChannel.length > 0 && 'animate-pulse'
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
                        {field.value.map((channel, index) => (
                          <Badge key={index}>
                            <span>{channel}</span>
                            <button
                              type="button"
                              onClick={() => removeChannel(channel)}
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
              (videoPreferences !== null && !form.formState.isDirty)
            }
          >
            {isLoadingFormState || form.formState.isSubmitting ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </form>

      <VerifyVideosDialog
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        providers={form.watch('providers')}
        onSuccess={handleDialogSuccess}
        onCancel={handleDialogCancel}
        setIsLoadingFormState={setIsLoadingFormState}
      />
    </>
  );
}
