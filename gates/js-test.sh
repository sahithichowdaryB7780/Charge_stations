#!/bin/bash
set -e


npx nyc --reporter=html --reporter=text npm run test
npx nyc check-coverage --functions 90
npx nyc check-coverage --branches 70
npx nyc check-coverage --lines 90

npx stryker run --mutate ./*.js,\!.eslintrc.js,\!stryker.conf.js
