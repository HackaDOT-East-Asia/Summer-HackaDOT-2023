#!/bin/bash

raspistill -t 1 -n -w 1000 -h 1000 -rot 180 -o ./photo.jpg

killall matchbox-keyboard
