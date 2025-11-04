import { auth } from '@clerk/nextjs/server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Creating API route because we need to call this from frontend
export async function GET(
  request: Request,
  { params }: { params: Promise<{ searchQuery: string }> }
) {
  try {
    // TODO: add rate limit here
    if (!YOUTUBE_API_KEY) {
      return Response.json(
        { success: false, message: 'API key is not valid.' },
        { status: 401 }
      );
    }
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { success: false, message: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { searchQuery } = await params;

    if (!searchQuery) {
      return Response.json(
        { success: false, message: 'Channel name is required.' },
        { status: 400 }
      );
    }

    const decodedChannelName = decodeURIComponent(searchQuery).replace(
      /\s+/g,
      ''
    );

    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${decodedChannelName}&type=channel&key=${YOUTUBE_API_KEY}`,
      {
        next: { revalidate: 60 * 60 }, // Revalidate every hour
      }
    );

    const data = await response.json();

    if (data.pageInfo.totalResults === 0) {
      return Response.json(
        { success: false, message: 'Channel not found.' },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: data.items,
        message: 'Channel verified successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to verify youtube channel.' },
      { status: 500 }
    );
  }
}
