'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CustomSlider } from '@/components/landing-page/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';

interface CustomVideoPlayerProps {
  src: string;
  className?: string;
}

export function CustomVideoPlayer({ src, className }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.5);
  const [showControls, setShowControls] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      const time = (value / 100) * duration;
      videoRef.current.currentTime = time;
      setProgress(value);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      const volumeValue = value / 100;
      videoRef.current.volume = volumeValue;
      setVolume(volumeValue);
      setIsMuted(volumeValue === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const setSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  return (
    <div
      className={cn(
        'relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-[#11111198] shadow-[0_0_20px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-opacity duration-500',
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {!isVideoReady && (
        <div className="w-full aspect-video flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      <video
        ref={videoRef}
        className={cn('w-full', !isVideoReady && 'hidden')}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => {
          setIsVideoReady(true);
          if (videoRef.current) {
            videoRef.current.playbackRate = 1.5;
          }
        }}
        src={src}
        onClick={togglePlay}
      />

      <div
        className={cn(
          'absolute bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-xl p-4 bg-[#11111198] backdrop-blur-md rounded-2xl transition-all duration-600 ease-in-out',
          showControls
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-5 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white text-sm">{formatTime(currentTime)}</span>
          <CustomSlider
            value={progress}
            onChange={handleSeek}
            className="flex-1"
          />
          <span className="text-white text-sm">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="transition-transform hover:scale-110 active:scale-90">
              <Button
                onClick={togglePlay}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-[#111111d1] hover:text-white"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-x-1">
              <div className="transition-transform hover:scale-110 active:scale-90">
                <Button
                  onClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-[#111111d1] hover:text-white"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : volume > 0.5 ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <Volume1 className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="w-24">
                <CustomSlider
                  value={volume * 100}
                  onChange={handleVolumeChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[0.5, 1, 1.5, 2].map((speed) => (
              <div
                key={speed}
                className="transition-transform hover:scale-110 active:scale-90"
              >
                <Button
                  onClick={() => setSpeed(speed)}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'text-white hover:bg-[#111111d1] hover:text-white',
                    playbackSpeed === speed && 'bg-[#111111d1]'
                  )}
                >
                  {speed}x
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
