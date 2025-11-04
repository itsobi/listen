type YoutubeSnippet = {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails?: {
    default: {
      url: string;
    };
    medium: {
      url: string;
    };
    high: {
      url: string;
    };
  };
  channelTitle: string;
  liveBroadcastContent: string;
  publishTime: string;
};

export type YoutubeChannel = {
  kind: string;
  etag: string;
  id: {
    kind: string;
    channelId: string;
  };
  snippet: YoutubeSnippet;
};

export type YoutubeVideo = {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: YoutubeSnippet;
};
