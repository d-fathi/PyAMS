#!/bin/bash
# Builds the PyAMS Linux AppImage and .deb.  Needs Node.js 18+.
cd "$(dirname "$0")" && npm install && npm run dist:linux
