import { createRoot } from 'react-dom/client';
import { applyMotionClass, setMotionDefault } from '@shared/motion.jsx';
import { applyLang } from '@shared/i18n.jsx';
import '@shared/base.css';
import '../v1/styles.css';
import './extra.css';
import App from './App.jsx';

// Design 1.1 is Design 1 plus two sections: its styles are Design 1's own, then the two sections' (extra.css).
// Full motion on every device by default (the studio's standing wish); the visitor can reduce it in the footer or the menu.
setMotionDefault('full');
applyMotionClass();
applyLang();

createRoot(document.getElementById('root')).render(<App />);
