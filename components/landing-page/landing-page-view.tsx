'use client';

import { Navbar } from '@/components/landing-page/navbar';
import { Button } from '@/components/ui/button';
import { CustomVideoPlayer } from '@/components/landing-page/custom-video-player';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Spotlight } from '../ui/spotlight-new';

const text = 'Welcome to';

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
    },
  }),
};

export function AnimatedHeader() {
  return (
    <h1 className="text-4xl lg:text-6xl font-semibold tracking-tighter flex flex-wrap">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
      &nbsp;
      <motion.span
        className="italic font-thin tracking-wide text-primary animate-pulse"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: text.length * 0.05 + 0.3 }}
      >
        Listen
      </motion.span>
    </h1>
  );
}

export function LandingPageView() {
  return (
    <div>
      <Spotlight />
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto px-4 mt-20">
          <AnimatedHeader />
          <p className="text-muted-foreground text-sm lg:text-lg text-center mt-4">
            Your favorite podcasts, episode breakdowns, personalized insights, &
            more. All in one place.
          </p>

          <Link href="/sign-up">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.1 }}
              className="font-semibold py-2 px-4 rounded-md shadow-sm bg-primary text-primary-foreground mt-6 cursor-pointer"
            >
              Get Started
            </motion.button>
          </Link>

          <CustomVideoPlayer
            src="https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/high.mp4"
            className="my-10 z-999"
          />
        </div>
      </motion.div>

      <footer className="mt-auto flex items-center justify-center py-8">
        <Link
          href="https://www.justobii.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground text-sm underline underline-offset-2 hover:text-primary"
        >
          justobii.com
        </Link>
      </footer>
    </div>
  );
}
