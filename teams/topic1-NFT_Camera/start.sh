#!/bin/bash

cd $HOME/erc721-minting-boilerplate-main/websocket_server/
python3 ws_server.py &

cd $HOME/test/erc721-minting-boilerplate-main/
yarn start &

cd $HOME
python3 shutdown.py &
