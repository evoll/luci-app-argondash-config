<!-- markdownlint-configure-file {
  "MD013": {
    "code_blocks": false,
    "tables": false,
    "line_length":200
  },
  "MD033": false,
  "MD041": false
} -->

[license]: /LICENSE
[license-badge]: https://img.shields.io/github/license/evoll/luci-app-argondash-config?style=flat-square&a=1
[prs]: https://github.com/evoll/luci-app-argondash-config/pulls
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[issues]: https://github.com/evoll/luci-app-argondash-config/issues/new
[issues-badge]: https://img.shields.io/badge/Issues-welcome-brightgreen.svg?style=flat-square
[release]: https://github.com/evoll/luci-app-argondash-config/releases
[release-badge]: https://img.shields.io/github/v/release/evoll/luci-app-argondash-config?include_prereleases&style=flat-square
[download]: https://github.com/evoll/luci-app-argondash-config/releases
[download-badge]: https://img.shields.io/github/downloads/evoll/luci-app-argondash-config/total?style=flat-square
[contact]: https://t.me/evoll
[contact-badge]: https://img.shields.io/badge/Contact-telegram-blue?style=flat-square
[en-us-link]: /README.md
[ru-ru-link]: /README_RU.md
[en-us-release-log]: /RELEASE.md
[ru-ru-release-log]: /RELEASE_RU.md
[config-link]: https://github.com/evoll/luci-app-argondash-config/releases
[official]: https://github.com/openwrt/openwrt
[immortalwrt]: https://github.com/immortalwrt/immortalwrt

<div align="center">
<img src="https://raw.githubusercontent.com/evoll/staff/master/argon_title4.svg">

# ArgonDash Theme Config Plugin

You can set the blur and transparency of the login page of ArgonDash theme,

and manage the background pictures and videos.

[![license][license-badge]][license]
[![prs][prs-badge]][prs]
[![issues][issues-badge]][issues]
[![release][release-badge]][release]
[![download][download-badge]][download]
[![contact][contact-badge]][contact]

**English** |
[Русский][ru-ru-link]

<img src="https://raw.githubusercontent.com/evoll/staff/master/argon2.gif">
</div>

## Branch Introduction

There are currently one main branches that are adapted to different versions of the **OpenWrt** source code.  
The table below will provide a detailed introduction:

| Branch | Version | Description                        | Matching source                                           |
| ------ | ------- | ---------------------------------- | --------------------------------------------------------- |
| master | v1.x.x  | Support the latest version of LuCI | [Official OpenWrt][official] • [ImmortalWrt][immortalwrt] |

## Getting started

### Option 1 — OpenWrt feeds (recommended)

Add the feed once to your `feeds.conf` or `feeds.conf.default`:

```
src-git argondash-config https://github.com/evoll/luci-app-argondash-config.git
```

Then install and build:

```bash
./scripts/feeds update argondash-config
./scripts/feeds install luci-app-argondash-config
make defconfig
make package/feeds/argondash-config/luci-app-argondash-config/compile V=s
```

All future `./scripts/feeds update` calls will pull the latest version automatically.

### Option 2 — Manual clone into package/

```bash
cd openwrt/package
git clone https://github.com/evoll/luci-app-argondash-config.git
cd ..
make menuconfig   # LUCI → Applications → luci-app-argondash-config
make -j$(nproc) V=s
```

### Option 3 — Pre-built binary

Download the `.ipk` (OpenWrt 23.05 / 24.10) or `.apk` (OpenWrt 25.12+) from
the [Releases][release] page and install:

```bash
# opkg (23.05 / 24.10)
opkg install luci-app-argondash-config_*.ipk

# apk (25.12 / snapshot)
apk add --allow-untrusted luci-app-argondash-config_*.apk
```

## Contributors

<a href="https://github.com/evoll/luci-app-argondash-config/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=evoll/luci-app-argondash-config" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Related Projects

- [luci-theme-argondash](https://github.com/evoll/luci-theme-argondash): ArgonDash theme
- [openwrt-package](https://github.com/evoll/openwrt-package): My OpenWrt package
