#!/bin/bash

# Create the directory for files
mkdir -p new_dir/pks
mkdir -p new_dir/bin
mkdir -p new_dir/vk

# Download files to their specific directories
wget -O new_dir/pks/app.pk 'https://drive.google.com/uc?export=download&id=1E6fSS1-1pV2xPKMxFJ8-olxIDbWJKMSH'
wget -O new_dir/bin/app.bin 'https://drive.google.com/uc?export=download&id=1SLSXxoQ1PQPR3aE0sqSbU5ljmLfgfX2w'
wget -O new_dir/vk/app.vk 'https://drive.google.com/uc?export=download&id=1pxxQpF36RPt4HG4SyHnQai4rwZTPP356'

# move files
cp ./new_dir/bin/app.bin ~/zk-face-circuit/circuit/params/
cp ./new_dir/vk/app.vk ~/zk-face-circuit/circuit/contracts/
cp ./new_dir/pks/app.pk ~/zk-face-circuit/circuit/contracts/pks/