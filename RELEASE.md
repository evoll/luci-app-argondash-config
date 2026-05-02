# Release Notes

## v1.0.1 — 2026-04-27

Initial public release of `luci-app-argondash-config`.

### Features

- **Theme mode** — follow system / always light / always dark
- **Login wallpaper source** — built-in local files, Bing daily photo, Unsplash, Wallhaven
  - Unsplash: optional collection ID; requires API key (`use_api_key`)
  - Wallhaven: optional tag ID; optional API key for NSFW / higher rate limits;
    exact vs "at least" 1920×1080 resolution filter (`use_exact_resolution`)
- **Light mode** — primary accent color, login panel transparency and blur radius
- **Dark mode** — primary accent color, panel transparency and blur radius
- **Sidebar & banner gradients** — four-color gradient control for AD2-style nav and page header
- **Background file manager** — upload / delete jpg, png, gif, webp, mp4, webm;
  shows free space on the actual background filesystem
- **Migration** — automatic UCI key migration from legacy option names (`bing_background`,
  `unsplash_key`) on first boot after install

### Bug fixes (vs pre-release internal builds)

| # | File | Bug |
|---|------|-----|
| 1 | `argondash-config.js` | Upload button invisible — `o.modalonly = true` without a modal |
| 2 | `argondash-config.js` | Save race: `ui.changes.apply()` ran before `map.save()` completed |
| 3 | `argondash-config.js` | Wrong UCI key for API key field (`unsplash_key` → `use_api_key`) |
| 4 | `argondash-config.js` | `×` (U+00D7) in msgid didn't match POT — translation never applied |
| 5 | `argondash-config.js` | Missing `unsplash_key` / `use_exact_resolution` / Wallhaven tag fields |
| 6 | `luci.argondash` | `df` always queried `/` instead of the background directory's filesystem |
| 7 | `luci.argondash` | Path traversal: `grep -q ".."` matched any two-char sequence |
| 8 | `check.yml` / `release.yml` | Package cloned into `package/downloads/` — make-target never found it |
| 9 | `check.yml` / `release.yml` | `feeds install` for a package not registered in any feed |
| 10 | `check.yml` | `paths` filter `luci-app-argondash-config/**` never matched repo-root files |
| 11 | `check.yml` | `ref: main` override — PR CI always tested main, not the PR commit |

### Compatibility

| OpenWrt | Package format | LuCI renderer |
|---------|---------------|---------------|
| 23.05.x | `.ipk` (opkg) | ucode |
| 24.10.x | `.ipk` (opkg) | ucode |
| 25.12.x | `.apk` (apk)  | ucode |
| snapshot | `.apk` (apk)  | ucode |

### Installation

**Feeds (recommended):**
```
src-git argondash-config https://github.com/evoll/luci-app-argondash-config.git
```
```bash
./scripts/feeds update argondash-config
./scripts/feeds install luci-app-argondash-config
```

**Binary package:** download `.ipk` or `.apk` from the Assets section of this release.
