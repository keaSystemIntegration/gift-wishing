#!/bin/bash
SOURCE_DIR=/usr/src
LUA_VERSION=5.3.5

install_luaoauth_var=false
lua_installed=false
lua_dep_dir=/usr/local/share/lua/5.3/

cd $SOURCE_DIR

display_working() {
    pid=$1
    spin='-\|/'
    i=0
    while kill -0 $pid 2>/dev/null
    do
        i=$(( (i+1) %4 ))
        printf "\r${spin:$i:1}"
        sleep .1
    done
}

install_luaoauth_deps_debian() {
    printf "\r[+] Installing haproxy-lua-oauth dependencies\n"

    if [ ! -e $lua_dep_dir ]; then
        mkdir -p $lua_dep_dir;
    fi;

    apt-get update >/dev/null 2>&1
    apt-get install -y build-essential liblua5.3-dev libssl-dev unzip >/dev/null 2>&1

    cd $SOURCE_DIR

    curl -sLO https://github.com/rxi/json.lua/archive/refs/heads/master.zip
    unzip -qo master.zip && rm master.zip
    cp json.lua-master/json.lua $lua_dep_dir 

    curl -sLO https://github.com/lunarmodules/luasocket/archive/refs/heads/master.zip
    unzip -qo master.zip && rm master.zip
    cd luasocket-master/
    make clean all install-both LUAINC=/usr/include/lua5.3/ >/dev/null
    cd ..

    curl -sLO https://github.com/wahern/luaossl/archive/refs/heads/master.zip
    unzip -qo master.zip && rm master.zip
    cd luaossl-master/
    make install >/dev/null
    cd ..
}

install_luaoauth() {
    printf "\r[+] Installing haproxy-lua-oauth\n"
    if [ ! -e $lua_dep_dir ]; then
        mkdir -p $lua_dep_dir;
    fi;

    cp $CWD/lib/*.lua $lua_dep_dir
}

case $1 in
    luaoauth)
        install_luaoauth_var=true
        ;;
    *)
        echo "Usage: install.sh luaoauth"
esac

if $install_luaoauth_var; then
    download_and_install_luaoauth=(install_luaoauth_deps_debian install_luaoauth)
    
    for func in ${download_and_install_luaoauth[*]}; do
        $func &
        display_working $!
    done
fi