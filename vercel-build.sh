#!/bin/bash

# bash file for vercel to skip deploy which do not have pkg folder

echo "VERCEL_ENV: $VERCEL_ENV"

# only build for commit with pkg folder
if [[ -d pkg ]] ; then
  # Proceed with the build
  echo "✅ - Build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi
