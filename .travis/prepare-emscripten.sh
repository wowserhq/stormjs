set -e

echo 'Downloading emsdk'

wget https://s3.amazonaws.com/mozilla-games/emscripten/releases/emsdk-portable.tar.gz -P ~/
tar -xvf ~/emsdk-portable.tar.gz -C ~/

echo 'Installing and activating emscripten'

source ~/emsdk-portable/emsdk_env.sh
emsdk update
emsdk install clang-e1.37.25-64bit emscripten-1.37.25
emsdk activate clang-e1.37.25-64bit emscripten-1.37.25

source ~/emsdk-portable/emsdk_env.sh
emcc --version

set +e
