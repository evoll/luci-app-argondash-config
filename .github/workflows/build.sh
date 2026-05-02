#!/bin/sh
# Локальный helper-скрипт для сборки пакета в уже настроенном OpenWrt SDK.
#
# Предполагается, что feeds уже настроены и пакет установлен:
#   echo "src-git argondash-config https://github.com/evoll/luci-app-argondash-config.git" >> feeds.conf
#   ./scripts/feeds update argondash-config
#   ./scripts/feeds install luci-app-argondash-config
#   make defconfig
#
# Параметры через env:
#   PKG_EXT  — расширение пакета: ipk или apk (по умолчанию: ipk)
#   NPROC    — число потоков (по умолчанию: 1)

PKG_EXT=${PKG_EXT:-ipk}
NPROC=${NPROC:-1}

set -e

./scripts/feeds install luci-base

make package/feeds/argondash-config/luci-app-argondash-config/{clean,compile} \
  V=s -j"${NPROC}" BUILD_LOG=1

mkdir -p ../output
find bin/packages/ -name "luci-app-argondash-config*.${PKG_EXT}" | while read pkg; do
  [ -f "${pkg}" ] || continue
  cp "${pkg}" ../output/
  echo "Собран: $(basename "${pkg}")"
done

# Сохраняем логи рядом с пакетами
if [ -d logs ]; then
  tar -cJf ../output/buildlog-${PKG_EXT}.tar.xz logs
fi