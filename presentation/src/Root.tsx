import { Composition } from 'remotion';
import { Keynote, KEYNOTE_FRAMES } from './Keynote';

export const Root = () => (
  <>
    <Composition id="Keynote" component={Keynote} durationInFrames={KEYNOTE_FRAMES} fps={30} width={1920} height={1080} />
    {/* та же презентация для сторис и Reels */}
    <Composition id="KeynoteVertical" component={Keynote} durationInFrames={KEYNOTE_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
