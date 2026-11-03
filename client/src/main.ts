import './app.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App.svelte';
import { mount } from 'svelte';
import { installFetchInterceptor, exposeAuthGlobals } from './lib/auth';

// Attach the bearer token to same-origin fetches made anywhere in the page,
// including <script> blocks embedded in notes (e.g. notes/tools/*.md).
installFetchInterceptor();
exposeAuthGlobals();

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
