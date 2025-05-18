// Centralized paths for nootropic
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PATCH_DIR = path.join(__dirname, 'patches');
export const PLUGIN_REGISTRY_PATH = path.join(__dirname, 'pluginRegistry.json');
