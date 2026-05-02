include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-argondash-config
PKG_VERSION:=1.0.1
PKG_RELEASE:=20260427

PKG_MAINTAINER:=evoll

LUCI_TITLE:=LuCI app for ArgonDash theme configuration
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+luci-theme-argondash

define Package/$(PKG_NAME)/conffiles
/etc/config/argondash
endef

# NOTE: luci.mk handles po → lmo compilation automatically for all po/*
# directories. A custom Build/Compile block is not needed and was removed
# in v1.0.1 (it referenced a wrong path and caused silent failures).

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
