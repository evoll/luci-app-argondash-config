'use strict';
'require form';
'require fs';
'require rpc';
'require uci';
'require ui';
'require view';

// RPC: returns free space (KiB) on the filesystem that holds the background folder
var callAvailSpace = rpc.declare({
	object: 'luci.argondash',
	method: 'avail'
});

// RPC: delete a background file by name (path traversal blocked in rpcd)
var callRemoveArgon = rpc.declare({
	object: 'luci.argondash',
	method: 'remove',
	params: ['filename'],
	expect: { '': {} }
});

// RPC: commit the staged upload (/tmp/argondash_background.tmp → bg_path/<name>)
var callCommitUpload = rpc.declare({
	object: 'luci.argondash',
	method: 'rename',
	params: ['newname'],
	expect: { '': {} }
});

var bg_path = '/www/luci-static/argondash/background/';

var trans_set = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

function validateHex(section_id, value) {
	if (section_id)
		return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value) ||
			_('Expecting: %s').format(_('valid HEX color value'));
	return true;
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('argondash'),
			L.resolveDefault(callAvailSpace(), {}),
			L.resolveDefault(fs.list(bg_path), [])
		]);
	},

	render: function(data) {
		var m, s, o;

		var availKB  = (data[1] && data[1].avail) ? data[1].avail : 0;
		var fileList = Array.isArray(data[2]) ? data[2] : [];

		m = new form.Map('argondash', _('ArgonDash Theme Configuration'),
			_('Configure the ArgonDash theme appearance. Changes take effect on the next page load.'));

		/* ── SECTION 1: General ── */
		s = m.section(form.TypedSection, 'global', _('General'));
		s.addremove = false;
		s.anonymous = true;

		o = s.option(form.ListValue, 'mode', _('Theme mode'));
		o.value('normal', _('Follow system (auto dark/light)'));
		o.value('light', _('Always light'));
		o.value('dark', _('Always dark'));
		o.default = 'normal';
		o.rmempty = false;

		/* ── Wallpaper source ──
		   The UCI option 'online_wallpaper' stores both the source type and an
		   optional sub-ID in a single string: 'wallhaven', 'wallhaven_<tag_id>',
		   'unsplash', 'unsplash_<collection_id>', 'bing', 'none'.

		   The dropdown normalises wallhaven_* → 'wallhaven' and unsplash_* → 'unsplash'
		   via a custom cfgvalue(), so that dependent fields show/hide correctly.
		   Sub-ID fields (_wallhaven_tag / _unsplash_collection) then read and write
		   the full compound value back via custom cfgvalue()/write() overrides.
		*/
		o = s.option(form.ListValue, 'online_wallpaper', _('Login wallpaper source'));
		o.value('none',      _('Built-in (local files only)'));
		o.value('bing',      _('Bing daily photo'));
		o.value('unsplash',  _('Unsplash'));
		o.value('wallhaven', _('Wallhaven'));
		o.default = 'bing';
		o.rmempty = false;
		/* Normalise compound values so depends() on child fields works correctly */
		o.cfgvalue = function(section_id) {
			var v = uci.get('argondash', section_id, 'online_wallpaper') || 'bing';
			if (v.indexOf('wallhaven') === 0) return 'wallhaven';
			if (v.indexOf('unsplash')  === 0) return 'unsplash';
			return v;
		};

		/* Wallhaven optional tag ID.
		   Reads the numeric/slug part from 'wallhaven_<tag_id>' in UCI;
		   writes 'wallhaven_<tag_id>' back when non-empty, 'wallhaven' otherwise.
		   The rpcd script sanitises the value to [A-Za-z0-9-] before use in URLs. */
		o = s.option(form.Value, '_wallhaven_tag',
			_('Wallhaven tag ID (optional)'),
			_('Leave empty for random wallpapers. Enter a Wallhaven tag ID (numeric) for a specific category.'));
		o.depends('online_wallpaper', 'wallhaven');
		o.rmempty = true;
		o.cfgvalue = function(section_id) {
			var v = uci.get('argondash', section_id, 'online_wallpaper') || '';
			return (v.indexOf('wallhaven_') === 0) ? v.slice('wallhaven_'.length) : '';
		};
		o.write = function(section_id, value) {
			var base = uci.get('argondash', section_id, 'online_wallpaper') || 'wallhaven';
			/* Strip any old sub-ID so we always write a clean value */
			if (base.indexOf('wallhaven_') === 0) base = 'wallhaven';
			var clean = value ? value.trim().replace(/[^A-Za-z0-9-]/g, '') : '';
			uci.set('argondash', section_id, 'online_wallpaper',
				clean ? 'wallhaven_' + clean : base);
		};
		o.remove = function() { /* handled by write() */ };

		/* Unsplash optional collection ID.
		   When the API key is set and a collection ID is provided, the wallpaper
		   script fetches a random photo from that collection instead of globally. */
		o = s.option(form.Value, '_unsplash_collection',
			_('Unsplash collection ID (optional)'),
			_('Leave empty for a random Unsplash photo. Enter a collection ID to restrict to a specific collection.'));
		o.depends('online_wallpaper', 'unsplash');
		o.rmempty = true;
		o.cfgvalue = function(section_id) {
			var v = uci.get('argondash', section_id, 'online_wallpaper') || '';
			return (v.indexOf('unsplash_') === 0) ? v.slice('unsplash_'.length) : '';
		};
		o.write = function(section_id, value) {
			var base = uci.get('argondash', section_id, 'online_wallpaper') || 'unsplash';
			if (base.indexOf('unsplash_') === 0) base = 'unsplash';
			var clean = value ? value.trim().replace(/[^A-Za-z0-9-]/g, '') : '';
			uci.set('argondash', section_id, 'online_wallpaper',
				clean ? 'unsplash_' + clean : base);
		};
		o.remove = function() { /* handled by write() */ };

		/* API key — shared by Unsplash (required) and Wallhaven (optional for NSFW / higher limits).
		   UCI key: use_api_key  (read by luci.argondash_wallpaper rpcd). */
		o = s.option(form.Value, 'use_api_key', _('API key'),
			_('Unsplash: required client_id (get one free at unsplash.com/developers). Wallhaven: optional API key for NSFW content or higher rate limits.'));
		/* Show when EITHER unsplash OR wallhaven is selected */
		o.depends('online_wallpaper', 'unsplash');
		o.depends('online_wallpaper', 'wallhaven');
		o.password = true;
		o.rmempty = true;

		/* Wallhaven resolution matching: exact 1920x1080 vs "at least" 1920x1080.
		   UCI key: use_exact_resolution  (read by luci.argondash_wallpaper rpcd).
		   Only meaningful when Wallhaven source is selected. */
		o = s.option(form.Flag, 'use_exact_resolution',
			_('Wallhaven: exact resolution'),
			_('Match wallpapers to exactly 1920x1080. When disabled, "at least" matching is used (more results).'));
		o.depends('online_wallpaper', 'wallhaven');
		o.default = '1';
		o.rmempty = false;

		/* ── SECTION 2: Light Mode ── */
		s = m.section(form.TypedSection, 'global', _('Light Mode'));
		s.addremove = false;
		s.anonymous = true;

		o = s.option(form.Value, 'primary', _('Primary color'),
			_('Accent color for buttons, active nav items, and highlights. Injected as CSS variable --primary. Default: #5e72e4'));
		o.default = '#5e72e4';
		o.rmempty = false;
		o.validate = validateHex;

		/* transparency / blur control the CSS variables --blur-opacity and --blur-radius.
		   These variables are declared in :root by header.ut (logged-in pages).
		   The login page (sysauth.ut) uses separate hardcoded CSS for its panel blur. */
		o = s.option(form.ListValue, 'transparency', _('Login panel transparency'),
			_('Sets CSS variable --blur-opacity on logged-in pages. 0 = fully transparent · 1 = fully opaque (default: 0.5)'));
		for (var i of trans_set)
			o.value(i);
		o.default = '0.5';
		o.rmempty = false;

		o = s.option(form.Value, 'blur', _('Login panel blur radius'),
			_('Sets CSS variable --blur-radius on logged-in pages, in pixels. 0 = no blur · 10 = default.'));
		o.datatype = 'ufloat';
		o.default = '10';
		o.rmempty = false;

		/* ── SECTION 3: Dark Mode ── */
		s = m.section(form.TypedSection, 'global', _('Dark Mode'));
		s.addremove = false;
		s.anonymous = true;

		o = s.option(form.Value, 'dark_primary', _('Dark mode primary color'),
			_('Accent color used in dark mode. Injected as CSS variable --dark-primary. Default: #344675'));
		o.default = '#344675';
		o.rmempty = false;
		o.validate = validateHex;

		o = s.option(form.ListValue, 'transparency_dark', _('Dark mode panel transparency'),
			_('Sets CSS variable --blur-opacity-dark. 0 = fully transparent · 1 = fully opaque (default: 0.5)'));
		for (var i of trans_set)
			o.value(i);
		o.default = '0.5';
		o.rmempty = false;

		o = s.option(form.Value, 'blur_dark', _('Dark mode blur radius'),
			_('Sets CSS variable --blur-radius-dark, in pixels. 0 = no blur · 10 = default.'));
		o.datatype = 'ufloat';
		o.default = '10';
		o.rmempty = false;

		/* ── SECTION 4: Sidebar & Banner (AD2) ── */
		s = m.section(form.TypedSection, 'global', _('Sidebar & Page Banner'),
			_('Gradient colors for the dark sidebar navigation and the header banner strip (Argon Dashboard 2 style). Injected as CSS variables --sidebar-bg-from/to and --page-banner-from/to.'));
		s.addremove = false;
		s.anonymous = true;

		o = s.option(form.Value, 'sidebar_from', _('Sidebar gradient — top color'),
			_('Default: #42424a'));
		o.default = '#42424a';
		o.rmempty = false;
		o.validate = validateHex;

		o = s.option(form.Value, 'sidebar_to', _('Sidebar gradient — bottom color'),
			_('Default: #191919'));
		o.default = '#191919';
		o.rmempty = false;
		o.validate = validateHex;

		o = s.option(form.Value, 'banner_from', _('Page banner gradient — top color'),
			_('Dark strip behind stat cards on each page. Default: #42424a'));
		o.default = '#42424a';
		o.rmempty = false;
		o.validate = validateHex;

		o = s.option(form.Value, 'banner_to', _('Page banner gradient — bottom color'),
			_('Default: #191919'));
		o.default = '#191919';
		o.rmempty = false;
		o.validate = validateHex;

		/* BUG FIX (v1.0.1): save before apply.
		   Original called ui.changes.apply() before map.save() completed — data race. */
		o = s.option(form.Button, '_save', _('Save settings'));
		o.inputstyle = 'apply';
		o.inputtitle = _('Save & apply');
		o.onclick = function() {
			return this.map.save(null, true).then(function() {
				ui.changes.apply(true);
			});
		};

		/* ── SECTION 5: Background Files ── */
		s = m.section(form.TypedSection, '_upload',
			_('Login Background Files (available: %1024.2mB)').format(availKB * 1024),
			_('Upload jpg / png / gif / webp / mp4 / webm. Stored in <code>%s</code>. Displayed randomly on the login page.').format(bg_path));
		s.addremove = false;
		s.anonymous = true;
		s.cfgsections = function() { return ['_upload']; };

		/* BUG FIX (v1.0.1): removed o.modalonly = true — button was never rendered */
		o = s.option(form.Button, '_upload_bg', _('Upload background file'));
		o.inputstyle = 'action';
		o.inputtitle = _('Choose file...');
		o.onclick = function(ev, section_id) {
			var file = '/tmp/argondash_background.tmp';
			return ui.uploadFile(file, ev.target).then(function(res) {
				return L.resolveDefault(callCommitUpload(res.name), {}).then(function(ret) {
					if (ret.result === 0)
						return location.reload();
					ui.addNotification(null, E('p', _('Failed to upload file: %s.').format(res.name)));
					return L.resolveDefault(fs.remove(file), {});
				});
			}).catch(function(e) { ui.addNotification(null, E('p', e.message)); });
		};

		/* ── File list table ──
		   form.TableSection with dummy type + overridden render() is a valid
		   LuCI pattern for injecting custom DOM nodes into a form map. */
		s = m.section(form.TableSection, '_bg_files');
		s.addremove = false;
		s.anonymous = true;
		s.render = function() {
			var tbl = E('table', { 'class': 'table cbi-section-table' },
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, [_('Filename')]),
					E('th', { 'class': 'th' }, [_('Modified')]),
					E('th', { 'class': 'th' }, [_('Size')]),
					E('th', { 'class': 'th' }, [_('Action')])
				])
			);

			cbi_update_table(tbl, fileList.map(L.bind(function(file) {
				return [
					file.name,
					new Date(file.mtime * 1000).toLocaleString(),
					'%1024.2mB'.format(file.size),
					E('button', {
						'class': 'btn cbi-button cbi-button-remove',
						'click': ui.createHandlerFn(this, function() {
							return L.resolveDefault(callRemoveArgon(file.name), {})
								.then(function() { return location.reload(); });
						})
					}, [_('Delete')])
				];
			}, this)), E('em', _('No background files uploaded yet.')));

			return E('div', { 'class': 'cbi-map', 'id': 'cbi-filelist' }, [
				E('h3', _('Uploaded backgrounds')),
				tbl
			]);
		};

		return m.render();
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
