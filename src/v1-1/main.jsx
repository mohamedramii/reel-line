import { createRoot } from 'react-dom/client';
import { applyMotionClass, setMotionDefault } from '@shared/motion.jsx';
import { applyLang } from '@shared/i18n.jsx';
import { codecReady } from '@shared/video.js';
import '@shared/base.css';
import './styles.css';
import './extra.css';
import App from './App.jsx';

// Motion is always on here, on every device: the agency's owner asked for it. Nothing stored earlier and no system
// setting switches it off; only the address of a visit (?motion=reduced) can ask for the reduced page.
setMotionDefault('full', { lock: true });
applyMotionClass();
applyLang();

// which video format this device plays well is known before anything is drawn (it takes a few milliseconds), so the
// loading screen fetches the very files the page will play
await codecReady;

createRoot(document.getElementById('root')).render(<App />);
