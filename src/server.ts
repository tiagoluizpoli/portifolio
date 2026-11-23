// Server entrypoint: boot the content store (migrations + valid content) before the adapter starts listening.
import './lib/content/instance';

export * from '@astrojs/node/server.js';
