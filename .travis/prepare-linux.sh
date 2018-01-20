set -e

echo 'Obtaining newer libstdc++'

wget http://ppa.launchpad.net/ubuntu-toolchain-r/test/ubuntu/pool/main/g/gcc-5/libstdc++6_5.1.0-0ubuntu11~10.04.2_amd64.deb -P ~/
echo 91e20fab6550dbe12ba4287a2cabc737 ~/libstdc++6_5.1.0-0ubuntu11~10.04.2_amd64.deb | md5sum -c -
mkdir ~/libstdc++6_5.1.0-0ubuntu11~10.04.2_amd64/
dpkg -X ~/libstdc++6_5.1.0-0ubuntu11~10.04.2_amd64.deb ~/libstdc++6_5.1.0-0ubuntu11~10.04.2_amd64/

echo 'Activating newer libstdc++'

export LD_LIBRARY_PATH=~/libstdc++6_5.1.0-0ubuntu11~10.04.2_amd64/usr/lib:$LD_LIBRARY_PATH

set +e
