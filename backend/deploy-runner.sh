#!/bin/sh

# Function to copy contents on shutdown
copy_contents() {
  echo "Copying contents from /srv/app/public/images to ./public/images"
  cp -r /srv/app/public/images/* ./public/images/
  echo "Contents copied successfully"
}

# Trap the SIGTERM signal and call the copy_contents function
trap 'copy_contents' SIGTERM

# Start your application
npm i
npm run dev
