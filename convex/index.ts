import { WorkflowManager } from '@convex-dev/workflow';
import { components, internal } from './_generated/api';
import { v } from 'convex/values';
import { NOTIFICATION_TYPES } from '@/components/sidebar/notifications';

export const workflow = new WorkflowManager(components.workflow);

export const listenAgentWorkflow = workflow.define({
  args: {
    userId: v.string(),
    trackId: v.number(),
    audioUrl: v.string(),
    episodeTitle: v.string(),
    episodeImageUrl: v.optional(v.string()),
    releaseDate: v.string(),
    status: v.string(),
  },
  returns: v.string(),
  handler: async (step, args): Promise<string> => {
    if (!args.trackId || !args.audioUrl) {
      return 'Must have a Track ID and Audio Url';
    }

    // Step 1: Update status to "in-progress"
    await step.runMutation(internal.workflowTools.updateAgentStatus, {
      userId: args.userId,
      trackId: args.trackId,
      episodeTitle: args.episodeTitle,
      episodeImageUrl: args.episodeImageUrl,
      releaseDate: args.releaseDate,
      status: 'in-progress',
    });

    // Step 2: Transcribe the audio
    const storageId = await step.runAction(
      internal.workflowTools.transcribeAudio,
      {
        audioUrl: args.audioUrl,
        trackId: args.trackId,
      }
    );

    // Step 3: Create the transcript record
    await step.runMutation(internal.workflowTools.createAgentTranscript, {
      trackId: args.trackId,
      storageId: storageId,
    });

    // Step 4: Update the episode with completed status
    await step.runMutation(internal.workflowTools.updateAgentTranscript, {
      userId: args.userId,
      trackId: args.trackId,
      status: 'completed',
    });

    // Step 5: Send notification to user
    await step.runMutation(internal.notifications.createNotification, {
      userId: args.userId,
      trackId: args.trackId,
      type: NOTIFICATION_TYPES.LISTEN_AGENT,
      read: false,
      episodeTitle: args.episodeTitle,
    });

    return `Transcription completed for track ${args.trackId}`;
  },
});
