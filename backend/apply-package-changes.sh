#!/usr/bin/env bash
# Run from inside backend/ (next to your real package.json):  bash apply-package-changes.sh
set -euo pipefail

# --- 1. Scripts -------------------------------------------------------------
npm pkg set scripts.start="node server.js"
npm pkg set scripts.dev="nodemon server.js"
npm pkg set scripts.test="jest --forceExit --detectOpenHandles"
npm pkg set scripts.test:coverage="jest --coverage --forceExit --detectOpenHandles"

# --- 2. Remove unused dependencies -----------------------------------------
# None of these are required anywhere in src/ (bcryptjs and zod stay).
npm uninstall bcrypt http https @imagekit/javascript json-to-schema zod-to-json-schema zod-to-schema

# NOT removed on purpose: @google/genai and @imagekit/nodejs are still require()d by
#   src/services/ai.service.js, src/services/storage.service.js and
#   src/middlewares/blogUpload.middleware.js (loaded by app.js via the routes),
#   so removing them makes the server crash on startup.
# If you really do want them gone, remove those three files' usages first, then run:
#   npm uninstall @google/genai @imagekit/nodejs

# --- 3. Test tooling -------------------------------------------------------
npm install --save-dev jest supertest mongodb-memory-server @types/jest
