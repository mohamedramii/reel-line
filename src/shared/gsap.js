import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { isMotionReduced } from './motion.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);
gsap.defaults({ ease: 'power3.out', duration: 0.9 });

export const prefersReducedMotion = isMotionReduced;
export { gsap, ScrollTrigger, useGSAP };
