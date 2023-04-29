import { AppRoot } from 'AppRoot';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createRoot } from 'react-dom/client';
import './index.css';

const start = async () => {
  // Render
  const root = createRoot(document.getElementById('root')!);
  root.render(<AppRoot />);
};

start();
