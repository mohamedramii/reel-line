// Design 1.1: Design 1's wording, plus the wording of the two sections brought in from Design 2 (the line between
// real and reel, and the cut). Nothing new is claimed: the added lines come from those two designs' own copy.
import v1 from '../v1/copy.js';
import v2 from '../v2/copy.js';

const fromHero = ({ realGloss, reelGloss, cue, slider, valueText, stageLabel }) => ({ realGloss, reelGloss, cue, slider, valueText, stageLabel });

const copy = {
  ar: {
    ...v1.ar,
    line: {
      ...fromHero(v2.ar.hero),
      h2: 'بين الواقع والريل… خط.',
      sub: 'وده اسمنا. بنبدأ من مكانك زي ما هو، ونطلّع منه ريل. اسحب الخط وشوف.',
    },
    cut: v2.ar.cut,
    // the three new reels: the brand's name as it is written in the reel, and what the reel shows
    reels: {
      ghazala: { title: 'Ghazala', note: 'زيارة وتجربة الأكل' },
      near: { title: 'Near Cafe', note: 'جولة في المكان' },
      vega: { title: 'De La Vega', note: 'البرجر طبقة طبقة' },
    },
  },
  en: {
    ...v1.en,
    line: {
      ...fromHero(v2.en.hero),
      h2: 'Between real and reel, there is a line.',
      sub: 'That is our name. We start from your place as it is and turn it into a reel. Drag the line and see.',
    },
    cut: v2.en.cut,
    reels: {
      ghazala: { title: 'Ghazala', note: 'A visit and a tasting' },
      near: { title: 'Near Cafe', note: 'A tour of the place' },
      vega: { title: 'De La Vega', note: 'The burger, layer by layer' },
    },
  },
};

export default copy;
