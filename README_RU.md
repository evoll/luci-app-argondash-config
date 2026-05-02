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
[lede]: https://github.com/coolsnowwolf/lede
[official]: https://github.com/openwrt/openwrt
[immortalwrt]: https://github.com/immortalwrt/immortalwrt

<div align="center">
<img src="https://raw.githubusercontent.com/evoll/staff/master/argon_title4.svg">

# Плагин настройки темы ArgonDash

Плагин позволяет настраивать прозрачность и размытие панели входа,
управлять фоновыми изображениями и видео, а также цветовой схемой темы.

[![license][license-badge]][license]
[![prs][prs-badge]][prs]
[![issues][issues-badge]][issues]
[![release][release-badge]][release]
[![download][download-badge]][download]
[![contact][contact-badge]][contact]

[English][en-us-link] |
**Русский**

<img src="https://raw.githubusercontent.com/evoll/staff/master/argon2.gif">
</div>

## Описание ветки

| Ветка  | Версия  | Описание                                    | Совместимые прошивки                          |
| ------ | ------- | ------------------------------------------- | --------------------------------------------- |
| master | v1.x.x  | Поддержка актуальных версий LuCI            | [Official OpenWrt][official] · [ImmortalWrt][immortalwrt] |

## Быстрый старт

### Вариант 1 — Feeds OpenWrt (рекомендуется)

Добавьте ленту один раз в `feeds.conf` или `feeds.conf.default`:

```
src-git argondash-config https://github.com/evoll/luci-app-argondash-config.git
```

Затем установите и соберите:

```bash
./scripts/feeds update argondash-config
./scripts/feeds install luci-app-argondash-config
make defconfig
make package/feeds/argondash-config/luci-app-argondash-config/compile V=s
```

При последующих вызовах `./scripts/feeds update` пакет обновляется автоматически.

### Вариант 2 — Ручной клон в package/

```bash
cd openwrt/package
git clone https://github.com/evoll/luci-app-argondash-config.git
cd ..
make menuconfig  # LUCI → Applications → luci-app-argondash-config
make -j$(nproc) V=s
```

### Вариант 3 — Готовый бинарный пакет

Скачайте `.ipk` (OpenWrt 23.05/24.10) или `.apk` (OpenWrt 25.12+/snapshot)
со страницы [Releases][release] и установите:

```bash
# opkg (23.05 / 24.10)
opkg install luci-app-argondash-config_*.ipk

# apk (25.12 / snapshot)
apk add --allow-untrusted luci-app-argondash-config_*.apk
```

## Возможности

| Параметр | Описание |
|---|---|
| Режим темы | Следовать системе / всегда светлая / всегда тёмная |
| Источник обоев | Встроенные · Bing · Unsplash · Wallhaven |
| API-ключ Unsplash | Ключ для доступа к Unsplash API |
| Основной цвет (светлая) | Акцентный цвет кнопок и активных элементов |
| Прозрачность панели входа | 0 (прозрачно) — 1 (непрозрачно) |
| Радиус размытия | Эффект матового стекла в пикселях |
| Тёмная тема | Аналогичные параметры для тёмного режима |
| Боковая панель | Цвета градиента навигационной панели (AD2) |
| Заголовок страницы | Цвета баннерной полосы за карточками статистики |
| Фоновые файлы | Загрузка/удаление jpg, png, gif, webp, mp4, webm |

## Авторы

<a href="https://github.com/evoll/luci-app-argondash-config/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=evoll/luci-app-argondash-config" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Связанные проекты

- [luci-theme-argondash](https://github.com/evoll/luci-theme-argondash) — тема ArgonDash
- [openwrt-package](https://github.com/evoll/openwrt-package) — прочие OpenWrt пакеты
