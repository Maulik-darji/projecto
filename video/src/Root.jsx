import { Composition } from 'remotion'
import { Projecto } from './Video'
import timeline from './timeline.json'

export function Root() {
  return (
    <Composition
      id="Projecto"
      component={Projecto}
      durationInFrames={timeline.total}
      fps={timeline.fps}
      width={1920}
      height={1080}
    />
  )
}
