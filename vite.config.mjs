import { defineConfig } from 'vite';
export default defineConfig({
    build: {
        lib: {
            entry: 'src/tracer_log.ts',
            name: 'TracerLog',
            fileName: 'tracer_log',
        },
    },
});