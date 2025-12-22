#!/bin/bash
mkdir -p public/models
cd public/models

BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

# Helper function to download
download() {
    echo "Downloading $1..."
    curl -O "$BASE_URL/$1"
}

# Tiny Face Detector
download "tiny_face_detector_model-weights_manifest.json"
download "tiny_face_detector_model-shard1"

# Face Landmark 68
download "face_landmark_68_model-weights_manifest.json"
download "face_landmark_68_model-shard1"

# Face Recognition
download "face_recognition_model-weights_manifest.json"
download "face_recognition_model-shard1"
download "face_recognition_model-shard2"

echo "Download complete."
