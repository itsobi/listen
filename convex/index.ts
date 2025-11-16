import { WorkflowManager } from '@convex-dev/workflow';
import { api, components, internal } from './_generated/api';
import { v } from 'convex/values';
import { NOTIFICATION_TYPES } from '@/components/sidebar/notifications';
import { AgentStatus } from '@/lib/helpers';
import { Id } from './_generated/dataModel';

export const workflow = new WorkflowManager(components.workflow);

export const listenAgentWorkflow = workflow.define({
  args: {
    userId: v.string(),
    trackId: v.number(),
    audioUrl: v.string(),
    episodeTitle: v.string(),
    episodeDescription: v.string(),
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
    await step.runMutation(internal.workflowTools.initializeAgentForUser, {
      userId: args.userId,
      trackId: args.trackId,
      episodeTitle: args.episodeTitle,
      episodeDescription: args.episodeDescription,
      episodeImageUrl: args.episodeImageUrl,
      releaseDate: args.releaseDate,
    });

    const transcriptExists = await step.runQuery(
      internal.workflowTools.checkIfTranscriptExists,
      {
        trackId: args.trackId,
      }
    );

    // Step 2: Check if transcript exists, if not transcribe audio
    let storageId: Id<'_storage'> | null | undefined;

    if (transcriptExists) {
      storageId = transcriptExists;
    } else {
      storageId = await step.runAction(
        internal.workflowTools.transcribeAudioInternalAction,
        {
          userId: args.userId,
          audioUrl: args.audioUrl,
          trackId: args.trackId,
        }
      );
    }

    if (!storageId) {
      await step.runMutation(internal.workflowTools.updateAgentStatus, {
        userId: args.userId,
        trackId: args.trackId,
        status: AgentStatus.FAILED,
        errorMessage: 'Unable to transcribe audio',
      });
      throw new Error('Unable to transcribe audio');
    }

    // Step 3: Create the transcript record
    await step.runMutation(internal.workflowTools.createAgentTranscript, {
      trackId: args.trackId,
      storageId: storageId as Id<'_storage'>,
      userId: args.userId,
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
