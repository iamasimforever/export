'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var polka = _interopDefault(require('polka'));
var compression = _interopDefault(require('compression'));
var d3Request = require('d3-request');
var d3TimeFormat = require('d3-time-format');
var d3Color = require('d3-color');
var d3Array = require('d3-array');
var d3Time = require('d3-time');
var d3Format = require('d3-format');
var d3Scale = require('d3-scale');
var d3Force = require('d3-force');
var d3Delaunay = require('d3-delaunay');
require('d3-timer');
var d3GeoProjection = require('d3-geo-projection');
require('d3-ease');
var d3Geo = require('d3-geo');
require('d3-interpolate');
require('d3-shape');
var Stream = _interopDefault(require('stream'));
var http = _interopDefault(require('http'));
var Url = _interopDefault(require('url'));
var https = _interopDefault(require('https'));
var zlib = _interopDefault(require('zlib'));

var url = function (req) {
	let url = req.url;
	if (url === void 0) return url;

	let obj = req._parsedUrl;
	if (obj && obj._raw === url) return obj;

	obj = {};
	obj.query = obj.search = null;
	obj.href = obj.path = obj.pathname = url;

	let idx = url.indexOf('?', 1);
	if (idx !== -1) {
		obj.search = url.substring(idx);
		obj.query = obj.search.substring(1);
		obj.pathname = url.substring(0, idx);
	}

	obj._raw = url;

	return (req._parsedUrl = obj);
};

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (var i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime.prototype.define = function(typeMap, force) {
  for (var type in typeMap) {
    var extensions = typeMap[type].map(function(t) {return t.toLowerCase()});
    type = type.toLowerCase();

    for (var i = 0; i < extensions.length; i++) {
      var ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] == '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      var ext = extensions[0];
      this._extensions[type] = (ext[0] != '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.getType = function(path) {
  path = String(path);
  var last = path.replace(/^.*[/\\]/, '').toLowerCase();
  var ext = last.replace(/^.*\./, '').toLowerCase();

  var hasPath = last.length < path.length;
  var hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

var Mime_1 = Mime;

var standard = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomsvc+xml":["atomsvc"],"application/bdoc":["bdoc"],"application/ccxml+xml":["ccxml"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma","es"],"application/emma+xml":["emma"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/patch-ops-error+xml":["xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-diff+xml":["xdf"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/ktx":["ktx"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};

var lite = new Mime_1(standard);

const { join, resolve } = path;



const FILES = {};
const noop = () => {};

function toAssume(uri, extns) {
	let i=0, x, len=uri.length - 1;
	if (uri.charCodeAt(len) === 47) {
		uri = uri.substring(0, len);
	}

	let arr=[], tmp=`${uri}/index`;
	for (; i < extns.length; i++) {
		x = '.' + extns[i];
		if (uri) arr.push(uri + x);
		arr.push(tmp + x);
	}

	return arr;
}

function find(uri, extns) {
	let i=0, data, arr=toAssume(uri, extns);
	for (; i < arr.length; i++) {
		if (data = FILES[arr[i]]) return data;
	}
}

function is404(req, res) {
	return (res.statusCode=404,res.end());
}

function list(dir, fn, pre='') {
	let i=0, abs, stats;
	let arr = fs.readdirSync(dir);
	for (; i < arr.length; i++) {
		abs = join(dir, arr[i]);
		stats = fs.statSync(abs);
		stats.isDirectory()
			? list(abs, fn, join(pre, arr[i]))
			: fn(join(pre, arr[i]), abs, stats);
	}
}

function send(req, res, file, stats, headers={}) {
	let code=200, opts={};

	if (req.headers.range) {
		code = 206;
		let [x, y] = req.headers.range.replace('bytes=', '').split('-');
		let end = opts.end = parseInt(y, 10) || stats.size - 1;
		let start = opts.start = parseInt(x, 10) || 0;

		if (start >= stats.size || end >= stats.size) {
			res.setHeader('Content-Range', `bytes */${stats.size}`);
			res.statusCode = 416;
			return res.end();
		}

		headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
		headers['Content-Length'] = (end - start + 1);
		headers['Accept-Ranges'] = 'bytes';
	}

	res.writeHead(code, headers);
	fs.createReadStream(file, opts).pipe(res);
}

var sirv = function (dir, opts={}) {
	dir = resolve(dir || '.');

	let isNotFound = opts.onNoMatch || is404;
	let extensions = opts.extensions || ['html', 'htm'];
	let setHeaders = opts.setHeaders || noop;

	if (opts.dev) {
		return function (req, res, next) {
			let stats, file, uri=decodeURIComponent(req.path || req.pathname || url(req).pathname);
			let arr = [uri].concat(toAssume(uri, extensions)).map(x => join(dir, x)).filter(fs.existsSync);
			while (file = arr.shift()) {
				stats = fs.statSync(file);
				if (stats.isDirectory()) continue;
				setHeaders(res, uri, stats);
				return send(req, res, file, stats, {
					'Content-Type': lite.getType(file),
					'Last-Modified': stats.mtime.toUTCString(),
					'Content-Length': stats.size,
				});
			}
			return next ? next() : isNotFound(req, res);
		}
	}

	let cc = opts.maxAge != null && `public,max-age=${opts.maxAge}`;
	if (cc && opts.immutable) cc += ',immutable';

	list(dir, (name, abs, stats) => {
		if (!opts.dotfiles && name.charAt(0) === '.') {
			return;
		}

		let headers = {
			'Content-Length': stats.size,
			'Content-Type': lite.getType(name),
			'Last-Modified': stats.mtime.toUTCString(),
		};

		if (cc) headers['Cache-Control'] = cc;
		if (opts.etag) headers['ETag'] = `W/"${stats.size}-${stats.mtime.getTime()}"`;

		FILES['/' + name.replace(/\\+/g, '/')] = { abs, stats, headers };
	});

	return function (req, res, next) {
		let pathname = decodeURIComponent(req.path || req.pathname || url(req).pathname);
		let data = FILES[pathname] || find(pathname, extensions);
		if (!data) return next ? next() : isNotFound(req, res);

		setHeaders(res, pathname, data.stats);
		send(req, res, data.abs, data.stats, data.headers);
	};
};

function noop$1() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function null_to_empty(value) {
    return value == null ? '' : value;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { title: '', head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.title + result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}

const windowGlobal = typeof window !== "undefined" && window;

const getOrdinal = d => {
  const t = d % 10;
  return Math.floor((d % 100 / 10)) === 1 ? "th" :
    t === 1 ? "st" :
    t === 2 ? "nd" :
    t === 3 ? "rd" :
    "th"
};

const flatten = arr => (
  arr.reduce((a,b) => [...a, ...b])
);

const degreesToRadians = deg => deg * Math.PI / 180;
const getPositionFromAngle = (angle, distance) => [
  Math.cos(degreesToRadians(angle)) * distance,
  Math.sin(degreesToRadians(angle)) * distance,
];

// from https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
const debounce = (func, wait, immediate) => {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};



const getUrlParams = () => {
  if (!windowGlobal) return
  const parts = windowGlobal.location.search.slice(1).split("&");
  if (!parts) return
  let params = {};
  parts.forEach(part => {
    const [key, value] = part.split("=");
    if (!key) return
    params[key] = value;
  });
  return params
};

// import rawData from "./../data/data.json"

// export const data = rawData

const parseDate = d3TimeFormat.timeParse("%-m/%-d/%Y");
const dateAccessor = d => parseDate(d[""] || d["date"]);

const titleAccessor = (d={}, doStripFormatting=true) => (
  doStripFormatting
  ? (d["title"] || "").replace(/\*/g, "")
  : d["title"] || ""
);

const sourceKeywords = {
  Facebook: [
    "facbeook",
    "fb",
    "ＦＢ",
  ],
  Twitter: [
    "tweet",
    "tweets",
    "twttr",
  ],
  WhatsApp: [],
  Instagram: [
    "ig",
  ],
  Youtube: [],
  Weibo: [],
  TikTok: [],
  Medium: [
    "medium.com"
  ],
  "The news": [
    "news",
  ],
  Reddit: [],
  Blogs: [
    "blog",
    "blogs",
    "bloggers",
  ],
  Radio: [],
  TV: [],
  // video: [],
};
const sourceColors = {
  Facebook: "#4267B2",
  Twitter: "#1DA1F2",
  WhatsApp: "#4AC959",
  Instagram: "#833AB4",
  Youtube: "#FF0000",
  Weibo: "#df2029",
  TikTok: "#69C9D0",
  Medium: "#292828",
  "The news": "#778beb",
  Reddit: "#FF4500",
  Blogs: "#FDA7DF",
  Radio: "#e77f67",
  TV: "#0fb9b1",
  // video: [],
};

const sources = Object.keys(sourceKeywords);

const categories = ["Authorities", "Causes", "Conspiracy theory", "Cures", "Spread", "Symptoms", "Other"];
// const colors = ["#58B19F", "#778beb", "#e77f67", "#FDA7DF", "#cf6a87", "#A3CB38", "#786fa6", "#4b7bec", "#778ca3", "#0fb9b1"]
// const colors = ["#1AC29A", "#778beb", "#E58F29", "#FDA7DF", "#cf6a87", "#AED027", "#786fa6", "#778ca3"]
// const colors = ["#E58F29", "#E1538F", "#358DDE", "#6F57B0", "#91BF0D", "#20C29B", "#CD424A", "#778ca3"]
// const colors = ["#57a039", "#5ecd31", "#8cf761", "#bfff95", "#e4ffd0"]
// const colors = ["#AE6DED", "#ED423E", "#57A13A", "#4DA3A2", "#A38345"]
const colors = ["#4B3566", "#da574d", "#58A13A", "#53AEB0", "#E6BD77"];
let categoryColors = {};
categories.forEach((category, i) => {
  categoryColors[category] = colors[i % (colors.length)];
});
console.log(categoryColors);
categoryColors[""] = "#656275";

const categoryAccessor = d => d["category"].trim();

const parseSource = (str="") => {
  const words = (str.toLowerCase().match(/\S+\s*/g) || []).map(d => d.trim());
  const matchingSources = sources.filter(source => (
    [source.toLowerCase(), ...sourceKeywords[source]].filter(keyword => (
      words.includes(keyword)
    )).length > 0
  ));
  return matchingSources
};
const sourceAccessor = d => {
  if (!d["source"]) return []
  return parseSource(d["source"])
};

const urlAccessor = d => d["url"];
// export const domainAccessor = d => {
//   const url = urlAccessor(d)
//   if (
//     !url.startsWith("http")
//     && !url.startsWith("www")
//   ) return null
//   return getDomainFromUrl(url)
// }
const validRatings = {
  False: [
    "false",
    "falso",
    "fake",
    "old policy",
    "inaccurate",
    "incorrect",
    "old policy",
    "unsupported",
    "fake news",
    "wrong",
    "conspiracy theory",
    "not true",
    "false connection",
  ],
  "Intentionally false": [
    "intentionally false",
    "misinformation / conspiracy theory",
    "clickbait / disinformation",
    "manipulation",
    "pseudoscience, fake news, disinformation",
    "misinformation",
    "fake news, conspiracy theory, manipulation of facts, disinformation, clickbait",
  ],
  Misleading: [
    "misleading",
    "misleading title",
    "false headline",
  ],
  Unproven: [
    "unproven",
    "insufficient evidence",
    "unlikely",
    "no evidence",
    "unverified",
    "questionable",
    "unverified",
  ],
  "Very false": [
    "very false",
    "pants on fire!",
  ],
  "Partially false": [
    "partially false",
    "mainly false",
    "mostly false",
    "teilweise falsch",
    "mostly true",
  ],
};

// ??
// "(org. doesn't apply rating)",
// "Explanatory"
// "unsustainable "
// "Context"
// ""

const ratings = Object.keys(validRatings);
const ratingAccessor = d => {
  const rating = d["rating"].toLowerCase();
  const matchingRating = ratings.find(validRating => (
    validRatings[validRating].includes(rating)
  ));
  return matchingRating || rating
};

const organizationAccessor = d => d["organization"];

const organizationLogos = {
  "FactCrescendo": "https://i2.wp.com/www.factcrescendo.com/wp-content/uploads/2019/07/Fact-Crescendo-Logo-01-e1569236593436.png?fit=200%2C74&ssl=1",
  "FactCrescendo Srilanka": "https://i2.wp.com/www.factcrescendo.com/wp-content/uploads/2019/07/Fact-Crescendo-Logo-01-e1569236593436.png?fit=200%2C74&ssl=1",
  "Maldita.es": "https://maldita.es/app/uploads/2019/10/maldita_logo_negro_total-60x60-c-default.jpg",
  "Newschecker": "https://cache.epapr.in/applogos/masthead_5c909c1971769.jpg",
  "Poligrafo": "https://poligrafo.sapo.pt/assets/img/poligrafo/logo-07.png",
  "Agência Lupa": "https://piaui.folha.uol.com.br/lupa/wp-content/themes/lupa2018/images/logolupa.png",
  "Demagog": "https://demagog.org.pl/wp-content/uploads/2018/12/cropped-logo_demagog.png",
};

const allTags = {
  Medical: {
    "Medical equipment": [ "respirator", "respirators", "ventilator", "ventilators", "face mask", "masks", ],
    "Medicine": [ "medication", "medicines", "ibuprofen", "tylenol", "nsaid", "nsaids", ],
    "Hospitals": [ "hospital", "doctor", "doctors", "nurse", "nurses", ],
    "Insurance": [],
    "Vaccines": [ "vaccine", ],
  },
  Governments: {
    "Trump Cluster": [ "trump", "fauci", "white house"],
    "Crime": [ "steal", "murder", "murdered", "rob", "robbed", "robbery", "killing", "cannibalism", "cocaine", "scam", "looting", ],
    "Aid": [ "donation", "donations", "donated", "donate", "donating", "giving away", "give you free", "for free", "free internet", ],
    "Laws": [ "law", "arrested", ],
    "Governments": ["government", "goverment", "shortage", "governor", "senator", "cdc", "election", "elections", "military", "suspended", "minister", "ministry", "citizen", "president", "department of health", "police", "officials", ],
    "Lockdown": [ "lock down", "locked down", "stay inside", "suspend operations", "confinement", "quarantine", "quarantined", "gatherings are banned", "must remain in their homes", "gatherings", "curfew",  ],
  },
  
  C: {
    "Prevention": [ "gloves", "prevent", "gargling", "disinfectant", "disinfectants", "protect", "will not kill", "dies at a temperature", "ward off", "prevents", "summer", "degrees", "combatting", "avoid", "social distancing", "santizer", "sanitization", "disinfect", "kill corona", "gargle", "gargling", "preventing", "can kill", "eliminates corona", "contaminated", "weed kills", "on any surface", "kills the virus", "immunity", "can be slowed", "preventative", "preventive", "kills the 2019", "leave your shoes outside", "fight against corona", "kill all the virus", "desinfectants", "sanitizer", "disinfection", "warm climate", "disinfected", "warm places", "kill the virus", "kills the new corona", "contain corona", "contain the corona", "sterilize", "kills corona", "helps against corona", "against the virus", "helps fight against corona", "stop the new corona", "fumigated", "kill the corona", ],
    "Cures": [ "cure", "cured", "remedy", "treat", "treatment", "chloroquine", "onion", "drug", "heal", "healed", "garlic", "treating", "antidote", ],
    "Symptoms": ["runny nose", "cough", ],
    "Detection": [ "detect", "test", "tests", "testing", "antibodies", "diagnose", "diagnosis", "to check if you have corona", "tell you if you have", "check for corona", "holding your breath", "hold your breath", ],
    "Risk factors": ["airborne", "in air", "increases risk", "increases coronavirus risk", "transmitted", "increases your chances of getting", "exposes people to", "prone to get", ],
  },
  D: {
    "Origins": [ "was created", "invented by", "started because", "invented the corona", "came from", "was produced by", "created the virus", "it was lab created", "lab-made corona", "responsible for the pandemic", "caused the corona", "biological warfare", "origin", "was engineered by scientists", "patented the virus", "virus is patented", "is man made", "reason for corona", "covid 19 was invented", ],
    "Conspiracies": ["chinese secret program", "weapon", "permission to kill", "spies", "cover up", "conspiracy", "bioweapon", "political war", "secret invasion", "cov is man made", "train marked with covid", ],
    "Predictions": [ "predicted", "predicts", "foresaw", "caused by", "originated in", "forseen", ],
    "Other diseases": ["the flu", "common cold", "cholera", "hiv", "rabies", "common flu", "a cold", "the cold", "the damn flu", "seasonal flu", "h1n1", ],
    "Spread": [ "tested positive", "positive", "transmit", "transmitted", "appears in", "was infected",  "new case", "confirmed cases", "is a person with", "a case", "spreading", "confirmed case", "have died", "death toll", "is in", "are infected", "cases in", "cases were reported", "are cases in", "first cases", "first case", "first corona", "infected", "fatality rate", "has reached", "died in", "case infects", "numbers", "first", "cases", "case of cov", "corpse", "corpses", "lying in street", "lying on the ground", "lying on the streets", "coffins", ],
    "Individuals": ["in intensive care", "was diagnosed", "has been diagnosed", "employee with covid", "has the corona", "has corona", "has the new corona", "has covid", ],
  },
  Other: {
    "Animals": [ "dog", "dogs", "bat", "bats", "cat", "cats", "chicken", "chickens", "deer", "deers", "lions", "crocodiles", "coyotes", "pig", "pigs", "crab", "orangutan", "whales", "pets", "sheep", "pangolin", "hornets", "fish", "dolphins", ],
    "Food": [ "supermarket", "supermarkets", "grocery", "beer", "meat", "vegetable", "fruit", "market", "markets", "alcohol", "alcoholic", "foods", "ice cream", "cabbage", "herbs", ],
    "Religion": [ "muslim", "muslims", "christians", "religion", "pray for", "islam", "islamic", "ritual", "mecca", "quran", "saint", "pilgrimage", "prayer group", ],
    "Travel": [ "borders", "enter or leave", "airport", "airports", "flights", "flight", "tourist", "tourists", "tourism", ],
    "Videos": ["video", ],
  }
};

const tags = flatten(Object.values(allTags).map(Object.keys));
const tagCategories = Object.keys(allTags);

let tagMap = {};
let tagColors = {};
let tagCategoryMap = {};
Object.keys(allTags).forEach((category, i) => {
  let categoryColor = d3Color.color(colors[i % (colors.length)]).darker(-1).brighter(-1).formatHex();
  Object.keys(allTags[category]).map(tag => {
    tagMap[tag] = allTags[category][tag];
    tagCategoryMap[tag] = category;
    // tagColors[tag] = tweakColor(colors[i % (colors.length)], i - 2)
    tagColors[tag] = colors[i % (colors.length)];
  });
});
tagColors[""] = "#656275";

const getMatchingTags = str => {
  const normalizedStr = str.toLowerCase().replace(/-/g, " ").replace(/[^0-9a-z ]/gi, '');
  const words = (normalizedStr.match(/\S+\s*/g) || []).map(d => d.trim());
  const matchingTags = tags.filter(tag => (
      [tag.toLowerCase(), ...tagMap[tag]].filter(keyword => (
        keyword.split(" ").length > 1
          ? normalizedStr.includes(keyword)
          : words.includes(keyword)
      )).length > 0
  ));

  return matchingTags
};
const tagsAccessor = d => d["tags"] || [];
//   const str = titleAccessor(d).toLowerCase()
//   return getMatchingTags(str)
// }

const tagAccessor = d => tagsAccessor(d)[0] || "";


const countryNameMap = {
  USA: "United States of America",
  "United States": "United States of America",
  UK: "United Kingdom",
  BiH: "Bosnia and Herzegovina",
  "South africa": "South Africa",
  Spasin: "Spain",
  Mayanmar: "Myanmar",
  "India/Srilanka": "Sri Lanka",
  Kaxakhstan: "Kazakhstan",
  Korea: "South Korea",
  // "Hong Kong":
  México: "Mexico",
  "North Macedonia": "Macedonia",
  "DR Congo": "Democratic Republic of the Congo",
};
const countryAccessor = d => countryNameMap[d["countries"][0]] || d["countries"][0];
const countriesAccessor = d => d["countries"].map(d => countryNameMap[d] || d);

/* src/components/ListItem.svelte generated by Svelte v3.19.1 */

const css = {
	code: ".card-wrapper.svelte-oioy7h.svelte-oioy7h{height:100%;width:100%;max-width:90vw;transition:all 0.3s ease-out}.card-wrapper.modal.svelte-oioy7h.svelte-oioy7h{position:fixed;width:750px;height:auto;z-index:100}.card-contents.svelte-oioy7h.svelte-oioy7h{height:100%;width:100%;color:#1d1e24;background:white;border:1px solid grey;transform:translate(0.5em, -2.1em);transition:transform 0.2s ease-out}.card-contents.svelte-oioy7h.svelte-oioy7h:hover{transform:translate(0.7em, -2.4em)}.card-contents-inner.svelte-oioy7h.svelte-oioy7h{display:flex;flex-direction:column;height:100%;padding:1em 1.6em;color:inherit;text-decoration:none}.title.svelte-oioy7h.svelte-oioy7h{position:relative;display:block;margin-top:2em;font-size:1.4em;line-height:1.4em;color:inherit;text-decoration:none;margin-bottom:0.5em;overflow:hidden;text-overflow:ellipsis;padding-right:0.5em;-webkit-line-clamp:var(--max-lines);display:-webkit-box;-webkit-box-orient:vertical;text-overflow:ellipsis;--lh:1.4em;max-height:calc(var(--lh) * var(--max-lines))}@supports not (-webkit-line-clamp: 4){.title.svelte-oioy7h.svelte-oioy7h{--lh:1.4em;max-height:calc(var(--lh) * var(--max-lines))}.title.svelte-oioy7h.svelte-oioy7h:before{position:absolute;content:\"...\";bottom:0;right:0.5em;z-index:5}.title.svelte-oioy7h.svelte-oioy7h:after{content:\"\";position:absolute;right:0.5em;width:1em;height:1.5em;background:white;z-index:10}}.title.svelte-oioy7h b.svelte-oioy7h{background:#dfddfd;font-weight:500}.date.svelte-oioy7h.svelte-oioy7h{position:absolute;top:1.3em;right:1em;color:#8888a5}.rating.svelte-oioy7h.svelte-oioy7h{display:flex;align-items:center;position:absolute;top:-1.3em;top:1em;left:1em;left:-0.63em;padding:0.6em 1em;padding-left:2.4em;background:#1d1e24;color:white;font-size:0.9em;font-weight:700;text-transform:uppercase;letter-spacing:0.1em}.row.svelte-oioy7h.svelte-oioy7h{display:flex;justify-content:space-between;margin-top:1em;margin-bottom:0}.column.svelte-oioy7h.svelte-oioy7h{line-height:2em}.column.svelte-oioy7h.svelte-oioy7h:nth-of-type(2){text-align:right}.org-img.svelte-oioy7h.svelte-oioy7h{max-width:10em;max-height:2em;margin-top:0.3em}.label.svelte-oioy7h.svelte-oioy7h{padding-top:0.3em;color:#8888a5;font-size:0.7em;line-height:1.3em;letter-spacing:0.1em;text-transform:uppercase}.bottom-bar.svelte-oioy7h.svelte-oioy7h{display:flex;align-items:baseline;justify-content:space-between;position:absolute;bottom:-1.7em;left:0;left:1.8em;right:2.5em;color:white;font-size:0.9em;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.country.svelte-oioy7h.svelte-oioy7h{text-overflow:ellipsis;padding-left:1em;overflow:hidden;text-align:right}.country-svg.svelte-oioy7h.svelte-oioy7h{vertical-align:-10%;opacity:0.6;mix-blend-mode:multiply}.category.svelte-oioy7h.svelte-oioy7h{font-weight:700}@media(max-width: 700px){.card-wrapper.svelte-oioy7h.svelte-oioy7h{font-size:0.8em}}",
	map: "{\"version\":3,\"file\":\"ListItem.svelte\",\"sources\":[\"ListItem.svelte\"],\"sourcesContent\":[\"<script>\\n  import { timeFormat } from \\\"d3-time-format\\\"\\n  import { parseDate, dateAccessor, countriesAccessor, countryAccessor, categoryAccessor, categoryColors, organizationAccessor, organizationLogos, ratingAccessor, ratingPaths, sourceAccessor, sourceColors, titleAccessor, urlAccessor, tagColors, tagsAccessor } from \\\"./data-utils\\\"\\n  import { getOrdinal } from \\\"./utils\\\"\\n\\n  // import flags from \\\"./flags/all.js\\\"\\n\\n  export let item\\n  // export let searchString\\n\\n  let isModal = false\\n\\n  const formatDate = date => [\\n    timeFormat(\\\"%B %-d\\\")(date),\\n    getOrdinal(+timeFormat(\\\"%-d\\\")(date)),\\n    \\\", \\\",\\n    timeFormat(\\\"%Y\\\")(date),\\n  ].join(\\\"\\\")\\n\\n  const getTitlePartsWithSearchString = (title, str) => {\\n    const index = title.toLowerCase().indexOf(str.toLowerCase())\\n    return index != -1 ? [\\n      title.slice(0, index),\\n      title.slice(index, index + str.length),\\n      title.slice(index + str.length),\\n    ] : title\\n  }\\n\\n  // $: titleParts = searchString\\n  //   ? getTitlePartsWithSearchString(titleAccessor(item), searchString)\\n  //   : titleAccessor(item, true).split(\\\"*\\\")\\n  $: titleParts = titleAccessor(item, true).split(\\\"*\\\")\\n\\n  $: category = categoryAccessor(item)\\n  $: tags = tagsAccessor(item)\\n  // $: color = tagColors[tags[0]] || \\\"#000\\\"\\n  $: color = \\\"#000\\\"\\n  // $: color = categoryColors[category] || \\\"#000\\\"\\n  $: matchingSources = sourceAccessor(item)\\n  $: rating = ratingAccessor(item) || \\\"?? \\\" + item.rating\\n  $: date = dateAccessor(item)\\n  $: org = organizationAccessor(item)\\n  $: orgLogo = organizationLogos[org]\\n  $: countries = countriesAccessor(item)\\n  $: url = urlAccessor(item)\\n\\n</script>\\n\\n\\n<div class=\\\"card-wrapper\\\" class:modal={isModal} style={`background: ${color}`}>\\n  <div class=\\\"card-contents\\\">\\n    <div class=\\\"card-contents-inner\\\">\\n      <a href={url} target=\\\"_blank\\\" class=\\\"title\\\">\\n        {#each titleParts as part, i}\\n          {#if i % 2}\\n            <b>\\n              { part }\\n            </b>\\n          {:else}\\n            { part }\\n          {/if}\\n        {/each}\\n      </a>\\n      <div class=\\\"date\\\">\\n        { formatDate(date) }\\n      </div>\\n  <!--\\n      {#each matchingSources as source}\\n        <div class=\\\"topic\\\" style={`color: ${typeColors[source]}`}>\\n          { source }\\n        </div>\\n      {/each} -->\\n      <!-- <div class=\\\"source\\\">\\n        { item.who }\\n      </div> -->\\n      <div class=\\\"rating\\\">\\n        <!-- <svg class=\\\"rating-svg\\\" width=\\\"1em\\\" viewBox=\\\"0 0 9 9\\\">\\n          {@html ratingPaths[rating] }\\n        </svg> -->\\n        { rating }\\n      </div>\\n\\n      <div class=\\\"row\\\">\\n        <div class=\\\"column\\\">\\n          <div class=\\\"label\\\">\\n            Fact checked by\\n          </div>\\n          {#if orgLogo}\\n            <img class=\\\"org-img\\\" src={orgLogo} alt={`${org} logo`} />\\n          {:else}\\n            { org }\\n          {/if}\\n        </div>\\n        {#if matchingSources.length}\\n          <div class=\\\"column\\\">\\n            <div class=\\\"label\\\">\\n              From\\n            </div>\\n            <div class=\\\"source\\\">\\n              {#each matchingSources as source, i}\\n                {#if i}, {/if}\\n                <b style={`color: ${sourceColors[source]}`}>\\n                  { source }\\n                </b>\\n              {/each}\\n            </div>\\n          </div>\\n        {/if}\\n      </div>\\n\\n      <div class=\\\"bottom-bar\\\">\\n        <!-- <div>\\n          { explanation }\\n        </div> -->\\n\\n        <div class=\\\"category\\\">\\n          { tags.join(\\\" & \\\") }\\n        </div>\\n\\n        <div class=\\\"country\\\">\\n          { countries.join(\\\" & \\\") }\\n          <svg class=\\\"country-svg\\\" width=\\\"1.2em\\\" height=\\\"1.2em\\\" viewBox=\\\"0 0 21 25\\\" fill=\\\"currentColor\\\">\\n            <path d=\\\"M9.75586 24.7598L9.74707 24.7529L9.72363 24.7373L9.64062 24.6807L9.33887 24.4668C9.08203 24.2812 8.71777 24.0098 8.28223 23.6631C7.70215 23.2012 6.99121 22.6016 6.23633 21.8887C5.86035 21.5332 5.47363 21.1494 5.08594 20.7402C2.7959 18.3232 0.311523 14.8301 0.311523 10.9277C0.311523 8.27539 1.36523 5.73242 3.24023 3.85645C5.11621 1.98145 7.65918 0.927734 10.3115 0.927734C12.9639 0.927734 15.5068 1.98145 17.3828 3.85645C19.2578 5.73242 20.3115 8.27539 20.3115 10.9277C20.3115 14.8301 17.8271 18.3232 15.5371 20.7402C14.8584 21.458 14.1797 22.0967 13.5596 22.6416C13.1162 23.0322 12.7031 23.374 12.3408 23.6631L11.9473 23.9707C11.6836 24.1738 11.459 24.3398 11.2842 24.4668L10.9824 24.6807L10.8994 24.7373L10.876 24.7529L10.8691 24.7578L10.8438 24.7227L10.8662 24.7598C10.5303 24.9834 10.0918 24.9834 9.75586 24.7598ZM10.3125 14.9277C12.5215 14.9277 14.3115 13.1377 14.3115 10.9287C14.3115 8.71973 12.5215 6.92871 10.3125 6.92871C8.10352 6.92871 6.3125 8.71973 6.3125 10.9287C6.3125 13.1377 8.10352 14.9277 10.3125 14.9277Z\\\" />\\n          </svg>\\n        </div>\\n      </div>\\n\\n      {#if isModal}\\n        <p>\\n          { item.Explanation }\\n        </p>\\n      {/if}\\n\\n    </div>\\n  </div>\\n</div>\\n\\n\\n<style>\\n  .card-wrapper {\\n    height: 100%;\\n    width: 100%;\\n    max-width: 90vw;\\n    transition: all 0.3s ease-out;\\n  }\\n  .card-wrapper.modal {\\n    position: fixed;\\n    width: 750px;\\n    height: auto;\\n\\n    z-index: 100;\\n    /* position: fixed;\\n    top: 10em;\\n    bottom: 10em;\\n    left: 50%;\\n    transform: translate(-50%, 0); */\\n  }\\n  .card-contents {\\n    height: 100%;\\n    width: 100%;\\n\\t\\tcolor: #1d1e24;\\n    background: white;\\n    border: 1px solid grey;\\n    /* box-shadow: -6px 6px 0 0 #000; */\\n    transform: translate(0.5em, -2.1em);\\n    transition: transform 0.2s ease-out;\\n  }\\n  .card-contents:hover {\\n    /* box-shadow: -9px 9px 0 0 #000; */\\n    transform: translate(0.7em, -2.4em);\\n  }\\n  .card-contents-inner {\\n    display: flex;\\n    flex-direction: column;\\n    height: 100%;\\n    padding: 1em 1.6em;\\n    color: inherit;\\n    text-decoration: none;\\n  }\\n  .title {\\n    position: relative;\\n    display: block;\\n    margin-top: 2em;\\n    font-size: 1.4em;\\n    line-height: 1.4em;\\n    /* font-family: Georgia, serif; */\\n    /* font-weight: 700; */\\n    color: inherit;\\n    text-decoration: none;\\n    margin-bottom: 0.5em;\\n    /* padding-bottom: 0.3em; */\\n    overflow: hidden;\\n    text-overflow: ellipsis;\\n    padding-right: 0.5em;\\n\\n    -webkit-line-clamp: var(--max-lines);\\n    display: -webkit-box;\\n    -webkit-box-orient: vertical;\\n    text-overflow: ellipsis;\\n\\n    --lh: 1.4em;\\n    max-height: calc(var(--lh) * var(--max-lines));\\n  }\\n  @supports not (-webkit-line-clamp: 4) {\\n    .title {\\n      --lh: 1.4em;\\n      max-height: calc(var(--lh) * var(--max-lines));\\n    }\\n    .title:before {\\n      /* content: \\\"\\\";\\n      position: absolute;\\n      left: 0;\\n      right: 0;\\n      bottom: 0;\\n      height: 0.6em;\\n      background: linear-gradient(\\n        to top,\\n        white 0%,\\n        transparent 100%\\n      );\\n      z-index: 5; */\\n\\n      position: absolute;\\n      content: \\\"...\\\";\\n      bottom: 0;\\n      right: 0.5em;\\n      z-index: 5;\\n    }\\n    .title:after {\\n      content: \\\"\\\";\\n      position: absolute;\\n      /*\\n      inset-inline-end: 0;\\n      */\\n      right: 0.5em;\\n      /* bottom: -0.5em; */\\n      /* missing bottom on purpose*/\\n      width: 1em;\\n      height: 1.5em;\\n      background: white;\\n      z-index: 10;\\n    }\\n  }\\n  .title b {\\n    background: #dfddfd;\\n    font-weight: 500;\\n  }\\n  .date {\\n    position: absolute;\\n    top: 1.3em;\\n    right: 1em;\\n    color: #8888a5;\\n    /* margin-bottom: 1em; */\\n  }\\n  .topic {\\n    margin-bottom: 0.5em;\\n  }\\n  .flag {\\n    display: inline-block;\\n    vertical-align: middle;\\n    margin-right: 0.3em;\\n    width: 2em;\\n    height: 1.4em;\\n  }\\n  .flag :global(svg) {\\n    width: 100%;\\n    height: 100%;\\n  }\\n  .rating {\\n    display: flex;\\n    align-items: center;\\n    position: absolute;\\n    top: -1.3em;\\n    top: 1em;\\n    left: 1em;\\n    left: -0.63em;\\n    padding: 0.6em 1em;\\n    padding-left: 2.4em;\\n    background: #1d1e24;\\n    color: white;\\n    font-size: 0.9em;\\n    font-weight: 700;\\n    text-transform: uppercase;\\n    letter-spacing: 0.1em;\\n  }\\n  .rating-svg {\\n    fill: white;\\n    /* margin-top: 0.3em; */\\n    margin-right: 0.5em;\\n    overflow: visible;\\n  }\\n  .row {\\n    display: flex;\\n    /* align-items: center; */\\n    justify-content: space-between;\\n    margin-top: 1em;\\n    margin-bottom: 0;\\n  }\\n  .column {\\n    /* display: flex; */\\n    /* margin-top: auto; */\\n    line-height: 2em;\\n  }\\n  .column:nth-of-type(2) {\\n    text-align: right;\\n  }\\n  .org-img {\\n    max-width: 10em;\\n    max-height: 2em;\\n    margin-top: 0.3em;\\n  }\\n  .label {\\n    padding-top: 0.3em;\\n    color: #8888a5;\\n    font-size: 0.7em;\\n    line-height: 1.3em;\\n    letter-spacing: 0.1em;\\n    text-transform: uppercase;\\n  }\\n  .bottom-bar {\\n    display: flex;\\n    /* align-items: center; */\\n    align-items: baseline;\\n    justify-content: space-between;\\n    position: absolute;\\n    bottom: -1.7em;\\n    left: 0;\\n    left: 1.8em;\\n    right: 2.5em;\\n    color: white;\\n    font-size: 0.9em;\\n    white-space: nowrap;\\n    text-overflow: ellipsis;\\n    overflow: hidden;\\n  }\\n  .country {\\n    text-overflow: ellipsis;\\n    padding-left: 1em;\\n    overflow: hidden;\\n    text-align: right;\\n  }\\n  .country-svg {\\n    vertical-align: -10%;\\n    opacity: 0.6;\\n    mix-blend-mode: multiply;\\n  }\\n  .category {\\n    font-weight: 700;\\n  }\\n\\n  @media (max-width: 700px) {\\n    .card-wrapper {\\n      font-size: 0.8em;\\n    }\\n  }\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0xpc3RJdGVtLnN2ZWx0ZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0VBQ0U7SUFDRSxZQUFZO0lBQ1osV0FBVztJQUNYLGVBQWU7SUFDZiw2QkFBNkI7RUFDL0I7RUFDQTtJQUNFLGVBQWU7SUFDZixZQUFZO0lBQ1osWUFBWTs7SUFFWixZQUFZO0lBQ1o7Ozs7b0NBSWdDO0VBQ2xDO0VBQ0E7SUFDRSxZQUFZO0lBQ1osV0FBVztFQUNiLGNBQWM7SUFDWixpQkFBaUI7SUFDakIsc0JBQXNCO0lBQ3RCLG1DQUFtQztJQUNuQyxtQ0FBbUM7SUFDbkMsbUNBQW1DO0VBQ3JDO0VBQ0E7SUFDRSxtQ0FBbUM7SUFDbkMsbUNBQW1DO0VBQ3JDO0VBQ0E7SUFDRSxhQUFhO0lBQ2Isc0JBQXNCO0lBQ3RCLFlBQVk7SUFDWixrQkFBa0I7SUFDbEIsY0FBYztJQUNkLHFCQUFxQjtFQUN2QjtFQUNBO0lBQ0Usa0JBQWtCO0lBQ2xCLGNBQWM7SUFDZCxlQUFlO0lBQ2YsZ0JBQWdCO0lBQ2hCLGtCQUFrQjtJQUNsQixpQ0FBaUM7SUFDakMsc0JBQXNCO0lBQ3RCLGNBQWM7SUFDZCxxQkFBcUI7SUFDckIsb0JBQW9CO0lBQ3BCLDJCQUEyQjtJQUMzQixnQkFBZ0I7SUFDaEIsdUJBQXVCO0lBQ3ZCLG9CQUFvQjs7SUFFcEIsb0NBQW9DO0lBQ3BDLG9CQUFvQjtJQUNwQiw0QkFBNEI7SUFDNUIsdUJBQXVCOztJQUV2QixXQUFXO0lBQ1gsOENBQThDO0VBQ2hEO0VBQ0E7SUFDRTtNQUNFLFdBQVc7TUFDWCw4Q0FBOEM7SUFDaEQ7SUFDQTtNQUNFOzs7Ozs7Ozs7OzttQkFXYTs7TUFFYixrQkFBa0I7TUFDbEIsY0FBYztNQUNkLFNBQVM7TUFDVCxZQUFZO01BQ1osVUFBVTtJQUNaO0lBQ0E7TUFDRSxXQUFXO01BQ1gsa0JBQWtCO01BQ2xCOztPQUVDO01BQ0QsWUFBWTtNQUNaLG9CQUFvQjtNQUNwQiw2QkFBNkI7TUFDN0IsVUFBVTtNQUNWLGFBQWE7TUFDYixpQkFBaUI7TUFDakIsV0FBVztJQUNiO0VBQ0Y7RUFDQTtJQUNFLG1CQUFtQjtJQUNuQixnQkFBZ0I7RUFDbEI7RUFDQTtJQUNFLGtCQUFrQjtJQUNsQixVQUFVO0lBQ1YsVUFBVTtJQUNWLGNBQWM7SUFDZCx3QkFBd0I7RUFDMUI7RUFDQTtJQUNFLG9CQUFvQjtFQUN0QjtFQUNBO0lBQ0UscUJBQXFCO0lBQ3JCLHNCQUFzQjtJQUN0QixtQkFBbUI7SUFDbkIsVUFBVTtJQUNWLGFBQWE7RUFDZjtFQUNBO0lBQ0UsV0FBVztJQUNYLFlBQVk7RUFDZDtFQUNBO0lBQ0UsYUFBYTtJQUNiLG1CQUFtQjtJQUNuQixrQkFBa0I7SUFDbEIsV0FBVztJQUNYLFFBQVE7SUFDUixTQUFTO0lBQ1QsYUFBYTtJQUNiLGtCQUFrQjtJQUNsQixtQkFBbUI7SUFDbkIsbUJBQW1CO0lBQ25CLFlBQVk7SUFDWixnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLHlCQUF5QjtJQUN6QixxQkFBcUI7RUFDdkI7RUFDQTtJQUNFLFdBQVc7SUFDWCx1QkFBdUI7SUFDdkIsbUJBQW1CO0lBQ25CLGlCQUFpQjtFQUNuQjtFQUNBO0lBQ0UsYUFBYTtJQUNiLHlCQUF5QjtJQUN6Qiw4QkFBOEI7SUFDOUIsZUFBZTtJQUNmLGdCQUFnQjtFQUNsQjtFQUNBO0lBQ0UsbUJBQW1CO0lBQ25CLHNCQUFzQjtJQUN0QixnQkFBZ0I7RUFDbEI7RUFDQTtJQUNFLGlCQUFpQjtFQUNuQjtFQUNBO0lBQ0UsZUFBZTtJQUNmLGVBQWU7SUFDZixpQkFBaUI7RUFDbkI7RUFDQTtJQUNFLGtCQUFrQjtJQUNsQixjQUFjO0lBQ2QsZ0JBQWdCO0lBQ2hCLGtCQUFrQjtJQUNsQixxQkFBcUI7SUFDckIseUJBQXlCO0VBQzNCO0VBQ0E7SUFDRSxhQUFhO0lBQ2IseUJBQXlCO0lBQ3pCLHFCQUFxQjtJQUNyQiw4QkFBOEI7SUFDOUIsa0JBQWtCO0lBQ2xCLGNBQWM7SUFDZCxPQUFPO0lBQ1AsV0FBVztJQUNYLFlBQVk7SUFDWixZQUFZO0lBQ1osZ0JBQWdCO0lBQ2hCLG1CQUFtQjtJQUNuQix1QkFBdUI7SUFDdkIsZ0JBQWdCO0VBQ2xCO0VBQ0E7SUFDRSx1QkFBdUI7SUFDdkIsaUJBQWlCO0lBQ2pCLGdCQUFnQjtJQUNoQixpQkFBaUI7RUFDbkI7RUFDQTtJQUNFLG9CQUFvQjtJQUNwQixZQUFZO0lBQ1osd0JBQXdCO0VBQzFCO0VBQ0E7SUFDRSxnQkFBZ0I7RUFDbEI7O0VBRUE7SUFDRTtNQUNFLGdCQUFnQjtJQUNsQjtFQUNGIiwiZmlsZSI6InNyYy9jb21wb25lbnRzL0xpc3RJdGVtLnN2ZWx0ZSIsInNvdXJjZXNDb250ZW50IjpbIlxuICAuY2FyZC13cmFwcGVyIHtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgbWF4LXdpZHRoOiA5MHZ3O1xuICAgIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2Utb3V0O1xuICB9XG4gIC5jYXJkLXdyYXBwZXIubW9kYWwge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB3aWR0aDogNzUwcHg7XG4gICAgaGVpZ2h0OiBhdXRvO1xuXG4gICAgei1pbmRleDogMTAwO1xuICAgIC8qIHBvc2l0aW9uOiBmaXhlZDtcbiAgICB0b3A6IDEwZW07XG4gICAgYm90dG9tOiAxMGVtO1xuICAgIGxlZnQ6IDUwJTtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAwKTsgKi9cbiAgfVxuICAuY2FyZC1jb250ZW50cyB7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIHdpZHRoOiAxMDAlO1xuXHRcdGNvbG9yOiAjMWQxZTI0O1xuICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkIGdyZXk7XG4gICAgLyogYm94LXNoYWRvdzogLTZweCA2cHggMCAwICMwMDA7ICovXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMC41ZW0sIC0yLjFlbSk7XG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgZWFzZS1vdXQ7XG4gIH1cbiAgLmNhcmQtY29udGVudHM6aG92ZXIge1xuICAgIC8qIGJveC1zaGFkb3c6IC05cHggOXB4IDAgMCAjMDAwOyAqL1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAuN2VtLCAtMi40ZW0pO1xuICB9XG4gIC5jYXJkLWNvbnRlbnRzLWlubmVyIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIHBhZGRpbmc6IDFlbSAxLjZlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gIH1cbiAgLnRpdGxlIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgbWFyZ2luLXRvcDogMmVtO1xuICAgIGZvbnQtc2l6ZTogMS40ZW07XG4gICAgbGluZS1oZWlnaHQ6IDEuNGVtO1xuICAgIC8qIGZvbnQtZmFtaWx5OiBHZW9yZ2lhLCBzZXJpZjsgKi9cbiAgICAvKiBmb250LXdlaWdodDogNzAwOyAqL1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICBtYXJnaW4tYm90dG9tOiAwLjVlbTtcbiAgICAvKiBwYWRkaW5nLWJvdHRvbTogMC4zZW07ICovXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgICBwYWRkaW5nLXJpZ2h0OiAwLjVlbTtcblxuICAgIC13ZWJraXQtbGluZS1jbGFtcDogdmFyKC0tbWF4LWxpbmVzKTtcbiAgICBkaXNwbGF5OiAtd2Via2l0LWJveDtcbiAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsO1xuICAgIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuXG4gICAgLS1saDogMS40ZW07XG4gICAgbWF4LWhlaWdodDogY2FsYyh2YXIoLS1saCkgKiB2YXIoLS1tYXgtbGluZXMpKTtcbiAgfVxuICBAc3VwcG9ydHMgbm90ICgtd2Via2l0LWxpbmUtY2xhbXA6IDQpIHtcbiAgICAudGl0bGUge1xuICAgICAgLS1saDogMS40ZW07XG4gICAgICBtYXgtaGVpZ2h0OiBjYWxjKHZhcigtLWxoKSAqIHZhcigtLW1heC1saW5lcykpO1xuICAgIH1cbiAgICAudGl0bGU6YmVmb3JlIHtcbiAgICAgIC8qIGNvbnRlbnQ6IFwiXCI7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICBsZWZ0OiAwO1xuICAgICAgcmlnaHQ6IDA7XG4gICAgICBib3R0b206IDA7XG4gICAgICBoZWlnaHQ6IDAuNmVtO1xuICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KFxuICAgICAgICB0byB0b3AsXG4gICAgICAgIHdoaXRlIDAlLFxuICAgICAgICB0cmFuc3BhcmVudCAxMDAlXG4gICAgICApO1xuICAgICAgei1pbmRleDogNTsgKi9cblxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgY29udGVudDogXCIuLi5cIjtcbiAgICAgIGJvdHRvbTogMDtcbiAgICAgIHJpZ2h0OiAwLjVlbTtcbiAgICAgIHotaW5kZXg6IDU7XG4gICAgfVxuICAgIC50aXRsZTphZnRlciB7XG4gICAgICBjb250ZW50OiBcIlwiO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgLypcbiAgICAgIGluc2V0LWlubGluZS1lbmQ6IDA7XG4gICAgICAqL1xuICAgICAgcmlnaHQ6IDAuNWVtO1xuICAgICAgLyogYm90dG9tOiAtMC41ZW07ICovXG4gICAgICAvKiBtaXNzaW5nIGJvdHRvbSBvbiBwdXJwb3NlKi9cbiAgICAgIHdpZHRoOiAxZW07XG4gICAgICBoZWlnaHQ6IDEuNWVtO1xuICAgICAgYmFja2dyb3VuZDogd2hpdGU7XG4gICAgICB6LWluZGV4OiAxMDtcbiAgICB9XG4gIH1cbiAgLnRpdGxlIGIge1xuICAgIGJhY2tncm91bmQ6ICNkZmRkZmQ7XG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgfVxuICAuZGF0ZSB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMS4zZW07XG4gICAgcmlnaHQ6IDFlbTtcbiAgICBjb2xvcjogIzg4ODhhNTtcbiAgICAvKiBtYXJnaW4tYm90dG9tOiAxZW07ICovXG4gIH1cbiAgLnRvcGljIHtcbiAgICBtYXJnaW4tYm90dG9tOiAwLjVlbTtcbiAgfVxuICAuZmxhZyB7XG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XG4gICAgbWFyZ2luLXJpZ2h0OiAwLjNlbTtcbiAgICB3aWR0aDogMmVtO1xuICAgIGhlaWdodDogMS40ZW07XG4gIH1cbiAgLmZsYWcgOmdsb2JhbChzdmcpIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gIH1cbiAgLnJhdGluZyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0b3A6IC0xLjNlbTtcbiAgICB0b3A6IDFlbTtcbiAgICBsZWZ0OiAxZW07XG4gICAgbGVmdDogLTAuNjNlbTtcbiAgICBwYWRkaW5nOiAwLjZlbSAxZW07XG4gICAgcGFkZGluZy1sZWZ0OiAyLjRlbTtcbiAgICBiYWNrZ3JvdW5kOiAjMWQxZTI0O1xuICAgIGNvbG9yOiB3aGl0ZTtcbiAgICBmb250LXNpemU6IDAuOWVtO1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICBsZXR0ZXItc3BhY2luZzogMC4xZW07XG4gIH1cbiAgLnJhdGluZy1zdmcge1xuICAgIGZpbGw6IHdoaXRlO1xuICAgIC8qIG1hcmdpbi10b3A6IDAuM2VtOyAqL1xuICAgIG1hcmdpbi1yaWdodDogMC41ZW07XG4gICAgb3ZlcmZsb3c6IHZpc2libGU7XG4gIH1cbiAgLnJvdyB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICAvKiBhbGlnbi1pdGVtczogY2VudGVyOyAqL1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICBtYXJnaW4tdG9wOiAxZW07XG4gICAgbWFyZ2luLWJvdHRvbTogMDtcbiAgfVxuICAuY29sdW1uIHtcbiAgICAvKiBkaXNwbGF5OiBmbGV4OyAqL1xuICAgIC8qIG1hcmdpbi10b3A6IGF1dG87ICovXG4gICAgbGluZS1oZWlnaHQ6IDJlbTtcbiAgfVxuICAuY29sdW1uOm50aC1vZi10eXBlKDIpIHtcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgfVxuICAub3JnLWltZyB7XG4gICAgbWF4LXdpZHRoOiAxMGVtO1xuICAgIG1heC1oZWlnaHQ6IDJlbTtcbiAgICBtYXJnaW4tdG9wOiAwLjNlbTtcbiAgfVxuICAubGFiZWwge1xuICAgIHBhZGRpbmctdG9wOiAwLjNlbTtcbiAgICBjb2xvcjogIzg4ODhhNTtcbiAgICBmb250LXNpemU6IDAuN2VtO1xuICAgIGxpbmUtaGVpZ2h0OiAxLjNlbTtcbiAgICBsZXR0ZXItc3BhY2luZzogMC4xZW07XG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgfVxuICAuYm90dG9tLWJhciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICAvKiBhbGlnbi1pdGVtczogY2VudGVyOyAqL1xuICAgIGFsaWduLWl0ZW1zOiBiYXNlbGluZTtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGJvdHRvbTogLTEuN2VtO1xuICAgIGxlZnQ6IDA7XG4gICAgbGVmdDogMS44ZW07XG4gICAgcmlnaHQ6IDIuNWVtO1xuICAgIGNvbG9yOiB3aGl0ZTtcbiAgICBmb250LXNpemU6IDAuOWVtO1xuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgfVxuICAuY291bnRyeSB7XG4gICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gICAgcGFkZGluZy1sZWZ0OiAxZW07XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgfVxuICAuY291bnRyeS1zdmcge1xuICAgIHZlcnRpY2FsLWFsaWduOiAtMTAlO1xuICAgIG9wYWNpdHk6IDAuNjtcbiAgICBtaXgtYmxlbmQtbW9kZTogbXVsdGlwbHk7XG4gIH1cbiAgLmNhdGVnb3J5IHtcbiAgICBmb250LXdlaWdodDogNzAwO1xuICB9XG5cbiAgQG1lZGlhIChtYXgtd2lkdGg6IDcwMHB4KSB7XG4gICAgLmNhcmQtd3JhcHBlciB7XG4gICAgICBmb250LXNpemU6IDAuOGVtO1xuICAgIH1cbiAgfVxuIl19 */</style>\"],\"names\":[],\"mappings\":\"AA2IE,aAAa,4BAAC,CAAC,AACb,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,QAAQ,AAC/B,CAAC,AACD,aAAa,MAAM,4BAAC,CAAC,AACnB,QAAQ,CAAE,KAAK,CACf,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,IAAI,CAEZ,OAAO,CAAE,GAAG,AAMd,CAAC,AACD,cAAc,4BAAC,CAAC,AACd,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACb,KAAK,CAAE,OAAO,CACZ,UAAU,CAAE,KAAK,CACjB,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,CAEtB,SAAS,CAAE,UAAU,KAAK,CAAC,CAAC,MAAM,CAAC,CACnC,UAAU,CAAE,SAAS,CAAC,IAAI,CAAC,QAAQ,AACrC,CAAC,AACD,0CAAc,MAAM,AAAC,CAAC,AAEpB,SAAS,CAAE,UAAU,KAAK,CAAC,CAAC,MAAM,CAAC,AACrC,CAAC,AACD,oBAAoB,4BAAC,CAAC,AACpB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,GAAG,CAAC,KAAK,CAClB,KAAK,CAAE,OAAO,CACd,eAAe,CAAE,IAAI,AACvB,CAAC,AACD,MAAM,4BAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,GAAG,CACf,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,KAAK,CAGlB,KAAK,CAAE,OAAO,CACd,eAAe,CAAE,IAAI,CACrB,aAAa,CAAE,KAAK,CAEpB,QAAQ,CAAE,MAAM,CAChB,aAAa,CAAE,QAAQ,CACvB,aAAa,CAAE,KAAK,CAEpB,kBAAkB,CAAE,IAAI,WAAW,CAAC,CACpC,OAAO,CAAE,WAAW,CACpB,kBAAkB,CAAE,QAAQ,CAC5B,aAAa,CAAE,QAAQ,CAEvB,IAAI,CAAE,KAAK,CACX,UAAU,CAAE,KAAK,IAAI,IAAI,CAAC,CAAC,CAAC,CAAC,IAAI,WAAW,CAAC,CAAC,AAChD,CAAC,AACD,UAAU,GAAG,CAAC,CAAC,mBAAmB,CAAC,CAAC,CAAC,AAAC,CAAC,AACrC,MAAM,4BAAC,CAAC,AACN,IAAI,CAAE,KAAK,CACX,UAAU,CAAE,KAAK,IAAI,IAAI,CAAC,CAAC,CAAC,CAAC,IAAI,WAAW,CAAC,CAAC,AAChD,CAAC,AACD,kCAAM,OAAO,AAAC,CAAC,AAcb,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,KAAK,CACZ,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,kCAAM,MAAM,AAAC,CAAC,AACZ,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAIlB,KAAK,CAAE,KAAK,CAGZ,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,KAAK,CACb,UAAU,CAAE,KAAK,CACjB,OAAO,CAAE,EAAE,AACb,CAAC,AACH,CAAC,AACD,oBAAM,CAAC,CAAC,cAAC,CAAC,AACR,UAAU,CAAE,OAAO,CACnB,WAAW,CAAE,GAAG,AAClB,CAAC,AACD,KAAK,4BAAC,CAAC,AACL,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,KAAK,CACV,KAAK,CAAE,GAAG,CACV,KAAK,CAAE,OAAO,AAEhB,CAAC,AAeD,OAAO,4BAAC,CAAC,AACP,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,MAAM,CACX,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CACT,IAAI,CAAE,OAAO,CACb,OAAO,CAAE,KAAK,CAAC,GAAG,CAClB,YAAY,CAAE,KAAK,CACnB,UAAU,CAAE,OAAO,CACnB,KAAK,CAAE,KAAK,CACZ,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,SAAS,CACzB,cAAc,CAAE,KAAK,AACvB,CAAC,AAOD,IAAI,4BAAC,CAAC,AACJ,OAAO,CAAE,IAAI,CAEb,eAAe,CAAE,aAAa,CAC9B,UAAU,CAAE,GAAG,CACf,aAAa,CAAE,CAAC,AAClB,CAAC,AACD,OAAO,4BAAC,CAAC,AAGP,WAAW,CAAE,GAAG,AAClB,CAAC,AACD,mCAAO,aAAa,CAAC,CAAC,AAAC,CAAC,AACtB,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,QAAQ,4BAAC,CAAC,AACR,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,GAAG,CACf,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,MAAM,4BAAC,CAAC,AACN,WAAW,CAAE,KAAK,CAClB,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,KAAK,CAClB,cAAc,CAAE,KAAK,CACrB,cAAc,CAAE,SAAS,AAC3B,CAAC,AACD,WAAW,4BAAC,CAAC,AACX,OAAO,CAAE,IAAI,CAEb,WAAW,CAAE,QAAQ,CACrB,eAAe,CAAE,aAAa,CAC9B,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,MAAM,CACd,IAAI,CAAE,CAAC,CACP,IAAI,CAAE,KAAK,CACX,KAAK,CAAE,KAAK,CACZ,KAAK,CAAE,KAAK,CACZ,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,MAAM,CACnB,aAAa,CAAE,QAAQ,CACvB,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,QAAQ,4BAAC,CAAC,AACR,aAAa,CAAE,QAAQ,CACvB,YAAY,CAAE,GAAG,CACjB,QAAQ,CAAE,MAAM,CAChB,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,YAAY,4BAAC,CAAC,AACZ,cAAc,CAAE,IAAI,CACpB,OAAO,CAAE,GAAG,CACZ,cAAc,CAAE,QAAQ,AAC1B,CAAC,AACD,SAAS,4BAAC,CAAC,AACT,WAAW,CAAE,GAAG,AAClB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,aAAa,4BAAC,CAAC,AACb,SAAS,CAAE,KAAK,AAClB,CAAC,AACH,CAAC\"}"
};

const ListItem = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { item } = $$props;

	const formatDate = date => [
		d3TimeFormat.timeFormat("%B %-d")(date),
		getOrdinal(+d3TimeFormat.timeFormat("%-d")(date)),
		", ",
		d3TimeFormat.timeFormat("%Y")(date)
	].join("");

	if ($$props.item === void 0 && $$bindings.item && item !== void 0) $$bindings.item(item);
	$$result.css.add(css);
	let titleParts = titleAccessor(item, true).split("*");
	let category = categoryAccessor(item);
	let tags = tagsAccessor(item);
	let color = "#000";
	let matchingSources = sourceAccessor(item);
	let rating = ratingAccessor(item) || "?? " + item.rating;
	let date = dateAccessor(item);
	let org = organizationAccessor(item);
	let orgLogo = organizationLogos[org];
	let countries = countriesAccessor(item);
	let url = urlAccessor(item);

	return `<div class="${["card-wrapper svelte-oioy7h",  ""].join(" ").trim()}"${add_attribute("style", `background: ${color}`, 0)}>
  <div class="${"card-contents svelte-oioy7h"}">
    <div class="${"card-contents-inner svelte-oioy7h"}">
      <a${add_attribute("href", url, 0)} target="${"_blank"}" class="${"title svelte-oioy7h"}">
        ${each(titleParts, (part, i) => `${i % 2
	? `<b class="${"svelte-oioy7h"}">
              ${escape(part)}
            </b>`
	: `${escape(part)}`}`)}
      </a>
      <div class="${"date svelte-oioy7h"}">
        ${escape(formatDate(date))}
      </div>
  
      
      <div class="${"rating svelte-oioy7h"}">
        
        ${escape(rating)}
      </div>

      <div class="${"row svelte-oioy7h"}">
        <div class="${"column svelte-oioy7h"}">
          <div class="${"label svelte-oioy7h"}">
            Fact checked by
          </div>
          ${orgLogo
	? `<img class="${"org-img svelte-oioy7h"}"${add_attribute("src", orgLogo, 0)}${add_attribute("alt", `${org} logo`, 0)}>`
	: `${escape(org)}`}
        </div>
        ${matchingSources.length
	? `<div class="${"column svelte-oioy7h"}">
            <div class="${"label svelte-oioy7h"}">
              From
            </div>
            <div class="${"source"}">
              ${each(matchingSources, (source, i) => `${i ? `,` : ``}
                <b${add_attribute("style", `color: ${sourceColors[source]}`, 0)}>
                  ${escape(source)}
                </b>`)}
            </div>
          </div>`
	: ``}
      </div>

      <div class="${"bottom-bar svelte-oioy7h"}">
        

        <div class="${"category svelte-oioy7h"}">
          ${escape(tags.join(" & "))}
        </div>

        <div class="${"country svelte-oioy7h"}">
          ${escape(countries.join(" & "))}
          <svg class="${"country-svg svelte-oioy7h"}" width="${"1.2em"}" height="${"1.2em"}" viewBox="${"0 0 21 25"}" fill="${"currentColor"}">
            <path d="${"M9.75586 24.7598L9.74707 24.7529L9.72363 24.7373L9.64062 24.6807L9.33887 24.4668C9.08203 24.2812 8.71777 24.0098 8.28223 23.6631C7.70215 23.2012 6.99121 22.6016 6.23633 21.8887C5.86035 21.5332 5.47363 21.1494 5.08594 20.7402C2.7959 18.3232 0.311523 14.8301 0.311523 10.9277C0.311523 8.27539 1.36523 5.73242 3.24023 3.85645C5.11621 1.98145 7.65918 0.927734 10.3115 0.927734C12.9639 0.927734 15.5068 1.98145 17.3828 3.85645C19.2578 5.73242 20.3115 8.27539 20.3115 10.9277C20.3115 14.8301 17.8271 18.3232 15.5371 20.7402C14.8584 21.458 14.1797 22.0967 13.5596 22.6416C13.1162 23.0322 12.7031 23.374 12.3408 23.6631L11.9473 23.9707C11.6836 24.1738 11.459 24.3398 11.2842 24.4668L10.9824 24.6807L10.8994 24.7373L10.876 24.7529L10.8691 24.7578L10.8438 24.7227L10.8662 24.7598C10.5303 24.9834 10.0918 24.9834 9.75586 24.7598ZM10.3125 14.9277C12.5215 14.9277 14.3115 13.1377 14.3115 10.9287C14.3115 8.71973 12.5215 6.92871 10.3125 6.92871C8.10352 6.92871 6.3125 8.71973 6.3125 10.9287C6.3125 13.1377 8.10352 14.9277 10.3125 14.9277Z"}"></path>
          </svg>
        </div>
      </div>

      ${ ``}

    </div>
  </div>
</div>`;
});

/* src/components/InterpolatedNumber.svelte generated by Svelte v3.19.1 */

const css$1 = {
	code: "sup.svelte-170j9ur{font-size:0.6em;line-height:0;vertical-align:super}.number.svelte-170j9ur{display:contents;font-feature-settings:\"cv02\", \"cv03\", \"cv04\", \"zero\" 1}",
	map: "{\"version\":3,\"file\":\"InterpolatedNumber.svelte\",\"sources\":[\"InterpolatedNumber.svelte\"],\"sourcesContent\":[\"<script>\\n  import { getOrdinal } from \\\"./utils.js\\\"\\n  import { format } from \\\"d3-format\\\"\\n  export let isOrdinal = false\\n  export let number = false\\n  export let numberFormat = \\\",.0f\\\"\\n\\n  const formatNumber = format(numberFormat)\\n</script>\\n\\n<span class=\\\"number\\\">\\n  {#if Number.isFinite(number)}\\n    { formatNumber(number) }{#if isOrdinal}\\n      <sup >{ getOrdinal(number) }</sup>\\n    {/if}\\n  {:else}\\n  -\\n  {/if}\\n</span>\\n\\n<style>\\n  sup {\\n    font-size: 0.6em;\\n    line-height: 0;\\n    vertical-align: super;\\n  }\\n  .number {\\n    display: contents;\\n    font-feature-settings: \\\"cv02\\\", \\\"cv03\\\", \\\"cv04\\\", \\\"zero\\\" 1;\\n  }\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0ludGVycG9sYXRlZE51bWJlci5zdmVsdGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtFQUNFO0lBQ0UsZ0JBQWdCO0lBQ2hCLGNBQWM7SUFDZCxxQkFBcUI7RUFDdkI7RUFDQTtJQUNFLGlCQUFpQjtJQUNqQix1REFBdUQ7RUFDekQiLCJmaWxlIjoic3JjL2NvbXBvbmVudHMvSW50ZXJwb2xhdGVkTnVtYmVyLnN2ZWx0ZSIsInNvdXJjZXNDb250ZW50IjpbIlxuICBzdXAge1xuICAgIGZvbnQtc2l6ZTogMC42ZW07XG4gICAgbGluZS1oZWlnaHQ6IDA7XG4gICAgdmVydGljYWwtYWxpZ246IHN1cGVyO1xuICB9XG4gIC5udW1iZXIge1xuICAgIGRpc3BsYXk6IGNvbnRlbnRzO1xuICAgIGZvbnQtZmVhdHVyZS1zZXR0aW5nczogXCJjdjAyXCIsIFwiY3YwM1wiLCBcImN2MDRcIiwgXCJ6ZXJvXCIgMTtcbiAgfVxuIl19 */</style>\"],\"names\":[],\"mappings\":\"AAqBE,GAAG,eAAC,CAAC,AACH,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,CAAC,CACd,cAAc,CAAE,KAAK,AACvB,CAAC,AACD,OAAO,eAAC,CAAC,AACP,OAAO,CAAE,QAAQ,CACjB,qBAAqB,CAAE,MAAM,CAAC,CAAC,MAAM,CAAC,CAAC,MAAM,CAAC,CAAC,MAAM,CAAC,CAAC,AACzD,CAAC\"}"
};

const InterpolatedNumber = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { isOrdinal = false } = $$props;
	let { number = false } = $$props;
	let { numberFormat = ",.0f" } = $$props;
	const formatNumber = d3Format.format(numberFormat);
	if ($$props.isOrdinal === void 0 && $$bindings.isOrdinal && isOrdinal !== void 0) $$bindings.isOrdinal(isOrdinal);
	if ($$props.number === void 0 && $$bindings.number && number !== void 0) $$bindings.number(number);
	if ($$props.numberFormat === void 0 && $$bindings.numberFormat && numberFormat !== void 0) $$bindings.numberFormat(numberFormat);
	$$result.css.add(css$1);

	return `<span class="${"number svelte-170j9ur"}">
  ${Number.isFinite(number)
	? `${escape(formatNumber(number))}${isOrdinal
		? `
      <sup class="${"svelte-170j9ur"}">${escape(getOrdinal(number))}</sup>`
		: ``}`
	: `-`}
</span>`;
});

/* src/components/Intro.svelte generated by Svelte v3.19.1 */

const css$2 = {
	code: ".c.svelte-n7ce1l.svelte-n7ce1l{display:flex;align-items:center;position:relative;max-width:80em;margin:0 auto;padding-top:3em;padding-bottom:5em}h1.svelte-n7ce1l.svelte-n7ce1l{font-weight:900;margin-bottom:0.6em;font-size:4em;line-height:1em}h1.svelte-n7ce1l b.svelte-n7ce1l{display:block;font-size:0.7em;line-height:1em;margin-top:0.1em}p.svelte-n7ce1l.svelte-n7ce1l{max-width:60em;margin:1em 0;font-size:1.3em;line-height:1.6em}.inline-link.svelte-n7ce1l.svelte-n7ce1l{color:inherit}.sticky.svelte-n7ce1l.svelte-n7ce1l{position:-webkit-sticky;position:sticky;top:0;padding:0.5em 3em 0.5em 0;background:#fff;font-size:1.2em;margin:0 3em;z-index:100}.scroll-list.svelte-n7ce1l.svelte-n7ce1l{padding:0.3em 0 1em}.scroll-list-item.svelte-n7ce1l.svelte-n7ce1l{position:relative;display:block;margin:0.2em 0 0.2em -1em;padding:0.6em 1em;font-size:1.2em;line-height:1.5em;color:inherit;text-decoration:none;border-radius:0.6em}.scroll-list-item.svelte-n7ce1l.svelte-n7ce1l:hover{background:white}.scroll-list-item-number.svelte-n7ce1l.svelte-n7ce1l{position:absolute;left:-0.3em;color:#8b87c5;font-size:0.7em;font-weight:700}.scroll-list-item-name.svelte-n7ce1l.svelte-n7ce1l{text-transform:uppercase;letter-spacing:0.16em;color:#8b87c5;font-size:0.7em;font-weight:700}.scroll-list-item-label.svelte-n7ce1l.svelte-n7ce1l{font-size:1.1em}.focus.svelte-n7ce1l.svelte-n7ce1l{position:relative;display:flex;flex:1;height:34em;margin:3em 0 0;overflow:hidden}.focus.svelte-n7ce1l.svelte-n7ce1l:before{content:\"\";position:absolute;top:0;left:0;right:0;height:7em;background:linear-gradient(\n      to bottom,\n      #fff 30%,\n      rgba(244, 245, 250, 0.01) 100%\n    );z-index:100;pointer-events:none}.focus.svelte-n7ce1l.svelte-n7ce1l:after{content:\"\";position:absolute;bottom:0;left:0;right:0;height:5em;background:linear-gradient(\n      to top,\n      #fff 0%,\n      rgba(244, 245, 250, 0.01) 100%\n    );z-index:100;pointer-events:none}.loading.svelte-n7ce1l.svelte-n7ce1l{position:absolute;top:50%;left:50%;text-align:center;opacity:0.6;font-style:italic;transform:translate(-50%, -50%)}.focus-title.svelte-n7ce1l.svelte-n7ce1l{position:absolute;top:0;left:50%;text-align:center;font-weight:700;transform:translateX(-50%);z-index:200}.focus-title.svelte-n7ce1l a.svelte-n7ce1l{position:absolute;right:-3.5em;top:-0.3em;margin-top:0.3em;font-weight:500;opacity:0.6;color:inherit}.list-item.svelte-n7ce1l.svelte-n7ce1l{position:absolute;top:50%;left:50%;height:16.4em;text-align:left;width:33em;transform:translate(-50%, -50%);transition:all 0.5s ease-out;font-size:0.9em;pointer-events:all;cursor:pointer;--max-lines:4}.list-item.svelte-n7ce1l.svelte-n7ce1l .card-wrapper{width:100%;pointer-events:none}.list-item--0.svelte-n7ce1l.svelte-n7ce1l{opacity:0;transform:translate(-50%, -275%)}.list-item--1.svelte-n7ce1l.svelte-n7ce1l{opacity:0.6;transform:translate(-50%, -175%)}.list-item--2.svelte-n7ce1l.svelte-n7ce1l{z-index:10;pointer-events:none}.list-item--3.svelte-n7ce1l.svelte-n7ce1l{opacity:0.6;transform:translate(-50%, 75%)}.list-item--4.svelte-n7ce1l.svelte-n7ce1l{opacity:0;transform:translate(-50%, 175%)}.text.svelte-n7ce1l.svelte-n7ce1l{text-align:left;padding:1em 3em;flex:1}@media(max-width: 1155px){.c.svelte-n7ce1l.svelte-n7ce1l{flex-direction:column}.focus.svelte-n7ce1l.svelte-n7ce1l{height:30em;width:100%;flex:none}.focus.svelte-n7ce1l.svelte-n7ce1l:before{left:0;bottom:0;right:auto;height:auto;width:5vw;background:linear-gradient(\n        to right,\n        #fff -10%,\n        rgba(244, 245, 250, 0.01) 100%\n      )}.focus.svelte-n7ce1l.svelte-n7ce1l:after{left:auto;top:0;right:0;height:auto;width:5vw;background:linear-gradient(\n        to left,\n        #fff -10%,\n        rgba(244, 245, 250, 0.01) 100%\n      )}.list-item.svelte-n7ce1l.svelte-n7ce1l{height:auto;top:6em;width:88vw}.list-item--0.svelte-n7ce1l.svelte-n7ce1l{transform:translate(-270%, 0)}.list-item--1.svelte-n7ce1l.svelte-n7ce1l{opacity:1;transform:translate(-152%, 0)}.list-item--2.svelte-n7ce1l.svelte-n7ce1l{transform:translate(-50%, 0)}.list-item--3.svelte-n7ce1l.svelte-n7ce1l{opacity:1;transform:translate(52%, 0)}.list-item--4.svelte-n7ce1l.svelte-n7ce1l{transform:translate(170%, 0)}}@media(max-width: 700px){h1.svelte-n7ce1l.svelte-n7ce1l{font-size:2.3em}p.svelte-n7ce1l.svelte-n7ce1l{font-size:1em}.scroll-list-item.svelte-n7ce1l.svelte-n7ce1l{font-size:1em}}",
	map: "{\"version\":3,\"file\":\"Intro.svelte\",\"sources\":[\"Intro.svelte\"],\"sourcesContent\":[\"<script>\\n  import { onMount } from \\\"svelte\\\"\\n  import { draw, fade } from \\\"svelte/transition\\\"\\n\\n  import ListItem from \\\"./ListItem.svelte\\\"\\n  import InterpolatedNumber from \\\"./InterpolatedNumber.svelte\\\"\\n  import { dateAccessor, titleAccessor, categories, categoryColors } from \\\"./data-utils\\\"\\n  import { smoothScrollTo } from \\\"./utils\\\"\\n\\n  export let data\\n  export let isLoading\\n\\n  let focusedIndex = 1\\n  let isHovering = false\\n\\n  const windowGlobal = typeof window !== \\\"undefined\\\" && window\\n  onMount(() => {\\n    const interval = setInterval(() => {\\n      if (isHovering) return\\n      if (!data.length) return\\n      focusedIndex = Math.min(data.length - 1, focusedIndex + 1)\\n    }, 3000)\\n\\n    return () => {\\n      clearInterval(interval)\\n    }\\n  })\\n\\n  $: factChecksByDate = [...data]\\n    .sort((a,b) => dateAccessor(b) - dateAccessor(a))\\n    .map((d,i) => ({\\n      ...d,\\n      id: i,\\n    }))\\n  $: lastFactChecks = [{}, {}, ...factChecksByDate]\\n    .slice(\\n      focusedIndex,\\n      focusedIndex + 5\\n    )\\n\\n\\tconst scrollOptions = [\\n    [\\\"categories\\\", \\\"What categories of false claims are being spread?\\\"],\\n\\t\\t[\\\"countries\\\", \\\"Where are the false claims coming from?\\\"],\\n\\t\\t[\\\"list\\\", \\\"See all of the claims\\\"],\\n  ]\\n\\n  const scrollToSection = id => {\\n    const sectionElement = document.getElementById(id)\\n    if (!sectionElement) return\\n\\n    const onEnd = () => {\\n      if (!windowGlobal) return\\n      windowGlobal.location.href = `#${id}`\\n    }\\n\\n    smoothScrollTo(\\n      sectionElement.offsetTop - 200,\\n      500,\\n      undefined,\\n      onEnd,\\n    )\\n    // sectionElement.scrollIntoView({\\n    //   behavior: 'smooth',\\n    // })\\n  }\\n</script>\\n\\n<div class=\\\"c\\\">\\n\\n  <div class=\\\"text\\\">\\n    <h1>\\n      COVID-19\\n      <b>Misinformation Explorer</b>\\n    </h1>\\n    <!-- <h2>\\n      Understand what false claims are spreading; what you may have unknowingly read.\\n    </h2> -->\\n    <p>\\n      We compiled <InterpolatedNumber number={data.length || 1800} /> fact checks from over <a href=\\\"#footer\\\" class=\\\"inline-link\\\" on:click={() => scrollToSection(\\\"footer\\\")}>100 organizations</a> around the world to combat misinformation about Covid-19.\\n    </p>\\n\\n    <p>\\n      Explore to find what false claims are being made about Covid-19 and where they're being spread.\\n    </p>\\n\\n    <div class=\\\"scroll-list\\\">\\n      {#each scrollOptions as [id, option], i}\\n        <a href={`#${id}`} class=\\\"scroll-list-item\\\" on:click|preventDefault={() => scrollToSection(id)}>\\n          <div class=\\\"scroll-list-item-number\\\">\\n            { i + 1 }\\n          </div>\\n          <div class=\\\"scroll-list-item-name\\\">\\n            { id }\\n          </div>\\n          <div class=\\\"scroll-list-item-label\\\">\\n            { option }\\n          </div>\\n        </a>\\n      {/each}\\n    </div>\\n    <!-- <div class=\\\"orgs\\\">\\n      {#each organizations as organization}\\n        <div class=\\\"org\\\">\\n          { organization }\\n        </div>\\n      {/each}\\n    </div> -->\\n  </div>\\n\\n  <div class=\\\"focus\\\" on:mouseover={() => isHovering = true} on:mouseleave={() => isHovering = false}>\\n    {#if isLoading}\\n      <div class=\\\"loading\\\">\\n        Loading fact checks...\\n      </div>\\n    {/if}\\n    <div class=\\\"focus-title\\\">\\n      Newest fact checks\\n      <br />\\n      <a href=\\\"#list\\\" on:click={() => scrollToSection(\\\"list\\\")}>See all</a>\\n    </div>\\n    {#each lastFactChecks as item, i (item.id || `null-${i}`)}\\n      {#if item.id}\\n        <div class={`list-item list-item--${i}`} on:click={() => focusedIndex = Math.min(data.length - 1, Math.max(0, focusedIndex + (i - 2)))}>\\n          <ListItem\\n            {item}\\n          />\\n        </div>\\n      {/if}\\n    {/each}\\n  </div>\\n  <!-- <div class=\\\"grid\\\">\\n    {#each lastFactChecks as item, i}\\n      <div class=\\\"grid-item\\\" transition:fade={{ duration: 2000, delay: i * 100 }}>\\n        <ListItem\\n          {item}\\n        />\\n      </div>\\n    {/each}\\n  </div> -->\\n\\n</div>\\n\\n<!-- <div class=\\\"sticky\\\">\\n  {#each categories as category, i}\\n    {\\n      !i                           ? \\\"\\\"       :\\n      i == (categories.length - 1) ? \\\", and \\\" :\\n                                     \\\", \\\"\\n    }\\n    <span style={`color: ${categoryColors[category]}`}>\\n      { category }\\n    </span>\\n  {/each}\\n</div> -->\\n\\n<style>\\n  .c {\\n    display: flex;\\n    align-items: center;\\n    position: relative;\\n    max-width: 80em;\\n    margin: 0 auto;\\n    padding-top: 3em;\\n    padding-bottom: 5em;\\n  }\\n  h1 {\\n\\t\\t/* font-size: 3em;\\n\\t\\tline-height: 1.6em; */\\n\\t\\tfont-weight: 900;\\n\\t\\t/* max-width: 90%; */\\n\\t\\tmargin-bottom: 0.6em;\\n\\t\\t/* font-weight: 900; */\\n\\t\\tfont-size: 4em;\\n\\t\\tline-height: 1em;\\n\\t}\\n  h1 b {\\n    display: block;\\n    font-size: 0.7em;\\n    line-height: 1em;\\n    margin-top: 0.1em;\\n    /* font-weight: 300; */\\n    /* white-space: nowrap; */\\n  }\\n\\th2 {\\n\\t\\tfont-weight: 300;\\n\\t\\tfont-size: 2.3em;\\n\\t\\tline-height: 1.3em;\\n\\t\\tcolor: #888ca1;\\n\\t\\tmax-width: 30em;\\n\\t}\\n\\th3 {\\n\\t\\tfont-size: 2.3em;\\n\\t\\tline-height: 1.1em;\\n\\t\\tfont-weight: 500;\\n\\t\\tmax-width: 90%;\\n\\t\\tmargin-bottom: 1.2em;\\n\\t}\\n\\n\\tp {\\n\\t\\tmax-width: 60em;\\n\\t\\tmargin: 1em 0;\\n\\t\\tfont-size: 1.3em;\\n\\t\\tline-height: 1.6em;\\n  }\\n\\n  .inline-link {\\n    color: inherit;\\n  }\\n\\n  .sticky {\\n    position: -webkit-sticky;\\n    position: sticky;\\n    top: 0;\\n    /* left: 50%;\\n    transform: translateX(-50%); */\\n    padding: 0.5em 3em 0.5em 0;\\n    background: #fff;\\n    font-size: 1.2em;\\n    /* max-width: 100%; */\\n    /* width: 80em; */\\n    margin: 0 3em;\\n    z-index: 100;\\n  }\\n  .scroll-list {\\n    padding: 0.3em 0 1em;\\n  }\\n  .scroll-list-item {\\n    position: relative;\\n    display: block;\\n    margin: 0.2em 0 0.2em -1em;\\n    padding: 0.6em 1em;\\n    font-size: 1.2em;\\n    line-height: 1.5em;\\n    color: inherit;\\n    text-decoration: none;\\n    border-radius: 0.6em;\\n  }\\n  .scroll-list-item:hover {\\n    background: white;\\n  }\\n  .scroll-list-item-number {\\n    position: absolute;\\n    /* top: 50%; */\\n    /* margin-top: -0.2em; */\\n    left: -0.3em;\\n    color: #8b87c5;\\n    font-size: 0.7em;\\n    font-weight: 700;\\n    /* opacity: 0; */\\n    /* transform: translateY(-50%); */\\n  }\\n  .scroll-list-item-name {\\n    text-transform: uppercase;\\n    letter-spacing: 0.16em;\\n    color: #8b87c5;\\n    font-size: 0.7em;\\n    font-weight: 700;\\n  }\\n  .scroll-list-item-label {\\n    font-size: 1.1em;\\n  }\\n\\n\\n\\t/* .orgs {\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: center;\\n\\t\\tflex-wrap: wrap;\\n\\t\\tmax-width: 80em;\\n\\t\\tmargin-bottom: 2em;\\n\\t}\\n\\t.org {\\n\\t\\tmargin: 0.5em 1em;\\n\\t\\tfont-size: 0.7em;\\n\\t\\tline-height: 1.1em;\\n\\t\\topacity: 0.4;\\n\\t} */\\n  .focus {\\n    position: relative;\\n    display: flex;\\n    flex: 1;\\n    height: 34em;\\n    margin: 3em 0 0;\\n    overflow: hidden;\\n  }\\n  .focus:before {\\n    content: \\\"\\\";\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n    right: 0;\\n    height: 7em;\\n    background: linear-gradient(\\n      to bottom,\\n      #fff 30%,\\n      rgba(244, 245, 250, 0.01) 100%\\n    );\\n    z-index: 100;\\n    pointer-events: none;\\n  }\\n  .focus:after {\\n    content: \\\"\\\";\\n    position: absolute;\\n    bottom: 0;\\n    left: 0;\\n    right: 0;\\n    height: 5em;\\n    background: linear-gradient(\\n      to top,\\n      #fff 0%,\\n      rgba(244, 245, 250, 0.01) 100%\\n    );\\n    z-index: 100;\\n    pointer-events: none;\\n  }\\n  .loading {\\n    position: absolute;\\n    top: 50%;\\n    left: 50%;\\n    /* font-weight: 700; */\\n    text-align: center;\\n    opacity: 0.6;\\n    font-style: italic;\\n    transform: translate(-50%, -50%);\\n  }\\n  .focus-title {\\n    position: absolute;\\n    top: 0;\\n    left: 50%;\\n    text-align: center;\\n    font-weight: 700;\\n    /* text-transform: uppercase;\\n    letter-spacing: 0.1em; */\\n    transform: translateX(-50%);\\n    z-index: 200;\\n  }\\n  .focus-title a {\\n    position: absolute;\\n    right: -3.5em;\\n    top: -0.3em;\\n    margin-top: 0.3em;\\n    font-weight: 500;\\n    /* font-size: 0.9em; */\\n    opacity: 0.6;\\n    color: inherit;\\n  }\\n  .list-item {\\n    position: absolute;\\n    top: 50%;\\n    left: 50%;\\n    height: 16.4em;\\n    text-align: left;\\n    width: 33em;\\n    transform: translate(-50%, -50%);\\n    transition: all 0.5s ease-out;\\n    font-size: 0.9em;\\n    pointer-events: all;\\n    cursor: pointer;\\n    --max-lines: 4;\\n  }\\n  .list-item :global(.card-wrapper) {\\n    width: 100%;\\n    pointer-events: none;\\n  }\\n  .list-item--0 {\\n    opacity: 0;\\n    transform: translate(-50%, -275%);\\n  }\\n  .list-item--1 {\\n    opacity: 0.6;\\n    transform: translate(-50%, -175%);\\n  }\\n  .list-item--2 {\\n    z-index: 10;\\n    pointer-events: none;\\n  }\\n  .list-item--3 {\\n    opacity: 0.6;\\n    transform: translate(-50%, 75%);\\n  }\\n  .list-item--4 {\\n    opacity: 0;\\n    transform: translate(-50%, 175%);\\n  }\\n  .text {\\n    /* padding: 0 20em; */\\n    text-align: left;\\n    padding: 1em 3em;\\n    flex: 1;\\n  }\\n  @media (max-width: 1155px) {\\n    .c {\\n      flex-direction: column;\\n    }\\n    .focus {\\n      height: 30em;\\n      width: 100%;\\n      flex: none;\\n    }\\n    .focus:before {\\n      left: 0;\\n      bottom: 0;\\n      right: auto;\\n      height: auto;\\n      width: 5vw;\\n      background: linear-gradient(\\n        to right,\\n        #fff -10%,\\n        rgba(244, 245, 250, 0.01) 100%\\n      );\\n    }\\n    .focus:after {\\n      left: auto;\\n      top: 0;\\n      right: 0;\\n      height: auto;\\n      width: 5vw;\\n      background: linear-gradient(\\n        to left,\\n        #fff -10%,\\n        rgba(244, 245, 250, 0.01) 100%\\n      );\\n    }\\n\\n    .list-item {\\n      height: auto;\\n      top: 6em;\\n      width: 88vw;\\n    }\\n    .list-item--0 {\\n      transform: translate(-270%, 0);\\n    }\\n    .list-item--1 {\\n      opacity: 1;\\n      transform: translate(-152%, 0);\\n    }\\n    .list-item--2 {\\n      transform: translate(-50%, 0);\\n    }\\n    .list-item--3 {\\n      opacity: 1;\\n      transform: translate(52%, 0);\\n    }\\n    .list-item--4 {\\n      transform: translate(170%, 0);\\n    }\\n  }\\n  @media (max-width: 700px) {\\n    h1 {\\n      font-size: 2.3em;\\n    }\\n    p {\\n      font-size: 1em;\\n    }\\n    .scroll-list-item {\\n      font-size: 1em;\\n    }\\n  }\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0ludHJvLnN2ZWx0ZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0VBQ0U7SUFDRSxhQUFhO0lBQ2IsbUJBQW1CO0lBQ25CLGtCQUFrQjtJQUNsQixlQUFlO0lBQ2YsY0FBYztJQUNkLGdCQUFnQjtJQUNoQixtQkFBbUI7RUFDckI7RUFDQTtFQUNBO3VCQUNxQjtFQUNyQixnQkFBZ0I7RUFDaEIsb0JBQW9CO0VBQ3BCLG9CQUFvQjtFQUNwQixzQkFBc0I7RUFDdEIsY0FBYztFQUNkLGdCQUFnQjtDQUNqQjtFQUNDO0lBQ0UsY0FBYztJQUNkLGdCQUFnQjtJQUNoQixnQkFBZ0I7SUFDaEIsaUJBQWlCO0lBQ2pCLHNCQUFzQjtJQUN0Qix5QkFBeUI7RUFDM0I7Q0FDRDtFQUNDLGdCQUFnQjtFQUNoQixnQkFBZ0I7RUFDaEIsa0JBQWtCO0VBQ2xCLGNBQWM7RUFDZCxlQUFlO0NBQ2hCO0NBQ0E7RUFDQyxnQkFBZ0I7RUFDaEIsa0JBQWtCO0VBQ2xCLGdCQUFnQjtFQUNoQixjQUFjO0VBQ2Qsb0JBQW9CO0NBQ3JCOztDQUVBO0VBQ0MsZUFBZTtFQUNmLGFBQWE7RUFDYixnQkFBZ0I7RUFDaEIsa0JBQWtCO0VBQ2xCOztFQUVBO0lBQ0UsY0FBYztFQUNoQjs7RUFFQTtJQUNFLHdCQUFnQjtJQUFoQixnQkFBZ0I7SUFDaEIsTUFBTTtJQUNOO2tDQUM4QjtJQUM5QiwwQkFBMEI7SUFDMUIsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQixxQkFBcUI7SUFDckIsaUJBQWlCO0lBQ2pCLGFBQWE7SUFDYixZQUFZO0VBQ2Q7RUFDQTtJQUNFLG9CQUFvQjtFQUN0QjtFQUNBO0lBQ0Usa0JBQWtCO0lBQ2xCLGNBQWM7SUFDZCwwQkFBMEI7SUFDMUIsa0JBQWtCO0lBQ2xCLGdCQUFnQjtJQUNoQixrQkFBa0I7SUFDbEIsY0FBYztJQUNkLHFCQUFxQjtJQUNyQixvQkFBb0I7RUFDdEI7RUFDQTtJQUNFLGlCQUFpQjtFQUNuQjtFQUNBO0lBQ0Usa0JBQWtCO0lBQ2xCLGNBQWM7SUFDZCx3QkFBd0I7SUFDeEIsWUFBWTtJQUNaLGNBQWM7SUFDZCxnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQixpQ0FBaUM7RUFDbkM7RUFDQTtJQUNFLHlCQUF5QjtJQUN6QixzQkFBc0I7SUFDdEIsY0FBYztJQUNkLGdCQUFnQjtJQUNoQixnQkFBZ0I7RUFDbEI7RUFDQTtJQUNFLGdCQUFnQjtFQUNsQjs7O0NBR0Q7Ozs7Ozs7Ozs7Ozs7SUFhRztFQUNGO0lBQ0Usa0JBQWtCO0lBQ2xCLGFBQWE7SUFDYixPQUFPO0lBQ1AsWUFBWTtJQUNaLGVBQWU7SUFDZixnQkFBZ0I7RUFDbEI7RUFDQTtJQUNFLFdBQVc7SUFDWCxrQkFBa0I7SUFDbEIsTUFBTTtJQUNOLE9BQU87SUFDUCxRQUFRO0lBQ1IsV0FBVztJQUNYOzs7O0tBSUM7SUFDRCxZQUFZO0lBQ1osb0JBQW9CO0VBQ3RCO0VBQ0E7SUFDRSxXQUFXO0lBQ1gsa0JBQWtCO0lBQ2xCLFNBQVM7SUFDVCxPQUFPO0lBQ1AsUUFBUTtJQUNSLFdBQVc7SUFDWDs7OztLQUlDO0lBQ0QsWUFBWTtJQUNaLG9CQUFvQjtFQUN0QjtFQUNBO0lBQ0Usa0JBQWtCO0lBQ2xCLFFBQVE7SUFDUixTQUFTO0lBQ1Qsc0JBQXNCO0lBQ3RCLGtCQUFrQjtJQUNsQixZQUFZO0lBQ1osa0JBQWtCO0lBQ2xCLGdDQUFnQztFQUNsQztFQUNBO0lBQ0Usa0JBQWtCO0lBQ2xCLE1BQU07SUFDTixTQUFTO0lBQ1Qsa0JBQWtCO0lBQ2xCLGdCQUFnQjtJQUNoQjs0QkFDd0I7SUFDeEIsMkJBQTJCO0lBQzNCLFlBQVk7RUFDZDtFQUNBO0lBQ0Usa0JBQWtCO0lBQ2xCLGFBQWE7SUFDYixXQUFXO0lBQ1gsaUJBQWlCO0lBQ2pCLGdCQUFnQjtJQUNoQixzQkFBc0I7SUFDdEIsWUFBWTtJQUNaLGNBQWM7RUFDaEI7RUFDQTtJQUNFLGtCQUFrQjtJQUNsQixRQUFRO0lBQ1IsU0FBUztJQUNULGNBQWM7SUFDZCxnQkFBZ0I7SUFDaEIsV0FBVztJQUNYLGdDQUFnQztJQUNoQyw2QkFBNkI7SUFDN0IsZ0JBQWdCO0lBQ2hCLG1CQUFtQjtJQUNuQixlQUFlO0lBQ2YsY0FBYztFQUNoQjtFQUNBO0lBQ0UsV0FBVztJQUNYLG9CQUFvQjtFQUN0QjtFQUNBO0lBQ0UsVUFBVTtJQUNWLGlDQUFpQztFQUNuQztFQUNBO0lBQ0UsWUFBWTtJQUNaLGlDQUFpQztFQUNuQztFQUNBO0lBQ0UsV0FBVztJQUNYLG9CQUFvQjtFQUN0QjtFQUNBO0lBQ0UsWUFBWTtJQUNaLCtCQUErQjtFQUNqQztFQUNBO0lBQ0UsVUFBVTtJQUNWLGdDQUFnQztFQUNsQztFQUNBO0lBQ0UscUJBQXFCO0lBQ3JCLGdCQUFnQjtJQUNoQixnQkFBZ0I7SUFDaEIsT0FBTztFQUNUO0VBQ0E7SUFDRTtNQUNFLHNCQUFzQjtJQUN4QjtJQUNBO01BQ0UsWUFBWTtNQUNaLFdBQVc7TUFDWCxVQUFVO0lBQ1o7SUFDQTtNQUNFLE9BQU87TUFDUCxTQUFTO01BQ1QsV0FBVztNQUNYLFlBQVk7TUFDWixVQUFVO01BQ1Y7Ozs7T0FJQztJQUNIO0lBQ0E7TUFDRSxVQUFVO01BQ1YsTUFBTTtNQUNOLFFBQVE7TUFDUixZQUFZO01BQ1osVUFBVTtNQUNWOzs7O09BSUM7SUFDSDs7SUFFQTtNQUNFLFlBQVk7TUFDWixRQUFRO01BQ1IsV0FBVztJQUNiO0lBQ0E7TUFDRSw4QkFBOEI7SUFDaEM7SUFDQTtNQUNFLFVBQVU7TUFDViw4QkFBOEI7SUFDaEM7SUFDQTtNQUNFLDZCQUE2QjtJQUMvQjtJQUNBO01BQ0UsVUFBVTtNQUNWLDRCQUE0QjtJQUM5QjtJQUNBO01BQ0UsNkJBQTZCO0lBQy9CO0VBQ0Y7RUFDQTtJQUNFO01BQ0UsZ0JBQWdCO0lBQ2xCO0lBQ0E7TUFDRSxjQUFjO0lBQ2hCO0lBQ0E7TUFDRSxjQUFjO0lBQ2hCO0VBQ0YiLCJmaWxlIjoic3JjL2NvbXBvbmVudHMvSW50cm8uc3ZlbHRlIiwic291cmNlc0NvbnRlbnQiOlsiXG4gIC5jIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIG1heC13aWR0aDogODBlbTtcbiAgICBtYXJnaW46IDAgYXV0bztcbiAgICBwYWRkaW5nLXRvcDogM2VtO1xuICAgIHBhZGRpbmctYm90dG9tOiA1ZW07XG4gIH1cbiAgaDEge1xuXHRcdC8qIGZvbnQtc2l6ZTogM2VtO1xuXHRcdGxpbmUtaGVpZ2h0OiAxLjZlbTsgKi9cblx0XHRmb250LXdlaWdodDogOTAwO1xuXHRcdC8qIG1heC13aWR0aDogOTAlOyAqL1xuXHRcdG1hcmdpbi1ib3R0b206IDAuNmVtO1xuXHRcdC8qIGZvbnQtd2VpZ2h0OiA5MDA7ICovXG5cdFx0Zm9udC1zaXplOiA0ZW07XG5cdFx0bGluZS1oZWlnaHQ6IDFlbTtcblx0fVxuICBoMSBiIHtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBmb250LXNpemU6IDAuN2VtO1xuICAgIGxpbmUtaGVpZ2h0OiAxZW07XG4gICAgbWFyZ2luLXRvcDogMC4xZW07XG4gICAgLyogZm9udC13ZWlnaHQ6IDMwMDsgKi9cbiAgICAvKiB3aGl0ZS1zcGFjZTogbm93cmFwOyAqL1xuICB9XG5cdGgyIHtcblx0XHRmb250LXdlaWdodDogMzAwO1xuXHRcdGZvbnQtc2l6ZTogMi4zZW07XG5cdFx0bGluZS1oZWlnaHQ6IDEuM2VtO1xuXHRcdGNvbG9yOiAjODg4Y2ExO1xuXHRcdG1heC13aWR0aDogMzBlbTtcblx0fVxuXHRoMyB7XG5cdFx0Zm9udC1zaXplOiAyLjNlbTtcblx0XHRsaW5lLWhlaWdodDogMS4xZW07XG5cdFx0Zm9udC13ZWlnaHQ6IDUwMDtcblx0XHRtYXgtd2lkdGg6IDkwJTtcblx0XHRtYXJnaW4tYm90dG9tOiAxLjJlbTtcblx0fVxuXG5cdHAge1xuXHRcdG1heC13aWR0aDogNjBlbTtcblx0XHRtYXJnaW46IDFlbSAwO1xuXHRcdGZvbnQtc2l6ZTogMS4zZW07XG5cdFx0bGluZS1oZWlnaHQ6IDEuNmVtO1xuICB9XG5cbiAgLmlubGluZS1saW5rIHtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgfVxuXG4gIC5zdGlja3kge1xuICAgIHBvc2l0aW9uOiBzdGlja3k7XG4gICAgdG9wOiAwO1xuICAgIC8qIGxlZnQ6IDUwJTtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7ICovXG4gICAgcGFkZGluZzogMC41ZW0gM2VtIDAuNWVtIDA7XG4gICAgYmFja2dyb3VuZDogI2ZmZjtcbiAgICBmb250LXNpemU6IDEuMmVtO1xuICAgIC8qIG1heC13aWR0aDogMTAwJTsgKi9cbiAgICAvKiB3aWR0aDogODBlbTsgKi9cbiAgICBtYXJnaW46IDAgM2VtO1xuICAgIHotaW5kZXg6IDEwMDtcbiAgfVxuICAuc2Nyb2xsLWxpc3Qge1xuICAgIHBhZGRpbmc6IDAuM2VtIDAgMWVtO1xuICB9XG4gIC5zY3JvbGwtbGlzdC1pdGVtIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgbWFyZ2luOiAwLjJlbSAwIDAuMmVtIC0xZW07XG4gICAgcGFkZGluZzogMC42ZW0gMWVtO1xuICAgIGZvbnQtc2l6ZTogMS4yZW07XG4gICAgbGluZS1oZWlnaHQ6IDEuNWVtO1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICBib3JkZXItcmFkaXVzOiAwLjZlbTtcbiAgfVxuICAuc2Nyb2xsLWxpc3QtaXRlbTpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogd2hpdGU7XG4gIH1cbiAgLnNjcm9sbC1saXN0LWl0ZW0tbnVtYmVyIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgLyogdG9wOiA1MCU7ICovXG4gICAgLyogbWFyZ2luLXRvcDogLTAuMmVtOyAqL1xuICAgIGxlZnQ6IC0wLjNlbTtcbiAgICBjb2xvcjogIzhiODdjNTtcbiAgICBmb250LXNpemU6IDAuN2VtO1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgLyogb3BhY2l0eTogMDsgKi9cbiAgICAvKiB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7ICovXG4gIH1cbiAgLnNjcm9sbC1saXN0LWl0ZW0tbmFtZSB7XG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICBsZXR0ZXItc3BhY2luZzogMC4xNmVtO1xuICAgIGNvbG9yOiAjOGI4N2M1O1xuICAgIGZvbnQtc2l6ZTogMC43ZW07XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgfVxuICAuc2Nyb2xsLWxpc3QtaXRlbS1sYWJlbCB7XG4gICAgZm9udC1zaXplOiAxLjFlbTtcbiAgfVxuXG5cblx0LyogLm9yZ3Mge1xuXHRcdGRpc3BsYXk6IGZsZXg7XG5cdFx0YWxpZ24taXRlbXM6IGNlbnRlcjtcblx0XHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcblx0XHRmbGV4LXdyYXA6IHdyYXA7XG5cdFx0bWF4LXdpZHRoOiA4MGVtO1xuXHRcdG1hcmdpbi1ib3R0b206IDJlbTtcblx0fVxuXHQub3JnIHtcblx0XHRtYXJnaW46IDAuNWVtIDFlbTtcblx0XHRmb250LXNpemU6IDAuN2VtO1xuXHRcdGxpbmUtaGVpZ2h0OiAxLjFlbTtcblx0XHRvcGFjaXR5OiAwLjQ7XG5cdH0gKi9cbiAgLmZvY3VzIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4OiAxO1xuICAgIGhlaWdodDogMzRlbTtcbiAgICBtYXJnaW46IDNlbSAwIDA7XG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgfVxuICAuZm9jdXM6YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIlwiO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0b3A6IDA7XG4gICAgbGVmdDogMDtcbiAgICByaWdodDogMDtcbiAgICBoZWlnaHQ6IDdlbTtcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoXG4gICAgICB0byBib3R0b20sXG4gICAgICAjZmZmIDMwJSxcbiAgICAgIHJnYmEoMjQ0LCAyNDUsIDI1MCwgMC4wMSkgMTAwJVxuICAgICk7XG4gICAgei1pbmRleDogMTAwO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG4gIC5mb2N1czphZnRlciB7XG4gICAgY29udGVudDogXCJcIjtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgYm90dG9tOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgcmlnaHQ6IDA7XG4gICAgaGVpZ2h0OiA1ZW07XG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KFxuICAgICAgdG8gdG9wLFxuICAgICAgI2ZmZiAwJSxcbiAgICAgIHJnYmEoMjQ0LCAyNDUsIDI1MCwgMC4wMSkgMTAwJVxuICAgICk7XG4gICAgei1pbmRleDogMTAwO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG4gIC5sb2FkaW5nIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiA1MCU7XG4gICAgbGVmdDogNTAlO1xuICAgIC8qIGZvbnQtd2VpZ2h0OiA3MDA7ICovXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIG9wYWNpdHk6IDAuNjtcbiAgICBmb250LXN0eWxlOiBpdGFsaWM7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG4gIH1cbiAgLmZvY3VzLXRpdGxlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDUwJTtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICAvKiB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgIGxldHRlci1zcGFjaW5nOiAwLjFlbTsgKi9cbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XG4gICAgei1pbmRleDogMjAwO1xuICB9XG4gIC5mb2N1cy10aXRsZSBhIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgcmlnaHQ6IC0zLjVlbTtcbiAgICB0b3A6IC0wLjNlbTtcbiAgICBtYXJnaW4tdG9wOiAwLjNlbTtcbiAgICBmb250LXdlaWdodDogNTAwO1xuICAgIC8qIGZvbnQtc2l6ZTogMC45ZW07ICovXG4gICAgb3BhY2l0eTogMC42O1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICB9XG4gIC5saXN0LWl0ZW0ge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0b3A6IDUwJTtcbiAgICBsZWZ0OiA1MCU7XG4gICAgaGVpZ2h0OiAxNi40ZW07XG4gICAgdGV4dC1hbGlnbjogbGVmdDtcbiAgICB3aWR0aDogMzNlbTtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcbiAgICB0cmFuc2l0aW9uOiBhbGwgMC41cyBlYXNlLW91dDtcbiAgICBmb250LXNpemU6IDAuOWVtO1xuICAgIHBvaW50ZXItZXZlbnRzOiBhbGw7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIC0tbWF4LWxpbmVzOiA0O1xuICB9XG4gIC5saXN0LWl0ZW0gOmdsb2JhbCguY2FyZC13cmFwcGVyKSB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIH1cbiAgLmxpc3QtaXRlbS0tMCB7XG4gICAgb3BhY2l0eTogMDtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtMjc1JSk7XG4gIH1cbiAgLmxpc3QtaXRlbS0tMSB7XG4gICAgb3BhY2l0eTogMC42O1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC0xNzUlKTtcbiAgfVxuICAubGlzdC1pdGVtLS0yIHtcbiAgICB6LWluZGV4OiAxMDtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgfVxuICAubGlzdC1pdGVtLS0zIHtcbiAgICBvcGFjaXR5OiAwLjY7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgNzUlKTtcbiAgfVxuICAubGlzdC1pdGVtLS00IHtcbiAgICBvcGFjaXR5OiAwO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIDE3NSUpO1xuICB9XG4gIC50ZXh0IHtcbiAgICAvKiBwYWRkaW5nOiAwIDIwZW07ICovXG4gICAgdGV4dC1hbGlnbjogbGVmdDtcbiAgICBwYWRkaW5nOiAxZW0gM2VtO1xuICAgIGZsZXg6IDE7XG4gIH1cbiAgQG1lZGlhIChtYXgtd2lkdGg6IDExNTVweCkge1xuICAgIC5jIHtcbiAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgfVxuICAgIC5mb2N1cyB7XG4gICAgICBoZWlnaHQ6IDMwZW07XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIGZsZXg6IG5vbmU7XG4gICAgfVxuICAgIC5mb2N1czpiZWZvcmUge1xuICAgICAgbGVmdDogMDtcbiAgICAgIGJvdHRvbTogMDtcbiAgICAgIHJpZ2h0OiBhdXRvO1xuICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgICAgd2lkdGg6IDV2dztcbiAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudChcbiAgICAgICAgdG8gcmlnaHQsXG4gICAgICAgICNmZmYgLTEwJSxcbiAgICAgICAgcmdiYSgyNDQsIDI0NSwgMjUwLCAwLjAxKSAxMDAlXG4gICAgICApO1xuICAgIH1cbiAgICAuZm9jdXM6YWZ0ZXIge1xuICAgICAgbGVmdDogYXV0bztcbiAgICAgIHRvcDogMDtcbiAgICAgIHJpZ2h0OiAwO1xuICAgICAgaGVpZ2h0OiBhdXRvO1xuICAgICAgd2lkdGg6IDV2dztcbiAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudChcbiAgICAgICAgdG8gbGVmdCxcbiAgICAgICAgI2ZmZiAtMTAlLFxuICAgICAgICByZ2JhKDI0NCwgMjQ1LCAyNTAsIDAuMDEpIDEwMCVcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLmxpc3QtaXRlbSB7XG4gICAgICBoZWlnaHQ6IGF1dG87XG4gICAgICB0b3A6IDZlbTtcbiAgICAgIHdpZHRoOiA4OHZ3O1xuICAgIH1cbiAgICAubGlzdC1pdGVtLS0wIHtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC0yNzAlLCAwKTtcbiAgICB9XG4gICAgLmxpc3QtaXRlbS0tMSB7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTE1MiUsIDApO1xuICAgIH1cbiAgICAubGlzdC1pdGVtLS0yIHtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIDApO1xuICAgIH1cbiAgICAubGlzdC1pdGVtLS0zIHtcbiAgICAgIG9wYWNpdHk6IDE7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSg1MiUsIDApO1xuICAgIH1cbiAgICAubGlzdC1pdGVtLS00IHtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDE3MCUsIDApO1xuICAgIH1cbiAgfVxuICBAbWVkaWEgKG1heC13aWR0aDogNzAwcHgpIHtcbiAgICBoMSB7XG4gICAgICBmb250LXNpemU6IDIuM2VtO1xuICAgIH1cbiAgICBwIHtcbiAgICAgIGZvbnQtc2l6ZTogMWVtO1xuICAgIH1cbiAgICAuc2Nyb2xsLWxpc3QtaXRlbSB7XG4gICAgICBmb250LXNpemU6IDFlbTtcbiAgICB9XG4gIH1cbiJdfQ== */</style>\"],\"names\":[],\"mappings\":\"AA4JE,EAAE,4BAAC,CAAC,AACF,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,QAAQ,CAClB,SAAS,CAAE,IAAI,CACf,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,WAAW,CAAE,GAAG,CAChB,cAAc,CAAE,GAAG,AACrB,CAAC,AACD,EAAE,4BAAC,CAAC,AAGJ,WAAW,CAAE,GAAG,CAEhB,aAAa,CAAE,KAAK,CAEpB,SAAS,CAAE,GAAG,CACd,WAAW,CAAE,GAAG,AACjB,CAAC,AACA,gBAAE,CAAC,CAAC,cAAC,CAAC,AACJ,OAAO,CAAE,KAAK,CACd,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,CAChB,UAAU,CAAE,KAAK,AAGnB,CAAC,AAgBF,CAAC,4BAAC,CAAC,AACF,SAAS,CAAE,IAAI,CACf,MAAM,CAAE,GAAG,CAAC,CAAC,CACb,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,KAAK,AAClB,CAAC,AAED,YAAY,4BAAC,CAAC,AACZ,KAAK,CAAE,OAAO,AAChB,CAAC,AAED,OAAO,4BAAC,CAAC,AACP,QAAQ,CAAE,cAAc,CACxB,QAAQ,CAAE,MAAM,CAChB,GAAG,CAAE,CAAC,CAGN,OAAO,CAAE,KAAK,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAC1B,UAAU,CAAE,IAAI,CAChB,SAAS,CAAE,KAAK,CAGhB,MAAM,CAAE,CAAC,CAAC,GAAG,CACb,OAAO,CAAE,GAAG,AACd,CAAC,AACD,YAAY,4BAAC,CAAC,AACZ,OAAO,CAAE,KAAK,CAAC,CAAC,CAAC,GAAG,AACtB,CAAC,AACD,iBAAiB,4BAAC,CAAC,AACjB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,KAAK,CACd,MAAM,CAAE,KAAK,CAAC,CAAC,CAAC,KAAK,CAAC,IAAI,CAC1B,OAAO,CAAE,KAAK,CAAC,GAAG,CAClB,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,KAAK,CAClB,KAAK,CAAE,OAAO,CACd,eAAe,CAAE,IAAI,CACrB,aAAa,CAAE,KAAK,AACtB,CAAC,AACD,6CAAiB,MAAM,AAAC,CAAC,AACvB,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,wBAAwB,4BAAC,CAAC,AACxB,QAAQ,CAAE,QAAQ,CAGlB,IAAI,CAAE,MAAM,CACZ,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,AAGlB,CAAC,AACD,sBAAsB,4BAAC,CAAC,AACtB,cAAc,CAAE,SAAS,CACzB,cAAc,CAAE,MAAM,CACtB,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,AAClB,CAAC,AACD,uBAAuB,4BAAC,CAAC,AACvB,SAAS,CAAE,KAAK,AAClB,CAAC,AAiBD,MAAM,4BAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,GAAG,CAAC,CAAC,CAAC,CAAC,CACf,QAAQ,CAAE,MAAM,AAClB,CAAC,AACD,kCAAM,OAAO,AAAC,CAAC,AACb,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,GAAG,CACX,UAAU,CAAE;MACV,EAAE,CAAC,MAAM,CAAC;MACV,IAAI,CAAC,GAAG,CAAC;MACT,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,CAAC,CAAC,IAAI;KAC/B,CACD,OAAO,CAAE,GAAG,CACZ,cAAc,CAAE,IAAI,AACtB,CAAC,AACD,kCAAM,MAAM,AAAC,CAAC,AACZ,OAAO,CAAE,EAAE,CACX,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,GAAG,CACX,UAAU,CAAE;MACV,EAAE,CAAC,GAAG,CAAC;MACP,IAAI,CAAC,EAAE,CAAC;MACR,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,CAAC,CAAC,IAAI;KAC/B,CACD,OAAO,CAAE,GAAG,CACZ,cAAc,CAAE,IAAI,AACtB,CAAC,AACD,QAAQ,4BAAC,CAAC,AACR,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CAET,UAAU,CAAE,MAAM,CAClB,OAAO,CAAE,GAAG,CACZ,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,AAClC,CAAC,AACD,YAAY,4BAAC,CAAC,AACZ,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,GAAG,CACT,UAAU,CAAE,MAAM,CAClB,WAAW,CAAE,GAAG,CAGhB,SAAS,CAAE,WAAW,IAAI,CAAC,CAC3B,OAAO,CAAE,GAAG,AACd,CAAC,AACD,0BAAY,CAAC,CAAC,cAAC,CAAC,AACd,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,MAAM,CACb,GAAG,CAAE,MAAM,CACX,UAAU,CAAE,KAAK,CACjB,WAAW,CAAE,GAAG,CAEhB,OAAO,CAAE,GAAG,CACZ,KAAK,CAAE,OAAO,AAChB,CAAC,AACD,UAAU,4BAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CACT,MAAM,CAAE,MAAM,CACd,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,CAChC,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,QAAQ,CAC7B,SAAS,CAAE,KAAK,CAChB,cAAc,CAAE,GAAG,CACnB,MAAM,CAAE,OAAO,CACf,WAAW,CAAE,CAAC,AAChB,CAAC,AACD,sCAAU,CAAC,AAAQ,aAAa,AAAE,CAAC,AACjC,KAAK,CAAE,IAAI,CACX,cAAc,CAAE,IAAI,AACtB,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,KAAK,CAAC,AACnC,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,OAAO,CAAE,GAAG,CACZ,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,KAAK,CAAC,AACnC,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,OAAO,CAAE,EAAE,CACX,cAAc,CAAE,IAAI,AACtB,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,OAAO,CAAE,GAAG,CACZ,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,GAAG,CAAC,AACjC,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,AAClC,CAAC,AACD,KAAK,4BAAC,CAAC,AAEL,UAAU,CAAE,IAAI,CAChB,OAAO,CAAE,GAAG,CAAC,GAAG,CAChB,IAAI,CAAE,CAAC,AACT,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,EAAE,4BAAC,CAAC,AACF,cAAc,CAAE,MAAM,AACxB,CAAC,AACD,MAAM,4BAAC,CAAC,AACN,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,IAAI,CAAE,IAAI,AACZ,CAAC,AACD,kCAAM,OAAO,AAAC,CAAC,AACb,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,GAAG,CACV,UAAU,CAAE;QACV,EAAE,CAAC,KAAK,CAAC;QACT,IAAI,CAAC,IAAI,CAAC;QACV,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,CAAC,CAAC,IAAI;OAC/B,AACH,CAAC,AACD,kCAAM,MAAM,AAAC,CAAC,AACZ,IAAI,CAAE,IAAI,CACV,GAAG,CAAE,CAAC,CACN,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,GAAG,CACV,UAAU,CAAE;QACV,EAAE,CAAC,IAAI,CAAC;QACR,IAAI,CAAC,IAAI,CAAC;QACV,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,CAAC,CAAC,IAAI;OAC/B,AACH,CAAC,AAED,UAAU,4BAAC,CAAC,AACV,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,GAAG,CACR,KAAK,CAAE,IAAI,AACb,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,SAAS,CAAE,UAAU,KAAK,CAAC,CAAC,CAAC,CAAC,AAChC,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,UAAU,KAAK,CAAC,CAAC,CAAC,CAAC,AAChC,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,CAAC,CAAC,AAC/B,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,UAAU,GAAG,CAAC,CAAC,CAAC,CAAC,AAC9B,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,CAAC,CAAC,AAC/B,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,EAAE,4BAAC,CAAC,AACF,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,CAAC,4BAAC,CAAC,AACD,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,iBAAiB,4BAAC,CAAC,AACjB,SAAS,CAAE,GAAG,AAChB,CAAC,AACH,CAAC\"}"
};

const Intro = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { data } = $$props;
	let { isLoading } = $$props;
	let focusedIndex = 1;

	onMount(() => {
		const interval = setInterval(
			() => {
				if (!data.length) return;
				focusedIndex = Math.min(data.length - 1, focusedIndex + 1);
			},
			3000
		);

		return () => {
			clearInterval(interval);
		};
	});

	const scrollOptions = [
		["categories", "What categories of false claims are being spread?"],
		["countries", "Where are the false claims coming from?"],
		["list", "See all of the claims"]
	];
	//   behavior: 'smooth',
	// })

	if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
	if ($$props.isLoading === void 0 && $$bindings.isLoading && isLoading !== void 0) $$bindings.isLoading(isLoading);
	$$result.css.add(css$2);
	let factChecksByDate = [...data].sort((a, b) => dateAccessor(b) - dateAccessor(a)).map((d, i) => ({ ...d, id: i }));
	let lastFactChecks = [{}, {}, ...factChecksByDate].slice(focusedIndex, focusedIndex + 5);

	return `<div class="${"c svelte-n7ce1l"}">

  <div class="${"text svelte-n7ce1l"}">
    <h1 class="${"svelte-n7ce1l"}">
      COVID-19
      <b class="${"svelte-n7ce1l"}">Misinformation Explorer</b>
    </h1>
    
    <p class="${"svelte-n7ce1l"}">
      We compiled ${validate_component(InterpolatedNumber, "InterpolatedNumber").$$render($$result, { number: data.length || 1800 }, {}, {})} fact checks from over <a href="${"#footer"}" class="${"inline-link svelte-n7ce1l"}">100 organizations</a> around the world to combat misinformation about Covid-19.
    </p>

    <p class="${"svelte-n7ce1l"}">
      Explore to find what false claims are being made about Covid-19 and where they&#39;re being spread.
    </p>

    <div class="${"scroll-list svelte-n7ce1l"}">
      ${each(scrollOptions, ([id, option], i) => `<a${add_attribute("href", `#${id}`, 0)} class="${"scroll-list-item svelte-n7ce1l"}">
          <div class="${"scroll-list-item-number svelte-n7ce1l"}">
            ${escape(i + 1)}
          </div>
          <div class="${"scroll-list-item-name svelte-n7ce1l"}">
            ${escape(id)}
          </div>
          <div class="${"scroll-list-item-label svelte-n7ce1l"}">
            ${escape(option)}
          </div>
        </a>`)}
    </div>
    
  </div>

  <div class="${"focus svelte-n7ce1l"}">
    ${isLoading
	? `<div class="${"loading svelte-n7ce1l"}">
        Loading fact checks...
      </div>`
	: ``}
    <div class="${"focus-title svelte-n7ce1l"}">
      Newest fact checks
      <br>
      <a href="${"#list"}" class="${"svelte-n7ce1l"}">See all</a>
    </div>
    ${each(lastFactChecks, (item, i) => `${item.id
	? `<div class="${escape(null_to_empty(`list-item list-item--${i}`)) + " svelte-n7ce1l"}">
          ${validate_component(ListItem, "ListItem").$$render($$result, { item }, {}, {})}
        </div>`
	: ``}`)}
  </div>
  

</div>

`;
});

/* src/components/DataSource.svelte generated by Svelte v3.19.1 */

const css$3 = {
	code: ".c.svelte-ctrwr8.svelte-ctrwr8{position:absolute;bottom:8em;right:5em;color:#797d8a;font-size:0.8em;text-align:right}.c.svelte-ctrwr8 a.svelte-ctrwr8{color:inherit}@media(max-width: 1200px){.c.svelte-ctrwr8.svelte-ctrwr8{bottom:2em}}@media(max-width: 800px){.c.svelte-ctrwr8.svelte-ctrwr8{bottom:0}}",
	map: "{\"version\":3,\"file\":\"DataSource.svelte\",\"sources\":[\"DataSource.svelte\"],\"sourcesContent\":[\"<div class=\\\"c\\\">\\n  Data source:\\n  <br />\\n  <a href=\\\"https://www.poynter.org/coronavirusfactsalliance/\\\" target=\\\"_blank\\\">\\n    The CoronaVirusFacts/DatosCoronaVirus Alliance Database\\n  </a>\\n</div>\\n\\n<style>\\n  .c {\\n    position: absolute;\\n    bottom: 8em;\\n    right: 5em;\\n    /* margin-top: -7em;\\n    padding-right: 5em; */\\n    color: #797d8a;\\n    font-size: 0.8em;\\n    text-align: right;\\n  }\\n  .c a {\\n    color: inherit;\\n  }\\n  @media (max-width: 1200px) {\\n    .c {\\n      bottom: 2em;\\n    }\\n  }\\n  @media (max-width: 800px) {\\n    .c {\\n      bottom: 0;\\n    }\\n  }\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0RhdGFTb3VyY2Uuc3ZlbHRlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7RUFDRTtJQUNFLGtCQUFrQjtJQUNsQixXQUFXO0lBQ1gsVUFBVTtJQUNWO3lCQUNxQjtJQUNyQixjQUFjO0lBQ2QsZ0JBQWdCO0lBQ2hCLGlCQUFpQjtFQUNuQjtFQUNBO0lBQ0UsY0FBYztFQUNoQjtFQUNBO0lBQ0U7TUFDRSxXQUFXO0lBQ2I7RUFDRjtFQUNBO0lBQ0U7TUFDRSxTQUFTO0lBQ1g7RUFDRiIsImZpbGUiOiJzcmMvY29tcG9uZW50cy9EYXRhU291cmNlLnN2ZWx0ZSIsInNvdXJjZXNDb250ZW50IjpbIlxuICAuYyB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGJvdHRvbTogOGVtO1xuICAgIHJpZ2h0OiA1ZW07XG4gICAgLyogbWFyZ2luLXRvcDogLTdlbTtcbiAgICBwYWRkaW5nLXJpZ2h0OiA1ZW07ICovXG4gICAgY29sb3I6ICM3OTdkOGE7XG4gICAgZm9udC1zaXplOiAwLjhlbTtcbiAgICB0ZXh0LWFsaWduOiByaWdodDtcbiAgfVxuICAuYyBhIHtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgfVxuICBAbWVkaWEgKG1heC13aWR0aDogMTIwMHB4KSB7XG4gICAgLmMge1xuICAgICAgYm90dG9tOiAyZW07XG4gICAgfVxuICB9XG4gIEBtZWRpYSAobWF4LXdpZHRoOiA4MDBweCkge1xuICAgIC5jIHtcbiAgICAgIGJvdHRvbTogMDtcbiAgICB9XG4gIH1cbiJdfQ== */</style>\"],\"names\":[],\"mappings\":\"AASE,EAAE,4BAAC,CAAC,AACF,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,GAAG,CAGV,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,KAAK,CAChB,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,gBAAE,CAAC,CAAC,cAAC,CAAC,AACJ,KAAK,CAAE,OAAO,AAChB,CAAC,AACD,MAAM,AAAC,YAAY,MAAM,CAAC,AAAC,CAAC,AAC1B,EAAE,4BAAC,CAAC,AACF,MAAM,CAAE,GAAG,AACb,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,EAAE,4BAAC,CAAC,AACF,MAAM,CAAE,CAAC,AACX,CAAC,AACH,CAAC\"}"
};

const DataSource = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	$$result.css.add(css$3);

	return `<div class="${"c svelte-ctrwr8"}">
  Data source:
  <br>
  <a href="${"https://www.poynter.org/coronavirusfactsalliance/"}" target="${"_blank"}" class="${"svelte-ctrwr8"}">
    The CoronaVirusFacts/DatosCoronaVirus Alliance Database
  </a>
</div>`;
});

/* src/components/Clusters--topics.svelte generated by Svelte v3.19.1 */

const css$4 = {
	code: ".c.svelte-47bkc1{position:relative;width:100%;margin:0 auto}.hovered-claim-highlight.svelte-47bkc1{position:absolute;top:0;left:0;width:8px;height:8px;border-radius:100%;border:1.5px solid}svg.svelte-47bkc1{position:absolute;top:0;left:0;overflow:visible}g.svelte-47bkc1{transition:all 0.2s ease-out}.boundary-label.svelte-47bkc1{text-anchor:middle;text-transform:uppercase;letter-spacing:0.1em}text.svelte-47bkc1{fill:rgb(85, 91, 107);text-anchor:middle;text-transform:uppercase;letter-spacing:0.1em;font-size:0.7em;font-weight:700;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.hidden.svelte-47bkc1{fill-opacity:0}.annotation.svelte-47bkc1{position:absolute;top:0;left:0;z-index:5}.annotation-contents.svelte-47bkc1{max-width:11em;text-align:right;font-size:0.8em;transform:translate(-100%, -100%)}.annotation-line.svelte-47bkc1{fill:none;stroke:#b9b6ca;stroke-width:1}@media(max-width: 800px){.c.svelte-47bkc1{margin-top:3em}.annotation.svelte-47bkc1{font-size:0.8em}text.svelte-47bkc1{font-size:0.6em}}@media(max-width: 600px){.c.svelte-47bkc1{margin-top:5em}}@media(max-width: 486px){.c.svelte-47bkc1{pointer-events:none}.annotation.svelte-47bkc1{margin-top:-1em}.annotation-line.svelte-47bkc1{display:none}}",
	map: "{\"version\":3,\"file\":\"Clusters--topics.svelte\",\"sources\":[\"Clusters--topics.svelte\"],\"sourcesContent\":[\"<script>\\n  import { draw, fade } from \\\"svelte/transition\\\"\\n  import { scaleOrdinal, scaleLinear, scaleSqrt } from \\\"d3-scale\\\"\\n  import { extent, max, min, range } from \\\"d3-array\\\"\\n  import { color } from \\\"d3-color\\\"\\n  import { forceSimulation, forceX, forceY, forceCollide, forceRadial } from \\\"d3-force\\\"\\n  import { Delaunay } from \\\"d3-delaunay\\\"\\n  import { timeParse } from \\\"d3-time-format\\\"\\n  import { timeDay } from \\\"d3-time\\\"\\n  import { debounce, getDistanceBetweenPoints, getPositionFromAngle, scaleCanvas } from \\\"./utils\\\"\\n  import { dateAccessor, parseDate, tags, tagCategories, tagCategoryMap, tagsAccessor, tagColors, ratings, ratingAccessor, ratingPaths, titleAccessor } from \\\"./data-utils\\\"\\n\\n  import ItemTooltip from \\\"./ItemTooltip.svelte\\\"\\n  import DataSource from \\\"./DataSource.svelte\\\"\\n\\n  export let data\\n  export let isFiltered\\n  export let filterIteration\\n  export let filterFunction\\n  export let filterColor\\n  export let iteration\\n  export let isEmbedded\\n\\n  let width = 1200\\n  $: constant = width / 1000\\n  $: isVertical = width < 666\\n  $: height = width * (\\n    width < 333  ? (503 - width) / 70 :\\n    isVertical   ? 1.25 :\\n    width < 1200 ? 0.66 :\\n      0.6\\n  )\\n\\n  // const types = [...tags, \\\"none\\\"]\\n  const types = tags\\n  $: bubbleSize = Math.max(1, Math.round(width / 700))\\n  let hoveredClaim = null\\n  let hoveredClaimIsFlipped = false\\n  let canvasElement\\n\\n  const updateSpiralPositions = (n=2000) => {\\n    let angle = 0\\n    spiralPositions = new Array(n).fill(0).map((_, i) => {\\n      const radius = Math.sqrt(i + 0.3) * bubbleSize * 1.9\\n      angle += Math.asin(1 / radius) * bubbleSize * 3.2\\n      angle = angle % (Math.PI * 2)\\n      return [\\n        Math.cos(angle) * radius,\\n        Math.sin(angle) * radius,\\n        angle,\\n      ]\\n    })\\n  }\\n  let spiralPositions = []\\n  const debounceUpdateSpiralPositions = debounce(updateSpiralPositions, 100)\\n  $: iteration, bubbleSize, debounceUpdateSpiralPositions()\\n\\n  $: xScale = scaleLinear()\\n    .domain([-1, types.length])\\n    .range([0, width])\\n  $: ageScale = scaleLinear()\\n    .domain([\\n      min([new Date(), max(data.map(dateAccessor))]),\\n      min(data.map(dateAccessor)),\\n    ])\\n    .range([1, 0.2])\\n  $: rScale = scaleSqrt()\\n    .domain(extent(data.map(d => d)))\\n    .range([10, 20])\\n  $: groupRScale = scaleSqrt()\\n    .domain([0, max(types.map(type => (\\n      data.filter(d => tagsAccessor(d).includes(type)).length\\n    )))])\\n    .range([10, width * 0.4])\\n\\n  let typeColors = tagColors\\n  let typeBorderColors = {}\\n\\n  $: types.forEach((type, i) => {\\n    // typeColors[type] = colors[i % colors.length]\\n    const typeColor = typeColors[type] || \\\"#d4d4d4\\\"\\n    typeBorderColors[type] = color(typeColor).darker(0.6).formatHex()\\n  })\\n\\n  let categoryOffsets = {}\\n  $: tagCategories.map((category, i) => {\\n    const angle = (360 / tagCategories.length) * i\\n    categoryOffsets[category] = getPositionFromAngle(angle, Math.min(height, width) / 5)\\n  })\\n\\n  let groupBubbles = []\\n  let bubbles = []\\n  const updateGroups = () => {\\n    updateSpiralPositions()\\n    const groups = types.map((type, i) => {\\n      // const angle = 360 / types.length * i\\n      // const [x, y] = getPositionFromAngle(angle, 100)\\n      const [x, y] = categoryOffsets[tagCategoryMap[type]]\\n\\n      const bubbleCount = data.filter(d => tagsAccessor(d).includes(type)).length\\n      const r = Math.max(\\n        Math.sqrt(bubbleCount * Math.PI * Math.pow(bubbleSize * 1.2, 2) * (Math.sqrt(7) / Math.PI)) + 20,\\n        36\\n      )\\n      const parsedColor = typeColors[type] || \\\"#d4d4d4\\\"\\n      const darkerColor = color(parsedColor)\\n        .darker(0.3)\\n        .formatHex()\\n\\n      return {\\n        type,\\n        r: r / constant,\\n        labelR: Math.max(r + (height * 0.002), 30) / constant,\\n        x: (x + width / 2) / constant,\\n        y: (y + height / 2) / constant,\\n        color: parsedColor,\\n        darkerColor,\\n      }\\n    }).filter(d => d)\\n\\n    groupBubbles = [...groups]\\n    let simulation = forceSimulation(groupBubbles)\\n      // .force(\\\"x\\\", forceX(d => d.x).strength(1))\\n      .force(\\\"x\\\", forceX(d => d.x).strength(isVertical ? 0.5 : 0.1))\\n      .force(\\\"y\\\", forceY(d => d.y).strength(isVertical ? 0.1 : 0.4))\\n      .force(\\\"collide\\\", forceCollide(d => d.r + 10).strength(0.4))\\n      // .force(\\\"r\\\", forceRadial(d => d.distance).strength(5))\\n      .stop()\\n\\n    range(0, 100).forEach(i => {\\n      simulation.tick()\\n      groupBubbles.forEach(d => {\\n        d.x = Math.max(d.labelR, Math.min((width / constant) - d.labelR, d.x))\\n        d.y = Math.max(d.labelR, Math.min((height / constant) - d.labelR, d.y))\\n      })\\n    })\\n\\n    let groupBubblesByCategory = {}\\n    groupBubbles.forEach(d => {\\n      groupBubblesByCategory[d.type] = d\\n    })\\n\\n    let runningTopicIndices = {}\\n    let claims = []\\n    data.forEach((d, i) => {\\n      const topics = tagsAccessor(d)\\n      if (!topics.length) return\\n\\n      const rating = ratingAccessor(d)\\n      const title = titleAccessor(d)\\n      const r = bubbleSize / constant\\n      const opacity = ageScale(dateAccessor(d))\\n\\n      topics.forEach(topic => {\\n        const groupPosition = groupBubblesByCategory[topic]\\n        if (!groupPosition) return\\n\\n        if (!runningTopicIndices[topic]) runningTopicIndices[topic] = 0\\n\\n        const spiralPosition = spiralPositions[runningTopicIndices[topic]] || []\\n\\n        const [x, y] = [\\n          groupPosition.x + spiralPosition[0] / constant,\\n          groupPosition.y + spiralPosition[1] / constant,\\n        ]\\n        runningTopicIndices[topic]++\\n\\n        let typeColor = color(typeColors[topic])\\n        typeColor.opacity = opacity\\n\\n        const parsedColor = typeColor.formatRgb()\\n        const darkerColor = typeColor.darker(0.3).formatRgb()\\n\\n        claims.push({\\n          ...d,\\n          r,\\n          x,\\n          y,\\n          category: topic,\\n          title,\\n          color: parsedColor,\\n          darkerColor,\\n        })\\n      })\\n    })\\n\\n    bubbles = claims\\n    // let bubbleSimulation = forceSimulation(bubbles)\\n    //   // .force(\\\"x\\\", forceX(d => d.x).strength(1))\\n    //   .force(\\\"x\\\", forceX(d => d.x).strength(0.1))\\n    //   .force(\\\"y\\\", forceY(d => d.y).strength(0.1))\\n    //   .force(\\\"collide\\\", forceCollide(d => d.r * 1.8))\\n    //   // .force(\\\"r\\\", forceRadial(d => d.distance).strength(5))\\n    //   .on(\\\"tick\\\", drawCanvas)\\n    //   .alphaMin(0.06)\\n    //   // .stop()\\n\\n    // range(0, 500).forEach(i => bubbleSimulation.tick())\\n  }\\n\\n  let delaunay = null\\n  const updateDelaunay = () => {\\n    setTimeout(() => {\\n    delaunay = Delaunay.from(\\n      bubbles,\\n      d => d.x * constant,\\n      d => d.y * constant,\\n    )\\n    })\\n  }\\n  const debounceUpdateDelaunay = debounce(updateDelaunay, 100)\\n  $: iteration, bubbles, width, debounceUpdateDelaunay()\\n\\n  $: iteration, width, updateGroups()\\n\\n  const drawCanvas = () => {\\n    if (!canvasElement) return\\n    const ctx = canvasElement.getContext(\\\"2d\\\")\\n    scaleCanvas(canvasElement, ctx, width, height)\\n\\n    ctx.globalAlpha = 0.2\\n    groupBubbles.forEach(({x, y, r, color, type}, i) => {\\n      let gradient = ctx.createRadialGradient(\\n        x * constant, y * constant, 0, x * constant, y * constant, r * constant,\\n      )\\n\\n      gradient.addColorStop(0, color)\\n      gradient.addColorStop(0.47, color)\\n      gradient.addColorStop(1, `${color}00`)\\n      ctx.fillStyle = gradient\\n\\n      ctx.beginPath()\\n      ctx.arc(x * constant, y * constant, r * constant, 0, 2 * Math.PI, false)\\n      // ctx.fillStyle = color\\n      ctx.fill()\\n    })\\n\\n    // ctx.globalAlpha = 1\\n    // groupBubbles.forEach(({x, y, r, darkerColor, type}, i) => {\\n    //   ctx.fillStyle = darkerColor\\n    //   fillTextCircle(ctx, type.toUpperCase(), x * constant, y * constant, r * constant * 1.1)\\n    // })\\n\\n    ctx.globalAlpha = 1\\n\\n    bubbles.forEach((d, i) => {\\n      const { x, y, color, darkerColor } = d\\n      const isBubbleFilteredOut = isFiltered && !filterFunction(d)\\n      const isBubbleFilteredIn = isFiltered && !isBubbleFilteredOut\\n\\n      ctx.beginPath()\\n      // if (Path2D) {\\n      //   ctx.moveTo(x * constant, y * constant)\\n      //   const path = new Path2D(\\\"M0.834766 0.0570311C0.653906 0.114843 0.487891 0.215234 0.351563 0.351561C0.126563 0.576561 0 0.881638 0 1.2V7.59998C0 7.7617 0.0972656 7.90779 0.246875 7.96951C0.353125 8.01365 0.471094 8.00896 0.571094 7.96131C0.611719 7.94216 0.649609 7.91599 0.682813 7.88279L2.16563 6.39998H6.8C7.11836 6.39998 7.42344 6.27342 7.64844 6.04842C7.87344 5.82342 8 5.51834 8 5.19998V1.2C8 0.881638 7.87344 0.576561 7.64844 0.351561C7.42344 0.126562 7.11836 0 6.8 0H1.2C1.075 0 0.951953 0.0195312 0.834766 0.0570311Z\\\")\\n      // } else {\\n      //   // ctx.arc(x * constant, y * constant, r * constant, 0, 2 * Math.PI, false)\\n      // }\\n      ctx.arc(x * constant, y * constant, bubbleSize, 0, 2 * Math.PI, false)\\n      ctx.fillStyle = isBubbleFilteredOut ? \\\"#fff\\\" :\\n        isBubbleFilteredIn && filterColor ? filterColor || color :\\n                                            color\\n      ctx.fill()\\n\\n      ctx.beginPath()\\n      ctx.arc(x * constant, y * constant, bubbleSize, 0, 2 * Math.PI, false)\\n      ctx.strokeStyle = isBubbleFilteredOut ? \\\"#eaeaea\\\" :\\n        isBubbleFilteredIn && filterColor ? filterColor || darkerColor :\\n                                            darkerColor\\n      ctx.stroke()\\n    })\\n  }\\n\\n  const debouncedDrawCanvas = debounce(drawCanvas, 500)\\n  // $: (() => {{\\n  //   const _ = width\\n  //   drawCanvas()\\n  // }})\\n  // onMount(drawCanvas)\\n  $: debouncedDrawCanvas()\\n  $: width, bubbles, filterIteration, debouncedDrawCanvas()\\n\\n  $: topLeftBubble = delaunay && bubbles[delaunay.find(constant * 0.05, 0)]\\n\\n  // const onMouseOver = point => {\\n  //   hoveredClaim = point\\n  // }\\n\\n  $: onMouseMove = e => {\\n    if (!delaunay) return\\n    if (!canvasElement) return\\n\\n    const x = e.clientX\\n      - canvasElement.getBoundingClientRect().left\\n    const y = e.clientY\\n      - canvasElement.getBoundingClientRect().top\\n\\n    const mousePosition = [x, y]\\n    const pointIndex = delaunay.find(...mousePosition)\\n    if (pointIndex == -1) return null\\n\\n    const hoveredBubble = bubbles[pointIndex] || {}\\n    const distance = getDistanceBetweenPoints(\\n      mousePosition,\\n      [hoveredBubble.x * constant, hoveredBubble.y * constant],\\n    )\\n    if (distance < 30) {\\n      hoveredClaim = hoveredBubble\\n      hoveredClaimIsFlipped = y < 300\\n    } else {\\n      hoveredClaim = null\\n    }\\n  }\\n\\n  const clearTooltip = () => hoveredClaim = null\\n  // const debouncedOnMouseOver = debounce(onMouseOver, 50)\\n</script>\\n\\n<svelte:window on:scroll={clearTooltip} />\\n\\n<div class=\\\"c\\\" bind:clientWidth={width} on:mousemove={onMouseMove}>\\n  <canvas style={`width: ${width}px; height: ${height}px`} bind:this={canvasElement} />\\n\\n  <svg {width} {height}>\\n    {#each groupBubbles as { type, x, y, r, labelR, color, darkerColor }, i}\\n      <g fill={color} transform={`translate(${x * constant}, ${y * constant})`}>\\n        <!-- <circle\\n          r={r}\\n          fill-opacity=\\\"0.1\\\"\\n        /> -->\\n\\n        <path\\n          class=\\\"hidden\\\"\\n          d={[\\n            [\\\"M\\\", 0, -((labelR * constant) - 16)].join(\\\" \\\"),\\n            [\\\"A\\\", ((labelR * constant) - 16), ((labelR * constant) - 16), 0, 0, 1, 0, ((labelR * constant) - 16)].join(\\\" \\\"),\\n            [\\\"A\\\", ((labelR * constant) - 16), ((labelR * constant) - 16), 0, 0, 1, 0, -((labelR * constant) - 16)].join(\\\" \\\"),\\n          ].join(\\\" \\\")}\\n          fill=\\\"none\\\"\\n          id={`path-${type}`}\\n          transform={`rotate(-147)`}\\n        />\\n        <text transition:fade={{ duration: 1000 + 300 * i }}>\\n          <textPath\\n            href={`#path-${type}`}\\n            class=\\\"boundary-label\\\"\\n            startOffset=\\\"40%\\\"\\n            fill={darkerColor}\\n          >\\n            { type || \\\"Other\\\" }\\n          </textPath>\\n        </text>\\n      </g>\\n    {/each}\\n\\n    {#if topLeftBubble && Number.isFinite(topLeftBubble.x)}\\n      <path\\n        class=\\\"annotation-line\\\"\\n        d={[\\n          \\\"M\\\", topLeftBubble.x * constant - bubbleSize, topLeftBubble.y * constant,\\n          \\\"Q\\\", topLeftBubble.x * constant - 50, topLeftBubble.y * constant,\\n          topLeftBubble.x * constant - 50, topLeftBubble.y * constant - 45\\n        ].join(\\\" \\\")}\\n      />\\n    {/if}\\n  </svg>\\n\\n  {#if hoveredClaim}\\n    <ItemTooltip\\n      item={hoveredClaim}\\n      x={Math.min(width - 200, Math.max(200, hoveredClaim.x * constant))}\\n      y={hoveredClaim.y * constant - (bubbleSize * (hoveredClaimIsFlipped ? -1 : 1))}\\n      isFlipped={hoveredClaimIsFlipped}\\n    />\\n    <div\\n      class=\\\"hovered-claim-highlight\\\"\\n      style={`\\n        height: ${bubbleSize * 2 + 1.5}px;\\n        width: ${bubbleSize * 2 + 1.5}px;\\n        transform: translate(${hoveredClaim.x * constant - bubbleSize - 2}px, ${hoveredClaim.y * constant - bubbleSize - 2}px);\\n      `}\\n    />\\n  {/if}\\n\\n  {#if topLeftBubble}\\n    <div class=\\\"annotation\\\" style={`transform: translate(${Math.max(130, topLeftBubble.x * constant - (isVertical ? 0 : 50))}px, ${topLeftBubble.y * constant - 50}px)`}>\\n      <div class=\\\"annotation-contents\\\">\\n        Each fact check is represented as a circle, which fades with age\\n      </div>\\n    </div>\\n  {/if}\\n\\n  {#if !isEmbedded}\\n    <DataSource />\\n  {/if}\\n</div>\\n\\n<style>\\n  .c {\\n    position: relative;\\n    width: 100%;\\n    margin: 0 auto;\\n  }\\n  .hovered-claim-highlight {\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n    width: 8px;\\n    height: 8px;\\n    border-radius: 100%;\\n    border: 1.5px solid;\\n  }\\n  svg {\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n    /* margin: 1em 0; */\\n    overflow: visible;\\n    /* shape-rendering: crispEdges; */\\n  }\\n  g {\\n    transition: all 0.2s ease-out;\\n  }\\n  .boundary-label {\\n    text-anchor: middle;\\n    text-transform: uppercase;\\n    letter-spacing: 0.1em;\\n    /* font-size: 0.7em; */\\n    /* font-weight: 100; */\\n  }\\n  text {\\n    fill: rgb(85, 91, 107);\\n    text-anchor: middle;\\n    text-transform: uppercase;\\n    letter-spacing: 0.1em;\\n    font-size: 0.7em;\\n    font-weight: 700;\\n    -webkit-user-select: none;\\n       -moz-user-select: none;\\n        -ms-user-select: none;\\n            user-select: none;\\n  }\\n  .hidden {\\n    fill-opacity: 0;\\n  }\\n\\n  .annotation {\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n    z-index: 5;\\n  }\\n  .annotation-contents {\\n    max-width: 11em;\\n    text-align: right;\\n    font-size: 0.8em;\\n    transform: translate(-100%, -100%);\\n  }\\n  .annotation-line {\\n    fill: none;\\n    stroke: #b9b6ca;\\n    stroke-width: 1;\\n  }\\n\\n  @media (max-width: 800px) {\\n    .c {\\n      margin-top: 3em;\\n    }\\n    .annotation {\\n      font-size: 0.8em;\\n    }\\n    text {\\n      font-size: 0.6em;\\n    }\\n  }\\n  @media (max-width: 600px) {\\n    .c {\\n      margin-top: 5em;\\n    }\\n  }\\n\\n  @media (max-width: 486px) {\\n    .c {\\n      pointer-events: none;\\n    }\\n    .annotation {\\n      margin-top: -1em;\\n    }\\n    .annotation-line {\\n      display: none;\\n    }\\n  }\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0NsdXN0ZXJzLS10b3BpY3Muc3ZlbHRlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7RUFDRTtJQUNFLGtCQUFrQjtJQUNsQixXQUFXO0lBQ1gsY0FBYztFQUNoQjtFQUNBO0lBQ0Usa0JBQWtCO0lBQ2xCLE1BQU07SUFDTixPQUFPO0lBQ1AsVUFBVTtJQUNWLFdBQVc7SUFDWCxtQkFBbUI7SUFDbkIsbUJBQW1CO0VBQ3JCO0VBQ0E7SUFDRSxrQkFBa0I7SUFDbEIsTUFBTTtJQUNOLE9BQU87SUFDUCxtQkFBbUI7SUFDbkIsaUJBQWlCO0lBQ2pCLGlDQUFpQztFQUNuQztFQUNBO0lBQ0UsNkJBQTZCO0VBQy9CO0VBQ0E7SUFDRSxtQkFBbUI7SUFDbkIseUJBQXlCO0lBQ3pCLHFCQUFxQjtJQUNyQixzQkFBc0I7SUFDdEIsc0JBQXNCO0VBQ3hCO0VBQ0E7SUFDRSxzQkFBc0I7SUFDdEIsbUJBQW1CO0lBQ25CLHlCQUF5QjtJQUN6QixxQkFBcUI7SUFDckIsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQix5QkFBaUI7T0FBakIsc0JBQWlCO1FBQWpCLHFCQUFpQjtZQUFqQixpQkFBaUI7RUFDbkI7RUFDQTtJQUNFLGVBQWU7RUFDakI7O0VBRUE7SUFDRSxrQkFBa0I7SUFDbEIsTUFBTTtJQUNOLE9BQU87SUFDUCxVQUFVO0VBQ1o7RUFDQTtJQUNFLGVBQWU7SUFDZixpQkFBaUI7SUFDakIsZ0JBQWdCO0lBQ2hCLGtDQUFrQztFQUNwQztFQUNBO0lBQ0UsVUFBVTtJQUNWLGVBQWU7SUFDZixlQUFlO0VBQ2pCOztFQUVBO0lBQ0U7TUFDRSxlQUFlO0lBQ2pCO0lBQ0E7TUFDRSxnQkFBZ0I7SUFDbEI7SUFDQTtNQUNFLGdCQUFnQjtJQUNsQjtFQUNGO0VBQ0E7SUFDRTtNQUNFLGVBQWU7SUFDakI7RUFDRjs7RUFFQTtJQUNFO01BQ0Usb0JBQW9CO0lBQ3RCO0lBQ0E7TUFDRSxnQkFBZ0I7SUFDbEI7SUFDQTtNQUNFLGFBQWE7SUFDZjtFQUNGIiwiZmlsZSI6InNyYy9jb21wb25lbnRzL0NsdXN0ZXJzLS10b3BpY3Muc3ZlbHRlIiwic291cmNlc0NvbnRlbnQiOlsiXG4gIC5jIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgbWFyZ2luOiAwIGF1dG87XG4gIH1cbiAgLmhvdmVyZWQtY2xhaW0taGlnaGxpZ2h0IHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgd2lkdGg6IDhweDtcbiAgICBoZWlnaHQ6IDhweDtcbiAgICBib3JkZXItcmFkaXVzOiAxMDAlO1xuICAgIGJvcmRlcjogMS41cHggc29saWQ7XG4gIH1cbiAgc3ZnIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgLyogbWFyZ2luOiAxZW0gMDsgKi9cbiAgICBvdmVyZmxvdzogdmlzaWJsZTtcbiAgICAvKiBzaGFwZS1yZW5kZXJpbmc6IGNyaXNwRWRnZXM7ICovXG4gIH1cbiAgZyB7XG4gICAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZS1vdXQ7XG4gIH1cbiAgLmJvdW5kYXJ5LWxhYmVsIHtcbiAgICB0ZXh0LWFuY2hvcjogbWlkZGxlO1xuICAgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMWVtO1xuICAgIC8qIGZvbnQtc2l6ZTogMC43ZW07ICovXG4gICAgLyogZm9udC13ZWlnaHQ6IDEwMDsgKi9cbiAgfVxuICB0ZXh0IHtcbiAgICBmaWxsOiByZ2IoODUsIDkxLCAxMDcpO1xuICAgIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICBsZXR0ZXItc3BhY2luZzogMC4xZW07XG4gICAgZm9udC1zaXplOiAwLjdlbTtcbiAgICBmb250LXdlaWdodDogNzAwO1xuICAgIHVzZXItc2VsZWN0OiBub25lO1xuICB9XG4gIC5oaWRkZW4ge1xuICAgIGZpbGwtb3BhY2l0eTogMDtcbiAgfVxuXG4gIC5hbm5vdGF0aW9uIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgei1pbmRleDogNTtcbiAgfVxuICAuYW5ub3RhdGlvbi1jb250ZW50cyB7XG4gICAgbWF4LXdpZHRoOiAxMWVtO1xuICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICAgIGZvbnQtc2l6ZTogMC44ZW07XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTEwMCUsIC0xMDAlKTtcbiAgfVxuICAuYW5ub3RhdGlvbi1saW5lIHtcbiAgICBmaWxsOiBub25lO1xuICAgIHN0cm9rZTogI2I5YjZjYTtcbiAgICBzdHJva2Utd2lkdGg6IDE7XG4gIH1cblxuICBAbWVkaWEgKG1heC13aWR0aDogODAwcHgpIHtcbiAgICAuYyB7XG4gICAgICBtYXJnaW4tdG9wOiAzZW07XG4gICAgfVxuICAgIC5hbm5vdGF0aW9uIHtcbiAgICAgIGZvbnQtc2l6ZTogMC44ZW07XG4gICAgfVxuICAgIHRleHQge1xuICAgICAgZm9udC1zaXplOiAwLjZlbTtcbiAgICB9XG4gIH1cbiAgQG1lZGlhIChtYXgtd2lkdGg6IDYwMHB4KSB7XG4gICAgLmMge1xuICAgICAgbWFyZ2luLXRvcDogNWVtO1xuICAgIH1cbiAgfVxuXG4gIEBtZWRpYSAobWF4LXdpZHRoOiA0ODZweCkge1xuICAgIC5jIHtcbiAgICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgIH1cbiAgICAuYW5ub3RhdGlvbiB7XG4gICAgICBtYXJnaW4tdG9wOiAtMWVtO1xuICAgIH1cbiAgICAuYW5ub3RhdGlvbi1saW5lIHtcbiAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICB9XG4iXX0= */</style>\"],\"names\":[],\"mappings\":\"AA6YE,EAAE,cAAC,CAAC,AACF,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AACD,wBAAwB,cAAC,CAAC,AACxB,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CACX,aAAa,CAAE,IAAI,CACnB,MAAM,CAAE,KAAK,CAAC,KAAK,AACrB,CAAC,AACD,GAAG,cAAC,CAAC,AACH,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CAEP,QAAQ,CAAE,OAAO,AAEnB,CAAC,AACD,CAAC,cAAC,CAAC,AACD,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,QAAQ,AAC/B,CAAC,AACD,eAAe,cAAC,CAAC,AACf,WAAW,CAAE,MAAM,CACnB,cAAc,CAAE,SAAS,CACzB,cAAc,CAAE,KAAK,AAGvB,CAAC,AACD,IAAI,cAAC,CAAC,AACJ,IAAI,CAAE,IAAI,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CACtB,WAAW,CAAE,MAAM,CACnB,cAAc,CAAE,SAAS,CACzB,cAAc,CAAE,KAAK,CACrB,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,CAChB,mBAAmB,CAAE,IAAI,CACtB,gBAAgB,CAAE,IAAI,CACrB,eAAe,CAAE,IAAI,CACjB,WAAW,CAAE,IAAI,AAC3B,CAAC,AACD,OAAO,cAAC,CAAC,AACP,YAAY,CAAE,CAAC,AACjB,CAAC,AAED,WAAW,cAAC,CAAC,AACX,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,oBAAoB,cAAC,CAAC,AACpB,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,KAAK,CACjB,SAAS,CAAE,KAAK,CAChB,SAAS,CAAE,UAAU,KAAK,CAAC,CAAC,KAAK,CAAC,AACpC,CAAC,AACD,gBAAgB,cAAC,CAAC,AAChB,IAAI,CAAE,IAAI,CACV,MAAM,CAAE,OAAO,CACf,YAAY,CAAE,CAAC,AACjB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,EAAE,cAAC,CAAC,AACF,UAAU,CAAE,GAAG,AACjB,CAAC,AACD,WAAW,cAAC,CAAC,AACX,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,IAAI,cAAC,CAAC,AACJ,SAAS,CAAE,KAAK,AAClB,CAAC,AACH,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,EAAE,cAAC,CAAC,AACF,UAAU,CAAE,GAAG,AACjB,CAAC,AACH,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,EAAE,cAAC,CAAC,AACF,cAAc,CAAE,IAAI,AACtB,CAAC,AACD,WAAW,cAAC,CAAC,AACX,UAAU,CAAE,IAAI,AAClB,CAAC,AACD,gBAAgB,cAAC,CAAC,AAChB,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC\"}"
};

const Clusters_topics = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { data } = $$props;
	let { isFiltered } = $$props;
	let { filterIteration } = $$props;
	let { filterFunction } = $$props;
	let { filterColor } = $$props;
	let { iteration } = $$props;
	let { isEmbedded } = $$props;
	let width = 1200;

	// const types = [...tags, "none"]
	const types = tags;
	let canvasElement;

	const updateSpiralPositions = (n = 2000) => {
		let angle = 0;

		spiralPositions = new Array(n).fill(0).map((_, i) => {
			const radius = Math.sqrt(i + 0.3) * bubbleSize * 1.9;
			angle += Math.asin(1 / radius) * bubbleSize * 3.2;
			angle = angle % (Math.PI * 2);
			return [Math.cos(angle) * radius, Math.sin(angle) * radius, angle];
		});
	};

	let spiralPositions = [];
	const debounceUpdateSpiralPositions = debounce(updateSpiralPositions, 100);
	let typeColors = tagColors;
	let typeBorderColors = {};
	let categoryOffsets = {};
	let groupBubbles = [];
	let bubbles = [];

	const updateGroups = () => {
		updateSpiralPositions();

		const groups = types.map((type, i) => {
			// const angle = 360 / types.length * i
			// const [x, y] = getPositionFromAngle(angle, 100)
			const [x, y] = categoryOffsets[tagCategoryMap[type]];

			const bubbleCount = data.filter(d => tagsAccessor(d).includes(type)).length;
			const r = Math.max(Math.sqrt(bubbleCount * Math.PI * Math.pow(bubbleSize * 1.2, 2) * (Math.sqrt(7) / Math.PI)) + 20, 36);
			const parsedColor = typeColors[type] || "#d4d4d4";
			const darkerColor = d3Color.color(parsedColor).darker(0.3).formatHex();

			return {
				type,
				r: r / constant,
				labelR: Math.max(r + height * 0.002, 30) / constant,
				x: (x + width / 2) / constant,
				y: (y + height / 2) / constant,
				color: parsedColor,
				darkerColor
			};
		}).filter(d => d);

		groupBubbles = [...groups];

		let simulation = d3Force.forceSimulation(groupBubbles).// .force("x", forceX(d => d.x).strength(1))
		force("x", d3Force.forceX(d => d.x).strength( 0.1)).force("y", d3Force.forceY(d => d.y).strength( 0.4)).force("collide", d3Force.forceCollide(d => d.r + 10).strength(0.4)).// .force("r", forceRadial(d => d.distance).strength(5))
		stop();

		d3Array.range(0, 100).forEach(i => {
			simulation.tick();

			groupBubbles.forEach(d => {
				d.x = Math.max(d.labelR, Math.min(width / constant - d.labelR, d.x));
				d.y = Math.max(d.labelR, Math.min(height / constant - d.labelR, d.y));
			});
		});

		let groupBubblesByCategory = {};

		groupBubbles.forEach(d => {
			groupBubblesByCategory[d.type] = d;
		});

		let runningTopicIndices = {};
		let claims = [];

		data.forEach((d, i) => {
			const topics = tagsAccessor(d);
			if (!topics.length) return;
			const rating = ratingAccessor(d);
			const title = titleAccessor(d);
			const r = bubbleSize / constant;
			const opacity = ageScale(dateAccessor(d));

			topics.forEach(topic => {
				const groupPosition = groupBubblesByCategory[topic];
				if (!groupPosition) return;
				if (!runningTopicIndices[topic]) runningTopicIndices[topic] = 0;
				const spiralPosition = spiralPositions[runningTopicIndices[topic]] || [];

				const [x, y] = [
					groupPosition.x + spiralPosition[0] / constant,
					groupPosition.y + spiralPosition[1] / constant
				];

				runningTopicIndices[topic]++;
				let typeColor = d3Color.color(typeColors[topic]);
				typeColor.opacity = opacity;
				const parsedColor = typeColor.formatRgb();
				const darkerColor = typeColor.darker(0.3).formatRgb();

				claims.push({
					...d,
					r,
					x,
					y,
					category: topic,
					title,
					color: parsedColor,
					darkerColor
				});
			});
		});

		bubbles = claims;
	}; // let bubbleSimulation = forceSimulation(bubbles)
	//   // .force("x", forceX(d => d.x).strength(1))
	//   .force("x", forceX(d => d.x).strength(0.1))
	//   .force("y", forceY(d => d.y).strength(0.1))

	//   .force("collide", forceCollide(d => d.r * 1.8))
	//   // .force("r", forceRadial(d => d.distance).strength(5))
	//   .on("tick", drawCanvas)
	//   .alphaMin(0.06)
	//   // .stop()
	// range(0, 500).forEach(i => bubbleSimulation.tick())
	let delaunay = null;

	const updateDelaunay = () => {
		setTimeout(() => {
			delaunay = d3Delaunay.Delaunay.from(bubbles, d => d.x * constant, d => d.y * constant);
		});
	};

	const debounceUpdateDelaunay = debounce(updateDelaunay, 100);

	const drawCanvas = () => {
		return;
	};

	const debouncedDrawCanvas = debounce(drawCanvas, 500);
	if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
	if ($$props.isFiltered === void 0 && $$bindings.isFiltered && isFiltered !== void 0) $$bindings.isFiltered(isFiltered);
	if ($$props.filterIteration === void 0 && $$bindings.filterIteration && filterIteration !== void 0) $$bindings.filterIteration(filterIteration);
	if ($$props.filterFunction === void 0 && $$bindings.filterFunction && filterFunction !== void 0) $$bindings.filterFunction(filterFunction);
	if ($$props.filterColor === void 0 && $$bindings.filterColor && filterColor !== void 0) $$bindings.filterColor(filterColor);
	if ($$props.iteration === void 0 && $$bindings.iteration && iteration !== void 0) $$bindings.iteration(iteration);
	if ($$props.isEmbedded === void 0 && $$bindings.isEmbedded && isEmbedded !== void 0) $$bindings.isEmbedded(isEmbedded);
	$$result.css.add(css$4);
	let constant = width / 1000;

	let height = width * (   0.6);

	let bubbleSize = Math.max(1, Math.round(width / 700));

	 {
		(debounceUpdateSpiralPositions());
	}

	let xScale = d3Scale.scaleLinear().domain([-1, types.length]).range([0, width]);
	let ageScale = d3Scale.scaleLinear().domain([d3Array.min([new Date(), d3Array.max(data.map(dateAccessor))]), d3Array.min(data.map(dateAccessor))]).range([1, 0.2]);
	let rScale = d3Scale.scaleSqrt().domain(d3Array.extent(data.map(d => d))).range([10, 20]);

	let groupRScale = d3Scale.scaleSqrt().domain([
		0,
		d3Array.max(types.map(type => data.filter(d => tagsAccessor(d).includes(type)).length))
	]).range([10, width * 0.4]);

	 {
		types.forEach((type, i) => {
			// typeColors[type] = colors[i % colors.length]
			const typeColor = typeColors[type] || "#d4d4d4";

			typeBorderColors[type] = d3Color.color(typeColor).darker(0.6).formatHex();
		});
	}

	 {
		tagCategories.map((category, i) => {
			const angle = 360 / tagCategories.length * i;
			categoryOffsets[category] = getPositionFromAngle(angle, Math.min(height, width) / 5);
		});
	}

	 {
		(debounceUpdateDelaunay());
	}

	 {
		(updateGroups());
	}

	 {
		debouncedDrawCanvas();
	}

	 {
		(debouncedDrawCanvas());
	}

	let topLeftBubble = delaunay && bubbles[delaunay.find(constant * 0.05, 0)];

	return `

<div class="${"c svelte-47bkc1"}">
  <canvas${add_attribute("style", `width: ${width}px; height: ${height}px`, 0)}${add_attribute("this", canvasElement, 1)}></canvas>

  <svg${add_attribute("width", width, 0)}${add_attribute("height", height, 0)} class="${"svelte-47bkc1"}">
    ${each(groupBubbles, ({ type, x, y, r, labelR, color, darkerColor }, i) => `<g${add_attribute("fill", color, 0)}${add_attribute("transform", `translate(${x * constant}, ${y * constant})`, 0)} class="${"svelte-47bkc1"}">
        

        <path class="${"hidden svelte-47bkc1"}"${add_attribute(
		"d",
		[
			["M", 0, -(labelR * constant - 16)].join(" "),
			[
				"A",
				labelR * constant - 16,
				labelR * constant - 16,
				0,
				0,
				1,
				0,
				labelR * constant - 16
			].join(" "),
			[
				"A",
				labelR * constant - 16,
				labelR * constant - 16,
				0,
				0,
				1,
				0,
				-(labelR * constant - 16)
			].join(" ")
		].join(" "),
		0
	)} fill="${"none"}"${add_attribute("id", `path-${type}`, 0)}${add_attribute("transform", `rotate(-147)`, 0)}></path>
        <text class="${"svelte-47bkc1"}">
          <textPath${add_attribute("href", `#path-${type}`, 0)} class="${"boundary-label svelte-47bkc1"}" startOffset="${"40%"}"${add_attribute("fill", darkerColor, 0)}>
            ${escape(type || "Other")}
          </textPath>
        </text>
      </g>`)}

    ${topLeftBubble && Number.isFinite(topLeftBubble.x)
	? `<path class="${"annotation-line svelte-47bkc1"}"${add_attribute(
			"d",
			[
				"M",
				topLeftBubble.x * constant - bubbleSize,
				topLeftBubble.y * constant,
				"Q",
				topLeftBubble.x * constant - 50,
				topLeftBubble.y * constant,
				topLeftBubble.x * constant - 50,
				topLeftBubble.y * constant - 45
			].join(" "),
			0
		)}></path>`
	: ``}
  </svg>

  ${ ``}

  ${topLeftBubble
	? `<div class="${"annotation svelte-47bkc1"}"${add_attribute("style", `transform: translate(${Math.max(130, topLeftBubble.x * constant - ( 50))}px, ${topLeftBubble.y * constant - 50}px)`, 0)}>
      <div class="${"annotation-contents svelte-47bkc1"}">
        Each fact check is represented as a circle, which fades with age
      </div>
    </div>`
	: ``}

  ${!isEmbedded
	? `${validate_component(DataSource, "DataSource").$$render($$result, {}, {}, {})}`
	: ``}
</div>`;
});

const countryCentroids = {
  "Bermuda": [
    null,
    null
  ],
  "Aruba": [
    null,
    null
  ],
  "Anguilla": [
    null,
    null
  ],
  "Antigua and Barbuda": [
    null,
    null
  ],
  "The Bahamas": [
    null,
    null
  ],
  "Saint Barthelemy": [
    null,
    null
  ],
  "Belize": [
    0.13171704459377254,
    0.3403585302753441
  ],
  "Barbados": [
    null,
    null
  ],
  "Canada": [
    0.20928649455261472,
    0.17782188647274302
  ],
  "Costa Rica": [
    0.13934390503951435,
    0.3756318161388869
  ],
  "Cuba": [
    0.16551256677828516,
    0.3321145335858318
  ],
  "Curaçao": [
    null,
    null
  ],
  "Cayman Islands": [
    null,
    null
  ],
  "Dominica": [
    null,
    null
  ],
  "Grenada": [
    null,
    null
  ],
  "Dominican Republic": [
    0.1886734228760067,
    0.3514133595173143
  ],
  "Guatemala": [
    0.12583113004279903,
    0.34484812708219664
  ],
  "Greenland": [
    0.36467998509077987,
    0.17388279982161314
  ],
  "Panama": [
    0.15116914250534982,
    0.38614679538466207
  ],
  "Saint Kitts and Nevis": [
    null,
    null
  ],
  "Jamaica": [
    0.16625216181319533,
    0.3480078868655495
  ],
  "Saint Martin": [
    null,
    null
  ],
  "Montserrat": [
    null,
    null
  ],
  "Puerto Rico": [
    0.20108308439024494,
    0.357973792392573
  ],
  "El Salvador": [
    0.12837911216409456,
    0.35474284518730337
  ],
  "Saint Pierre and Miquelon": [
    null,
    null
  ],
  "Saint Lucia": [
    null,
    null
  ],
  "Haiti": [
    0.1817964177955457,
    0.34961075589364543
  ],
  "Mexico": [
    0.10645900810978569,
    0.2979853759544969
  ],
  "Nicaragua": [
    0.13873401514082176,
    0.3626579057879869
  ],
  "United States of America": [
    0.1472694814270427,
    0.22394396220155272
  ],
  "Sint Maarten": [
    null,
    null
  ],
  "British Virgin Islands": [
    null,
    null
  ],
  "United States Virgin Islands": [
    null,
    null
  ],
  "Saint Vincent and the Grenadines": [
    null,
    null
  ],
  "Turks and Caicos Islands": [
    null,
    null
  ],
  "Trinidad and Tobago": [
    null,
    null
  ],
  "Argentina": [
    0.22661221798860867,
    0.5529476607426536
  ],
  "Bolivia": [
    0.20669555374599322,
    0.5006148410856097
  ],
  "Brazil": [
    0.24639654606610273,
    0.4846152074825729
  ],
  "Chile": [
    0.20639790725977186,
    0.5438766192227614
  ],
  "Ecuador": [
    0.15470129623361764,
    0.4291738762626731
  ],
  "Falkland Islands": [
    0.2747755937322645,
    0.5993450523528681
  ],
  "Colombia": [
    0.17244652585641312,
    0.4121706712137533
  ],
  "Guyana": [
    0.22093287624158206,
    0.4214123702241112
  ],
  "Peru": [
    0.1698665569882964,
    0.4628506791574167
  ],
  "Paraguay": [
    0.23362555129358684,
    0.5285323595200357
  ],
  "Uruguay": [
    0.2527356821415618,
    0.5597055143152063
  ],
  "Suriname": [
    0.23199625097296636,
    0.4268896983493615
  ],
  "Venezuela": [
    0.19649878273078594,
    0.4054126010914677
  ],
  "Afghanistan": [
    0.7181713143886249,
    0.30672338779175184
  ],
  "Honduras": [
    0.1356312692529058,
    0.3524817916163895
  ],
  "United Arab Emirates": [
    0.6845754406559204,
    0.3555181796467396
  ],
  "Azerbaijan": [
    0.6457964700384844,
    0.2901597652524131
  ],
  "Armenia": [
    0.6361265586965184,
    0.29113268760452865
  ],
  "Bahrain": [
    null,
    null
  ],
  "Bangladesh": [
    0.8118266525700453,
    0.3290006857761527
  ],
  "Brunei": [
    0.8978971246197414,
    0.3845476693325236
  ],
  "Bhutan": [
    0.8080920936646482,
    0.31396887265149565
  ],
  "China": [
    0.8253937915730233,
    0.2674964322109286
  ],
  "Cyprus": [
    0.5955977782112274,
    0.3172899359302363
  ],
  "Northern Cyprus": [
    0.596111237814242,
    0.31603031649118
  ],
  "Georgia": [
    0.6295992383540132,
    0.28411157424839517
  ],
  "Hong Kong": [
    null,
    null
  ],
  "Indonesia": [
    0.8960226799255057,
    0.40967162328158574
  ],
  "India": [
    0.7761918336647823,
    0.3429409671248924
  ],
  "Israel": [
    0.6043744419210211,
    0.331274808826504
  ],
  "Jordan": [
    0.6113861096771646,
    0.3318451679422677
  ],
  "Siachen Glacier": [
    null,
    null
  ],
  "Japan": [
    0.9042945103523351,
    0.2230794714289959
  ],
  "Kazakhstan": [
    0.7015542229074753,
    0.24961953056648722
  ],
  "Iran": [
    0.6774073737220639,
    0.3189396639741831
  ],
  "Iraq": [
    0.6372311674949394,
    0.32167552924829823
  ],
  "Indian Ocean Territories": [
    null,
    null
  ],
  "Kyrgyzstan": [
    0.7371967221053687,
    0.2697210740975524
  ],
  "Cambodia": [
    0.8669234818930744,
    0.3611101953505977
  ],
  "South Korea": [
    0.8886392672303867,
    0.23840182059486745
  ],
  "Kuwait": [
    0.6547225911238667,
    0.3358823340967431
  ],
  "Lebanon": [
    0.606503999010231,
    0.3208900928795242
  ],
  "Laos": [
    0.8583058403555681,
    0.3375804056383913
  ],
  "Macao S.A.R": [
    null,
    null
  ],
  "Myanmar": [
    0.8339232477225216,
    0.3341557067283229
  ],
  "Sri Lanka": [
    0.7917914648380022,
    0.40649587623846994
  ],
  "Mongolia": [
    0.8070555749635644,
    0.2268302087314953
  ],
  "Malaysia": [
    0.8832327343473704,
    0.3935132294352646
  ],
  "Nepal": [
    0.7861301140548415,
    0.31618342232587193
  ],
  "Oman": [
    0.6934125350394255,
    0.3690644546051643
  ],
  "Pakistan": [
    0.7340425681556614,
    0.32087036713765976
  ],
  "Qatar": [
    0.6715246930312319,
    0.3511512978493522
  ],
  "Saudi Arabia": [
    0.6459184645854036,
    0.35954248738739836
  ],
  "Philippines": [
    0.9141572478334288,
    0.3431227630952986
  ],
  "North Korea": [
    0.8788009345612665,
    0.2258963220469093
  ],
  "Palestine": [
    0.6051528681307973,
    0.3296361790261499
  ],
  "Singapore": [
    null,
    null
  ],
  "Syria": [
    0.6158627524529567,
    0.31530872010658473
  ],
  "Thailand": [
    0.8534095953745293,
    0.35510956247455905
  ],
  "Tajikistan": [
    0.7294226056597786,
    0.2836791966289044
  ],
  "Turkmenistan": [
    0.6891711101985436,
    0.28895552325150214
  ],
  "East Timor": [
    0.9235723471957437,
    0.4251051382758843
  ],
  "Turkey": [
    0.6005732097137111,
    0.29958234527932615
  ],
  "Taiwan": [
    0.8971085018125334,
    0.29634771076534094
  ],
  "Uzbekistan": [
    0.6988209197247239,
    0.27619566890710195
  ],
  "Vietnam": [
    0.8671295282865426,
    0.34280183921954904
  ],
  "Yemen": [
    0.6618989870613848,
    0.39354628049266027
  ],
  "Angola": [
    0.5367301104195196,
    0.5177139766107718
  ],
  "Burundi": [
    0.5906432427939798,
    0.4814916234926744
  ],
  "Benin": [
    0.47121785308905995,
    0.4300133221125696
  ],
  "Burkina Faso": [
    0.4537269776530534,
    0.4180707898169477
  ],
  "Botswana": [
    0.562167361224296,
    0.5514083993549739
  ],
  "Central African Republic": [
    0.5499564074423022,
    0.442382117159336
  ],
  "Cameroon": [
    0.5162804199552236,
    0.4467551694288562
  ],
  "Republic of Congo": [
    0.5273326623503053,
    0.47362397695817104
  ],
  "Democratic Republic of the Congo": [
    0.5635881524328313,
    0.48014657940116273
  ],
  "Comoros": [
    null,
    null
  ],
  "Cape Verde": [
    null,
    null
  ],
  "Ivory Coast": [
    0.4369585399730348,
    0.4375069868876865
  ],
  "Djibouti": [
    0.6430015264562826,
    0.41393899883910334
  ],
  "Egypt": [
    0.5859246121607841,
    0.3543586108254202
  ],
  "Algeria": [
    0.47400498530787916,
    0.35003460467258013
  ],
  "Eritrea": [
    0.6264106515558611,
    0.3996966928348841
  ],
  "Ghana": [
    0.4558291253916562,
    0.43679897619801655
  ],
  "Gabon": [
    0.5122761494956343,
    0.4731212252523905
  ],
  "Guinea": [
    0.4142343165194828,
    0.4241208933984981
  ],
  "Gambia": [
    0.3925198369571,
    0.410122084962424
  ],
  "Guinea Bissau": [
    0.39754110705896867,
    0.41615244422453396
  ],
  "Ethiopia": [
    0.6311890771115799,
    0.42836875471382907
  ],
  "Kenya": [
    0.6243787854158351,
    0.46277816848914766
  ],
  "Equatorial Guinea": [
    0.5066491501179163,
    0.4643454823094789
  ],
  "Liberia": [
    0.42068768781906685,
    0.4416263568972047
  ],
  "Libya": [
    0.5373258304113331,
    0.35428550118394203
  ],
  "Lesotho": [
    0.5782892414487071,
    0.5734483054276502
  ],
  "Morocco": [
    0.42870592203054536,
    0.34095424498929155
  ],
  "Madagascar": [
    0.6573799253610786,
    0.5340904733473122
  ],
  "Mauritania": [
    0.4187164634500084,
    0.38180946101229846
  ],
  "Mali": [
    0.4467984823644568,
    0.3957744798017804
  ],
  "Mozambique": [
    0.6126618910792245,
    0.5309774732302192
  ],
  "Malawi": [
    0.6080742970583354,
    0.5178706670095553
  ],
  "Namibia": [
    0.5345209600107392,
    0.5516942966129736
  ],
  "Niger": [
    0.5016314217528293,
    0.3964967202387761
  ],
  "Nigeria": [
    0.4960183952187085,
    0.4303058972695365
  ],
  "Rwanda": [
    0.5910183864728337,
    0.47597197600482666
  ],
  "Western Sahara": [
    0.4122398201776444,
    0.36402193242951186
  ],
  "Sudan": [
    0.5890364509278979,
    0.39990941441288547
  ],
  "South Sudan": [
    0.5918950720032549,
    0.4372298510582338
  ],
  "Senegal": [
    0.3999376733207229,
    0.40638816462901284
  ],
  "Somalia": [
    0.6572045309665788,
    0.44213265005639035
  ],
  "Somaliland": [
    0.6587196983356749,
    0.4209078989013687
  ],
  "Sierra Leone": [
    0.41013767037549265,
    0.431993379755882
  ],
  "Sao Tome and Principe": [
    null,
    null
  ],
  "Chad": [
    0.5413480946114744,
    0.4049869016086128
  ],
  "Togo": [
    0.4651808956449896,
    0.4342272971081515
  ],
  "Tunisia": [
    0.502208404157651,
    0.3244568124627526
  ],
  "Swaziland": [
    0.5925947778999673,
    0.5637429589120764
  ],
  "Tanzania": [
    0.6112164919021782,
    0.4912521459283101
  ],
  "Uganda": [
    0.6013377868043801,
    0.4618887755728691
  ],
  "South Africa": [
    0.5663786933669342,
    0.5714454753774243
  ],
  "Zimbabwe": [
    0.5881251819687994,
    0.5396977780851832
  ],
  "Zambia": [
    0.5807297888413896,
    0.520474143056648
  ],
  "Albania": [
    0.5422392534064485,
    0.2942372974830522
  ],
  "Aland": [
    null,
    null
  ],
  "Andorra": [
    null,
    null
  ],
  "Austria": [
    0.5187910220985845,
    0.2692594053627015
  ],
  "Belgium": [
    0.4844301973073952,
    0.25769365163093744
  ],
  "Bulgaria": [
    0.5611167813896759,
    0.28694725455598996
  ],
  "Bosnia and Herzegovina": [
    0.5329793040891362,
    0.2825852082882672
  ],
  "Belarus": [
    0.5659698949412582,
    0.24526227098065376
  ],
  "Switzerland": [
    0.4971928879281298,
    0.2724128710971807
  ],
  "Czech Republic": [
    0.5230275483950815,
    0.26111628449670704
  ],
  "Germany": [
    0.5049653628227472,
    0.2563211638002032
  ],
  "Denmark": [
    0.5021984161025689,
    0.2378211811432315
  ],
  "Spain": [
    0.4518839478788344,
    0.29739922585195483
  ],
  "Finland": [
    0.5538383369208946,
    0.20922137290468754
  ],
  "Estonia": [
    0.5559972193038741,
    0.22747752560179757
  ],
  "United Kingdom": [
    0.45955768395436714,
    0.24490131601673015
  ],
  "Faroe Islands": [
    null,
    null
  ],
  "Guernsey": [
    null,
    null
  ],
  "France": [
    0.49230696478790405,
    0.2896365927085607
  ],
  "Greece": [
    0.5522821271792292,
    0.30082227638654263
  ],
  "Croatia": [
    0.5280706914268383,
    0.27850006108732045
  ],
  "Hungary": [
    0.5381663561943985,
    0.27044401851267724
  ],
  "Isle of Man": [
    null,
    null
  ],
  "Iceland": [
    0.4152646030516406,
    0.20481182178168972
  ],
  "Italy": [
    0.5117109012961453,
    0.28821372122806416
  ],
  "Ireland": [
    0.4405463263453183,
    0.24684613146381099
  ],
  "Jersey": [
    null,
    null
  ],
  "Kosovo": [
    0.5448165470052437,
    0.2888209453439787
  ],
  "Liechtenstein": [
    null,
    null
  ],
  "Lithuania": [
    0.5510221491647042,
    0.23951859641985182
  ],
  "Luxembourg": [
    null,
    null
  ],
  "Monaco": [
    null,
    null
  ],
  "Latvia": [
    0.5536395883381676,
    0.2339728974298109
  ],
  "Malta": [
    null,
    null
  ],
  "Moldova": [
    0.5709680229002915,
    0.2687387422467717
  ],
  "Montenegro": [
    0.538931830807054,
    0.28806496987131164
  ],
  "Macedonia": [
    0.5484158903782419,
    0.2921931478495532
  ],
  "Norway": [
    0.5151030415426849,
    0.20376861639425797
  ],
  "Netherlands": [
    0.4881922485164019,
    0.25183702423393883
  ],
  "Poland": [
    0.5366778127314749,
    0.251853273694209
  ],
  "Portugal": [
    0.43477314752325813,
    0.29939338177026914
  ],
  "San Marino": [
    null,
    null
  ],
  "Slovenia": [
    0.521615672499297,
    0.2749536768932853
  ],
  "Sweden": [
    0.5238893914409444,
    0.21622712809219394
  ],
  "Republic of Serbia": [
    0.5440963494545534,
    0.2820102946727537
  ],
  "Slovakia": [
    0.5381783208595939,
    0.26453017813505936
  ],
  "Romania": [
    0.5589805765885697,
    0.27489257519121196
  ],
  "Ukraine": [
    0.5804926808431154,
    0.26125569988885794
  ],
  "Vatican": [
    null,
    null
  ],
  "American Samoa": [
    null,
    null
  ],
  "Russia": [
    0.7302266960611202,
    0.18752277050573227
  ],
  "Ashmore and Cartier Islands": [
    null,
    null
  ],
  "Cook Islands": [
    null,
    null
  ],
  "Fiji": [
    0.9870096998770767,
    2.8863577908385443
  ],
  "Federated States of Micronesia": [
    null,
    null
  ],
  "Australia": [
    0.9120226799255057,
    0.45967162328158574
  ],
  "Guam": [
    null,
    null
  ],
  "Kiribati": [
    null,
    null
  ],
  "Marshall Islands": [
    null,
    null
  ],
  "Northern Mariana Islands": [
    null,
    null
  ],
  "New Caledonia": [
    0.9731238279789718,
    0.4187717119060966
  ],
  "Norfolk Island": [
    null,
    null
  ],
  "Niue": [
    null,
    null
  ],
  "New Zealand": [
    0.9321872762925474,
    2.9784144852198944
  ],
  "Nauru": [
    null,
    null
  ],
  "Pitcairn Islands": [
    null,
    null
  ],
  "Palau": [
    null,
    null
  ],
  "Papua New Guinea": [
    0.9615800208837847,
    0.39037726272690015
  ],
  "French Polynesia": [
    null,
    null
  ],
  "Tonga": [
    null,
    null
  ],
  "Solomon Islands": [
    0.9812553578556825,
    0.3812874136890092
  ],
  "Wallis and Futuna": [
    null,
    null
  ],
  "Vanuatu": [
    null,
    null
  ],
  "Samoa": [
    null,
    null
  ],
  "West Africa": [
    0.4467984823644568,
    0.3957744798017804
  ],
  "Hong Kong": [
    0.8761085018125334,
    0.31834771076534094
  ]
};

/* src/components/Map.svelte generated by Svelte v3.19.1 */

const css$5 = {
	code: ".c.svelte-1r0m9n7.svelte-1r0m9n7{position:relative;width:99%;margin:-2em auto 0}svg.svelte-1r0m9n7.svelte-1r0m9n7{position:absolute;top:0;right:0;bottom:0;left:0}text.svelte-1r0m9n7.svelte-1r0m9n7{font-size:0.8em}.text-bg.svelte-1r0m9n7.svelte-1r0m9n7{stroke:white;stroke-width:3}.annotation.svelte-1r0m9n7.svelte-1r0m9n7{position:absolute;top:0;left:0;pointer-events:none;z-index:5}.annotation-contents.svelte-1r0m9n7.svelte-1r0m9n7{max-width:11em;text-align:right;font-size:0.9em;line-height:1.3em;transform:translate(-100%, -100%)}.annotation-line.svelte-1r0m9n7.svelte-1r0m9n7{fill:none;stroke:#171c4f;stroke-width:1}.bubble.svelte-1r0m9n7.svelte-1r0m9n7{mix-blend-mode:multiply;transition:all 0.3s ease-out}text.svelte-1r0m9n7.svelte-1r0m9n7{pointer-events:none;font-weight:700}.bubble-group.svelte-1r0m9n7 .label.svelte-1r0m9n7{opacity:0}.bubble-group.svelte-1r0m9n7:hover .label.svelte-1r0m9n7{opacity:1}.bubble-group.svelte-1r0m9n7:hover .bubble.svelte-1r0m9n7{mix-blend-mode:normal;stroke:#171c4f}.text-middle.svelte-1r0m9n7.svelte-1r0m9n7{text-anchor:middle}@media(max-width: 800px){.c.svelte-1r0m9n7.svelte-1r0m9n7{margin-top:-1em}.annotation.svelte-1r0m9n7.svelte-1r0m9n7{font-size:0.7em}.annotation-line.svelte-1r0m9n7.svelte-1r0m9n7{display:none}}@media(max-width: 590px){.c.svelte-1r0m9n7.svelte-1r0m9n7{margin-top:0}}",
	map: "{\"version\":3,\"file\":\"Map.svelte\",\"sources\":[\"Map.svelte\"],\"sourcesContent\":[\"<script>\\n  import { onMount } from \\\"svelte\\\"\\n  import { scaleOrdinal, scaleLinear, scaleSqrt, scaleTime } from \\\"d3-scale\\\"\\n  import { extent, max, range } from \\\"d3-array\\\"\\n  import { color } from \\\"d3-color\\\"\\n  import { interpolateHclLong } from \\\"d3-interpolate\\\"\\n  import { format } from \\\"d3-format\\\"\\n  import { timer } from \\\"d3-timer\\\"\\n  import { Delaunay } from \\\"d3-delaunay\\\"\\n  import { forceSimulation, forceX, forceY, forceCollide, forceRadial } from \\\"d3-force\\\"\\n  import { timeFormat, timeParse } from \\\"d3-time-format\\\"\\n  import { geoArmadillo } from \\\"d3-geo-projection\\\"\\n  import { timeDay } from \\\"d3-time\\\"\\n  import { easeCubicOut } from \\\"d3-ease\\\"\\n  import { geoEqualEarth, geoOrthographic, geoPath, geoCentroid, geoGraticule10 } from \\\"d3-geo\\\"\\n\\n  // import countryShapes from \\\"./countries.json\\\"\\n  import { debounce, getDistanceBetweenPoints, getPositionFromAngle, scaleCanvas } from \\\"./utils\\\"\\n  import { dateAccessor, parseDate, countryAccessor, categories, categoryColors, categoryAccessor } from \\\"./data-utils\\\"\\n  import { countryShapes, countryCentroids, countryCentroidsVertical } from \\\"./countryData\\\"\\n  import ItemTooltip from \\\"./ItemTooltip.svelte\\\"\\n  import DataSource from \\\"./DataSource.svelte\\\"\\n\\n  export let data = []\\n  export let isFiltered\\n  export let filterIteration\\n  export let filterFunction\\n  export let countries\\n  export let iteration\\n  export let isEmbedded\\n\\n  // const parseDate = timeParse(\\\"%Y-%m-%d\\\")\\n  const formatDate = timeFormat(\\\"%A %B %-d, %Y\\\")\\n  let hoveredClaim = null\\n  let canvasElement = null\\n  // let windowWidth = 1200\\n  let width = 1200\\n  $: isVertical = width < 445\\n  $: height = width * (\\n    isVertical ? 2 : 0.7\\n  )\\n  $: bubbleSize = width * (isVertical ? 0.0027 : 0.0015)\\n  let highlightIndex = null\\n  let timeElapsed = 0\\n  let initTransitionProgress = 1\\n  let hasHovered = false\\n  let hasInited = false\\n\\n  const windowGlobal = typeof window !== \\\"undefined\\\" && window\\n  const pixelRatio = windowGlobal.devicePixelRatio || 1\\n\\n  const sphere = ({type: \\\"Sphere\\\"})\\n  $: projection = isVertical ? (\\n    geoOrthographic()\\n    .fitSize([width, width], sphere)\\n    .rotate([-60, -20])\\n  ) : (\\n    geoArmadillo()\\n    .fitSize([width, height], sphere)\\n    .rotate([-9, 0])\\n  )\\n  $: projection2 = isVertical && (\\n    geoOrthographic()\\n      .fitSize([width, width], sphere)\\n      .translate([width / 2, height * 0.7])\\n      .rotate([90, -20])\\n  )\\n  $: svgPathGenerator = geoPath(projection)\\n\\n  let categoryOffsets = {}\\n  categories.forEach((category, i) => {\\n    const angle = 360 / categories.length * i\\n    categoryOffsets[category] = getPositionFromAngle(angle, 1)\\n  })\\n\\n  let bubbles = []\\n  let countryData = {}\\n  let numberOfTotalClaimsByCountry = {}\\n  const updateBubbles = () => {\\n    countryData = {}\\n    const claimsByCountry = {}\\n\\n    data.forEach(d => {\\n      const country = countryAccessor(d)\\n      if (!country) return\\n      numberOfTotalClaimsByCountry[country] = (numberOfTotalClaimsByCountry[country] || 0) + 1\\n      if (isFiltered && !filterFunction(d)) return\\n      if (!claimsByCountry[country]) claimsByCountry[country] = []\\n      claimsByCountry[country].push(d)\\n    })\\n    const rScale = scaleSqrt()\\n      .domain([0, max(Object.values(claimsByCountry).map(d => d.length))])\\n      .range([0, 37])\\n\\n    const colorScale = scaleLinear()\\n      .domain([0, max(Object.values(claimsByCountry).map(d => d.length))])\\n      .range([\\\"#67B244\\\", \\\"#67B244\\\"])\\n\\n    countries.forEach(country => {\\n      const countryCentroid = isVertical ? countryCentroidsVertical[country] : countryCentroids[country]\\n      if (!countryCentroid) return {x: 0, y: 0, r: 0}\\n      if (!countryCentroid[0] && !countryCentroid[1]) return {x: 0, y: 0, r: 0}\\n\\n      const numberOfPoints = (claimsByCountry[country] || [])\\n        .length\\n\\n      const r = rScale(numberOfPoints * 3)\\n\\n      countryData[country] = {\\n        name: country,\\n        x: countryCentroid[0],\\n        y: countryCentroid[1],\\n        count: numberOfPoints,\\n        r: r / width,\\n        labelR: (r + 19) / width,\\n        color: colorScale(numberOfPoints),\\n      }\\n    })\\n\\n    // // bubbles = claims\\n    // bubbles = [...claims]\\n    // let simulation = forceSimulation()\\n    //   // .force(\\\"x\\\", forceX(d => d.x).strength(1))\\n    //   .force(\\\"x\\\", forceX(d => d.x).strength(0.05))\\n    //   .force(\\\"y\\\", forceY(d => d.y).strength(0.05))\\n    //   .force(\\\"collide\\\", forceCollide(d => (bubbleSize / width) * 1.3).strength(1))\\n    //   // .force(\\\"r\\\", forceRadial(d => d.distance).strength(5))\\n    //   .nodes(bubbles)\\n    //   .alphaMin(0.006)\\n    //   .on(\\\"tick\\\", drawBubbles)\\n\\n    // range(0, 220).forEach(i => simulation.tick())\\n  }\\n  $: iteration, filterIteration, isVertical, updateBubbles()\\n\\n  let blankMap\\n\\n  const drawCanvas = () => {\\n    if (!canvasElement) return\\n    const ctx = canvasElement.getContext(\\\"2d\\\")\\n    scaleCanvas(canvasElement, ctx, width, height)\\n\\n    const drawMap = projection => {\\n      const path = geoPath(projection, ctx)\\n      const drawPath = shape => {\\n        ctx.beginPath()\\n        path(shape)\\n      }\\n      drawPath(sphere)\\n      if (!isVertical) ctx.clip()\\n\\n      const fill = color => {\\n        ctx.fillStyle = color\\n        ctx.fill()\\n      }\\n      const stroke = color => {\\n        ctx.strokeStyle = color\\n        ctx.stroke()\\n      }\\n      drawPath(sphere)\\n      fill(\\\"#fff\\\")\\n      stroke(\\\"#bbb\\\")\\n      drawPath(geoGraticule10())\\n      stroke(\\\"#eee\\\")\\n      countryShapes.forEach((shape) => {\\n        drawPath(shape)\\n        fill(\\\"#f8f8f8\\\")\\n        stroke(\\\"#ccc\\\")\\n      })\\n      ctx.restore() // stop clipping\\n\\n      drawPath(sphere)\\n      stroke(\\\"#ccc\\\")\\n    }\\n    drawMap(projection)\\n    if (projection2) drawMap(projection2)\\n\\n    blankMap = ctx.getImageData(0, 0, width * 2, height * 2)\\n  }\\n\\n  const debouncedDrawCanvas = debounce(drawCanvas, 500)\\n  $: debouncedDrawCanvas()\\n  $: width, bubbles, filterIteration, (() => {\\n    debouncedDrawCanvas()\\n  })()\\n\\n  const clearTooltip = () => hoveredClaim = null\\n\\n  $: highlightedClaim = hoveredClaim || (!hasHovered && bubbles[highlightIndex])\\n\\n  $: topLeftBubble = (countryData[\\\"United States of America\\\"] || {}).r ? countryData[\\\"United States of America\\\"]\\n    : (Object.values(countryData).filter(d => (d || {}).r).sort((a,b) => a.x - b.x)[0] || {}).r ? Object.values(countryData).filter(d => d.r).sort((a,b) => a.x - b.x)[0]\\n    : null\\n\\n  $: sortedCountries = countries.sort((a,b) => (countryData[a] || {}).r > (countryData[b] || {}).r ? -1 : 1)\\n</script>\\n\\n<svelte:window on:scroll={clearTooltip} />\\n\\n<!-- <svelte:window bind:innerWidth={windowWidth} /> -->\\n\\n<div class=\\\"c\\\"\\n  bind:clientWidth={width}>\\n  <canvas style={`width: ${width}px; height: ${height}px`} bind:this={canvasElement} />\\n  <svg {width} {height}>\\n    {#each sortedCountries as country}\\n      {#if countryData[country]}\\n        <g class=\\\"bubble-group\\\" transform={`translate(${countryData[country].x * width}, ${countryData[country].y * width})`}>\\n          <circle\\n            class=\\\"bubble\\\"\\n            r={countryData[country].r * width}\\n            fill={countryData[country].color}\\n          />\\n\\n          <g class=\\\"label\\\">\\n            <text y={(country == \\\"United States of America\\\" ? 0 : -countryData[country].r * width) - 20} class=\\\"text-middle text-bg\\\">\\n              { country }\\n            </text>\\n            <text y={(country == \\\"United States of America\\\" ? 0 : -countryData[country].r * width) - 20} class=\\\"text-middle text-fg\\\">\\n              { country }\\n            </text>\\n            <text y={(country == \\\"United States of America\\\" ? 0 : -countryData[country].r * width) - 6} class=\\\"text-middle text-bg\\\">\\n              { format(\\\",\\\")(countryData[country].count) } {#if isFiltered}{` of ${format(\\\",\\\")(numberOfTotalClaimsByCountry[country])}`}{/if} fact checks\\n            </text>\\n            <text y={(country == \\\"United States of America\\\" ? 0 : -countryData[country].r * width) - 6} class=\\\"text-middle text-fg\\\">\\n              { format(\\\",\\\")(countryData[country].count) } {#if isFiltered}{` of ${format(\\\",\\\")(numberOfTotalClaimsByCountry[country])}`}{/if} fact checks\\n            </text>\\n          </g>\\n        </g>\\n      {/if}\\n    {/each}\\n    {#if topLeftBubble && Number.isFinite(topLeftBubble.x)}\\n      <path\\n        class=\\\"annotation-line\\\"\\n        d={[\\n          \\\"M\\\", (topLeftBubble.x - topLeftBubble.r) * width, topLeftBubble.y * width,\\n          \\\"Q\\\", (topLeftBubble.x - topLeftBubble.r) * width - 50, topLeftBubble.y * width,\\n          (topLeftBubble.x - topLeftBubble.r) * width - 50, topLeftBubble.y * width - 45\\n        ].join(\\\" \\\")}\\n      />\\n    {/if}\\n  </svg>\\n\\n  {#if topLeftBubble}\\n    <div class=\\\"annotation\\\" style={`transform: translate(${Math.max(150, (topLeftBubble.x - topLeftBubble.r) * width - (isVertical ? 0 : 50))}px, ${topLeftBubble.y * width - 50}px)`}>\\n      <div class=\\\"annotation-contents\\\">\\n        Each circle represents the number of fact checks {#if isFiltered} (with the applied filters){/if} that primarily originated in a country\\n      </div>\\n    </div>\\n  {/if}\\n\\n  {#if !isEmbedded}\\n    <DataSource />\\n  {/if}\\n</div>\\n\\n<style>\\n  .c {\\n    position: relative;\\n    width: 99%;\\n    margin: -2em auto 0;\\n    /* height: 65%; */\\n    /* overflow: hidden; */\\n  }\\n  svg {\\n    position: absolute;\\n    top: 0;\\n    right: 0;\\n    bottom: 0;\\n    left: 0;\\n  }\\n  text {\\n    font-size: 0.8em;\\n  }\\n  .text-bg {\\n    stroke: white;\\n    stroke-width: 3;\\n  }\\n  .text-number {\\n    fill: white;\\n    /* fill: #171c4f; */\\n    /* mix-blend-mode: multiply; */\\n    text-anchor: middle;\\n    font-weight: 700;\\n    font-size: 0.86em;\\n    dominant-baseline: middle;\\n  }\\n  .hovered-claim-highlight {\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n    width: 8px;\\n    height: 8px;\\n    border-radius: 100%;\\n    border: 1.5px solid;\\n  }\\n  .annotation {\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n    pointer-events: none;\\n    z-index: 5;\\n  }\\n  .annotation-contents {\\n    max-width: 11em;\\n    text-align: right;\\n    font-size: 0.9em;\\n    line-height: 1.3em;\\n    transform: translate(-100%, -100%);\\n  }\\n  .annotation-line {\\n    fill: none;\\n    stroke: #171c4f;\\n    stroke-width: 1;\\n  }\\n\\n  .bubble {\\n    mix-blend-mode: multiply;\\n    transition: all 0.3s ease-out;\\n  }\\n\\n  text {\\n    pointer-events: none;\\n    font-weight: 700;\\n  }\\n  .bubble-group .label {\\n    opacity: 0;\\n  }\\n  .bubble-group:hover .label {\\n    opacity: 1;\\n  }\\n  .bubble-group:hover .bubble {\\n    mix-blend-mode: normal;\\n    stroke: #171c4f;\\n  }\\n  .text-middle {\\n    text-anchor: middle;\\n  }\\n\\t@media (max-width: 800px) {\\n    .c {\\n      margin-top: -1em;\\n    }\\n    .annotation {\\n      font-size: 0.7em;\\n    }\\n    .annotation-line {\\n      display: none;\\n    }\\n  }\\n\\t@media (max-width: 590px) {\\n    .c {\\n      margin-top: 0;\\n    }\\n  }\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL01hcC5zdmVsdGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtFQUNFO0lBQ0Usa0JBQWtCO0lBQ2xCLFVBQVU7SUFDVixtQkFBbUI7SUFDbkIsaUJBQWlCO0lBQ2pCLHNCQUFzQjtFQUN4QjtFQUNBO0lBQ0Usa0JBQWtCO0lBQ2xCLE1BQU07SUFDTixRQUFRO0lBQ1IsU0FBUztJQUNULE9BQU87RUFDVDtFQUNBO0lBQ0UsZ0JBQWdCO0VBQ2xCO0VBQ0E7SUFDRSxhQUFhO0lBQ2IsZUFBZTtFQUNqQjtFQUNBO0lBQ0UsV0FBVztJQUNYLG1CQUFtQjtJQUNuQiw4QkFBOEI7SUFDOUIsbUJBQW1CO0lBQ25CLGdCQUFnQjtJQUNoQixpQkFBaUI7SUFDakIseUJBQXlCO0VBQzNCO0VBQ0E7SUFDRSxrQkFBa0I7SUFDbEIsTUFBTTtJQUNOLE9BQU87SUFDUCxVQUFVO0lBQ1YsV0FBVztJQUNYLG1CQUFtQjtJQUNuQixtQkFBbUI7RUFDckI7RUFDQTtJQUNFLGtCQUFrQjtJQUNsQixNQUFNO0lBQ04sT0FBTztJQUNQLG9CQUFvQjtJQUNwQixVQUFVO0VBQ1o7RUFDQTtJQUNFLGVBQWU7SUFDZixpQkFBaUI7SUFDakIsZ0JBQWdCO0lBQ2hCLGtCQUFrQjtJQUNsQixrQ0FBa0M7RUFDcEM7RUFDQTtJQUNFLFVBQVU7SUFDVixlQUFlO0lBQ2YsZUFBZTtFQUNqQjs7RUFFQTtJQUNFLHdCQUF3QjtJQUN4Qiw2QkFBNkI7RUFDL0I7O0VBRUE7SUFDRSxvQkFBb0I7SUFDcEIsZ0JBQWdCO0VBQ2xCO0VBQ0E7SUFDRSxVQUFVO0VBQ1o7RUFDQTtJQUNFLFVBQVU7RUFDWjtFQUNBO0lBQ0Usc0JBQXNCO0lBQ3RCLGVBQWU7RUFDakI7RUFDQTtJQUNFLG1CQUFtQjtFQUNyQjtDQUNEO0lBQ0c7TUFDRSxnQkFBZ0I7SUFDbEI7SUFDQTtNQUNFLGdCQUFnQjtJQUNsQjtJQUNBO01BQ0UsYUFBYTtJQUNmO0VBQ0Y7Q0FDRDtJQUNHO01BQ0UsYUFBYTtJQUNmO0VBQ0YiLCJmaWxlIjoic3JjL2NvbXBvbmVudHMvTWFwLnN2ZWx0ZSIsInNvdXJjZXNDb250ZW50IjpbIlxuICAuYyB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHdpZHRoOiA5OSU7XG4gICAgbWFyZ2luOiAtMmVtIGF1dG8gMDtcbiAgICAvKiBoZWlnaHQ6IDY1JTsgKi9cbiAgICAvKiBvdmVyZmxvdzogaGlkZGVuOyAqL1xuICB9XG4gIHN2ZyB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICByaWdodDogMDtcbiAgICBib3R0b206IDA7XG4gICAgbGVmdDogMDtcbiAgfVxuICB0ZXh0IHtcbiAgICBmb250LXNpemU6IDAuOGVtO1xuICB9XG4gIC50ZXh0LWJnIHtcbiAgICBzdHJva2U6IHdoaXRlO1xuICAgIHN0cm9rZS13aWR0aDogMztcbiAgfVxuICAudGV4dC1udW1iZXIge1xuICAgIGZpbGw6IHdoaXRlO1xuICAgIC8qIGZpbGw6ICMxNzFjNGY7ICovXG4gICAgLyogbWl4LWJsZW5kLW1vZGU6IG11bHRpcGx5OyAqL1xuICAgIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICBmb250LXNpemU6IDAuODZlbTtcbiAgICBkb21pbmFudC1iYXNlbGluZTogbWlkZGxlO1xuICB9XG4gIC5ob3ZlcmVkLWNsYWltLWhpZ2hsaWdodCB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHdpZHRoOiA4cHg7XG4gICAgaGVpZ2h0OiA4cHg7XG4gICAgYm9yZGVyLXJhZGl1czogMTAwJTtcbiAgICBib3JkZXI6IDEuNXB4IHNvbGlkO1xuICB9XG4gIC5hbm5vdGF0aW9uIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgei1pbmRleDogNTtcbiAgfVxuICAuYW5ub3RhdGlvbi1jb250ZW50cyB7XG4gICAgbWF4LXdpZHRoOiAxMWVtO1xuICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICAgIGZvbnQtc2l6ZTogMC45ZW07XG4gICAgbGluZS1oZWlnaHQ6IDEuM2VtO1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC0xMDAlLCAtMTAwJSk7XG4gIH1cbiAgLmFubm90YXRpb24tbGluZSB7XG4gICAgZmlsbDogbm9uZTtcbiAgICBzdHJva2U6ICMxNzFjNGY7XG4gICAgc3Ryb2tlLXdpZHRoOiAxO1xuICB9XG5cbiAgLmJ1YmJsZSB7XG4gICAgbWl4LWJsZW5kLW1vZGU6IG11bHRpcGx5O1xuICAgIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2Utb3V0O1xuICB9XG5cbiAgdGV4dCB7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgfVxuICAuYnViYmxlLWdyb3VwIC5sYWJlbCB7XG4gICAgb3BhY2l0eTogMDtcbiAgfVxuICAuYnViYmxlLWdyb3VwOmhvdmVyIC5sYWJlbCB7XG4gICAgb3BhY2l0eTogMTtcbiAgfVxuICAuYnViYmxlLWdyb3VwOmhvdmVyIC5idWJibGUge1xuICAgIG1peC1ibGVuZC1tb2RlOiBub3JtYWw7XG4gICAgc3Ryb2tlOiAjMTcxYzRmO1xuICB9XG4gIC50ZXh0LW1pZGRsZSB7XG4gICAgdGV4dC1hbmNob3I6IG1pZGRsZTtcbiAgfVxuXHRAbWVkaWEgKG1heC13aWR0aDogODAwcHgpIHtcbiAgICAuYyB7XG4gICAgICBtYXJnaW4tdG9wOiAtMWVtO1xuICAgIH1cbiAgICAuYW5ub3RhdGlvbiB7XG4gICAgICBmb250LXNpemU6IDAuN2VtO1xuICAgIH1cbiAgICAuYW5ub3RhdGlvbi1saW5lIHtcbiAgICAgIGRpc3BsYXk6IG5vbmU7XG4gICAgfVxuICB9XG5cdEBtZWRpYSAobWF4LXdpZHRoOiA1OTBweCkge1xuICAgIC5jIHtcbiAgICAgIG1hcmdpbi10b3A6IDA7XG4gICAgfVxuICB9XG4iXX0= */</style>\"],\"names\":[],\"mappings\":\"AAiQE,EAAE,8BAAC,CAAC,AACF,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,IAAI,CAAC,IAAI,CAAC,CAAC,AAGrB,CAAC,AACD,GAAG,8BAAC,CAAC,AACH,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,CAAC,CACT,IAAI,CAAE,CAAC,AACT,CAAC,AACD,IAAI,8BAAC,CAAC,AACJ,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,QAAQ,8BAAC,CAAC,AACR,MAAM,CAAE,KAAK,CACb,YAAY,CAAE,CAAC,AACjB,CAAC,AAmBD,WAAW,8BAAC,CAAC,AACX,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,cAAc,CAAE,IAAI,CACpB,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,oBAAoB,8BAAC,CAAC,AACpB,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,KAAK,CACjB,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,KAAK,CAClB,SAAS,CAAE,UAAU,KAAK,CAAC,CAAC,KAAK,CAAC,AACpC,CAAC,AACD,gBAAgB,8BAAC,CAAC,AAChB,IAAI,CAAE,IAAI,CACV,MAAM,CAAE,OAAO,CACf,YAAY,CAAE,CAAC,AACjB,CAAC,AAED,OAAO,8BAAC,CAAC,AACP,cAAc,CAAE,QAAQ,CACxB,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,QAAQ,AAC/B,CAAC,AAED,IAAI,8BAAC,CAAC,AACJ,cAAc,CAAE,IAAI,CACpB,WAAW,CAAE,GAAG,AAClB,CAAC,AACD,4BAAa,CAAC,MAAM,eAAC,CAAC,AACpB,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,4BAAa,MAAM,CAAC,MAAM,eAAC,CAAC,AAC1B,OAAO,CAAE,CAAC,AACZ,CAAC,AACD,4BAAa,MAAM,CAAC,OAAO,eAAC,CAAC,AAC3B,cAAc,CAAE,MAAM,CACtB,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,YAAY,8BAAC,CAAC,AACZ,WAAW,CAAE,MAAM,AACrB,CAAC,AACF,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACxB,EAAE,8BAAC,CAAC,AACF,UAAU,CAAE,IAAI,AAClB,CAAC,AACD,WAAW,8BAAC,CAAC,AACX,SAAS,CAAE,KAAK,AAClB,CAAC,AACD,gBAAgB,8BAAC,CAAC,AAChB,OAAO,CAAE,IAAI,AACf,CAAC,AACH,CAAC,AACF,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACxB,EAAE,8BAAC,CAAC,AACF,UAAU,CAAE,CAAC,AACf,CAAC,AACH,CAAC\"}"
};

const Map$1 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { data = [] } = $$props;
	let { isFiltered } = $$props;
	let { filterIteration } = $$props;
	let { filterFunction } = $$props;
	let { countries } = $$props;
	let { iteration } = $$props;
	let { isEmbedded } = $$props;

	// const parseDate = timeParse("%Y-%m-%d")
	const formatDate = d3TimeFormat.timeFormat("%A %B %-d, %Y");
	let canvasElement = null;

	// let windowWidth = 1200
	let width = 1200;
	const sphere = { type: "Sphere" };
	let countryData = {};
	let numberOfTotalClaimsByCountry = {};

	const updateBubbles = () => {
		countryData = {};
		const claimsByCountry = {};

		data.forEach(d => {
			const country = countryAccessor(d);
			if (!country) return;
			numberOfTotalClaimsByCountry[country] = (numberOfTotalClaimsByCountry[country] || 0) + 1;
			if (isFiltered && !filterFunction(d)) return;
			if (!claimsByCountry[country]) claimsByCountry[country] = [];
			claimsByCountry[country].push(d);
		});

		const rScale = d3Scale.scaleSqrt().domain([0, d3Array.max(Object.values(claimsByCountry).map(d => d.length))]).range([0, 37]);
		const colorScale = d3Scale.scaleLinear().domain([0, d3Array.max(Object.values(claimsByCountry).map(d => d.length))]).range(["#67B244", "#67B244"]);

		countries.forEach(country => {
			const countryCentroid =  countryCentroids[country];

			if (!countryCentroid) return { x: 0, y: 0, r: 0 };
			if (!countryCentroid[0] && !countryCentroid[1]) return { x: 0, y: 0, r: 0 };
			const numberOfPoints = (claimsByCountry[country] || []).length;
			const r = rScale(numberOfPoints * 3);

			countryData[country] = {
				name: country,
				x: countryCentroid[0],
				y: countryCentroid[1],
				count: numberOfPoints,
				r: r / width,
				labelR: (r + 19) / width,
				color: colorScale(numberOfPoints)
			};
		});
	}; // // bubbles = claims

	const drawCanvas = () => {
		return;
	};

	const debouncedDrawCanvas = debounce(drawCanvas, 500);
	if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
	if ($$props.isFiltered === void 0 && $$bindings.isFiltered && isFiltered !== void 0) $$bindings.isFiltered(isFiltered);
	if ($$props.filterIteration === void 0 && $$bindings.filterIteration && filterIteration !== void 0) $$bindings.filterIteration(filterIteration);
	if ($$props.filterFunction === void 0 && $$bindings.filterFunction && filterFunction !== void 0) $$bindings.filterFunction(filterFunction);
	if ($$props.countries === void 0 && $$bindings.countries && countries !== void 0) $$bindings.countries(countries);
	if ($$props.iteration === void 0 && $$bindings.iteration && iteration !== void 0) $$bindings.iteration(iteration);
	if ($$props.isEmbedded === void 0 && $$bindings.isEmbedded && isEmbedded !== void 0) $$bindings.isEmbedded(isEmbedded);
	$$result.css.add(css$5);
	let height = width * ( 0.7);

	let projection =  d3GeoProjection.geoArmadillo().fitSize([width, height], sphere).rotate([-9, 0]);
	let svgPathGenerator = d3Geo.geoPath(projection);

	 {
		(updateBubbles());
	}

	 {
		debouncedDrawCanvas();
	}

	 {
		((() => {
			debouncedDrawCanvas();
		})());
	}

	let topLeftBubble = (countryData["United States of America"] || {}).r
	? countryData["United States of America"]
	: (Object.values(countryData).filter(d => (d || {}).r).sort((a, b) => a.x - b.x)[0] || {}).r
		? Object.values(countryData).filter(d => d.r).sort((a, b) => a.x - b.x)[0]
		: null;

	let sortedCountries = countries.sort((a, b) => (countryData[a] || {}).r > (countryData[b] || {}).r
	? -1
	: 1);

	return `



<div class="${"c svelte-1r0m9n7"}">
  <canvas${add_attribute("style", `width: ${width}px; height: ${height}px`, 0)}${add_attribute("this", canvasElement, 1)}></canvas>
  <svg${add_attribute("width", width, 0)}${add_attribute("height", height, 0)} class="${"svelte-1r0m9n7"}">
    ${each(sortedCountries, country => `${countryData[country]
	? `<g class="${"bubble-group svelte-1r0m9n7"}"${add_attribute("transform", `translate(${countryData[country].x * width}, ${countryData[country].y * width})`, 0)}>
          <circle class="${"bubble svelte-1r0m9n7"}"${add_attribute("r", countryData[country].r * width, 0)}${add_attribute("fill", countryData[country].color, 0)}></circle>

          <g class="${"label svelte-1r0m9n7"}">
            <text${add_attribute(
			"y",
			(country == "United States of America"
			? 0
			: -countryData[country].r * width) - 20,
			0
		)} class="${"text-middle text-bg svelte-1r0m9n7"}">
              ${escape(country)}
            </text>
            <text${add_attribute(
			"y",
			(country == "United States of America"
			? 0
			: -countryData[country].r * width) - 20,
			0
		)} class="${"text-middle text-fg svelte-1r0m9n7"}">
              ${escape(country)}
            </text>
            <text${add_attribute(
			"y",
			(country == "United States of America"
			? 0
			: -countryData[country].r * width) - 6,
			0
		)} class="${"text-middle text-bg svelte-1r0m9n7"}">
              ${escape(d3Format.format(",")(countryData[country].count))} ${isFiltered
		? `${escape(` of ${d3Format.format(",")(numberOfTotalClaimsByCountry[country])}`)}`
		: ``} fact checks
            </text>
            <text${add_attribute(
			"y",
			(country == "United States of America"
			? 0
			: -countryData[country].r * width) - 6,
			0
		)} class="${"text-middle text-fg svelte-1r0m9n7"}">
              ${escape(d3Format.format(",")(countryData[country].count))} ${isFiltered
		? `${escape(` of ${d3Format.format(",")(numberOfTotalClaimsByCountry[country])}`)}`
		: ``} fact checks
            </text>
          </g>
        </g>`
	: ``}`)}
    ${topLeftBubble && Number.isFinite(topLeftBubble.x)
	? `<path class="${"annotation-line svelte-1r0m9n7"}"${add_attribute(
			"d",
			[
				"M",
				(topLeftBubble.x - topLeftBubble.r) * width,
				topLeftBubble.y * width,
				"Q",
				(topLeftBubble.x - topLeftBubble.r) * width - 50,
				topLeftBubble.y * width,
				(topLeftBubble.x - topLeftBubble.r) * width - 50,
				topLeftBubble.y * width - 45
			].join(" "),
			0
		)}></path>`
	: ``}
  </svg>

  ${topLeftBubble
	? `<div class="${"annotation svelte-1r0m9n7"}"${add_attribute("style", `transform: translate(${Math.max(150, (topLeftBubble.x - topLeftBubble.r) * width - ( 50))}px, ${topLeftBubble.y * width - 50}px)`, 0)}>
      <div class="${"annotation-contents svelte-1r0m9n7"}">
        Each circle represents the number of fact checks ${isFiltered ? `(with the applied filters)` : ``} that primarily originated in a country
      </div>
    </div>`
	: ``}

  ${!isEmbedded
	? `${validate_component(DataSource, "DataSource").$$render($$result, {}, {}, {})}`
	: ``}
</div>`;
});

/* src/components/ListFilter.svelte generated by Svelte v3.19.1 */

const css$6 = {
	code: ".filter.svelte-ykp2bq{position:relative;flex:1;min-width:7em;margin-left:0.6em;background:none;border:none}.filter--type-input.svelte-ykp2bq{flex:2;min-width:10em}.label.svelte-ykp2bq{padding-left:0.7em;font-size:0.8em;margin-bottom:0.5em}select.svelte-ykp2bq{width:100%;padding:0.6em 0.1em 0.6em 0.6em;background:#f4f4f4;border:none}.options.svelte-ykp2bq{margin-top:0.5em}.option.svelte-ykp2bq{display:block;width:calc(100% + 0.6em);margin:0 -0.6em 0 0;text-align:right;padding:0.3em 0.6em;font-size:0.8em;-webkit-appearance:none;-moz-appearance:none;appearance:none;background:none;border:none;cursor:pointer}.option.inactive.svelte-ykp2bq{color:#81818f !important}input.svelte-ykp2bq{width:calc(100% - 1.2em);padding:0.56em 0.6em;font-size:0.9em;line-height:1em;border:none;background:#f4f4f4}.clear.svelte-ykp2bq{position:absolute;top:0;right:0;font-size:0.6em;height:1em;width:1em;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#9696ad;background:#e3e3e9;padding:0.5em;border-radius:100%;transition:background 0.2s ease-out}.clear.svelte-ykp2bq:hover{background:#d2d2db}@media(max-width: 900px){.filter.svelte-ykp2bq{width:100%}select.svelte-ykp2bq{max-width:none;width:100%}}@media(max-width: 800px){input.svelte-ykp2bq{padding:0.9em 0.1em 0.9em 0.6em}}@media(max-width: 600px){.filter.svelte-ykp2bq{margin-left:0.6em}}",
	map: "{\"version\":3,\"file\":\"ListFilter.svelte\",\"sources\":[\"ListFilter.svelte\"],\"sourcesContent\":[\"<script>\\n  export let label\\n  export let value\\n  export let options\\n  export let type = \\\"dropdown\\\"\\n  export let placeholder = \\\"\\\"\\n  export let colors = {}\\n\\n  const onSelect = option => {\\n    value = option == value ? null : option\\n  }\\n</script>\\n\\n<div class={`filter filter--type-${type}`}>\\n  <div class=\\\"label\\\">\\n    { label }\\n  </div>\\n  {#if value}\\n    <div class=\\\"clear\\\" on:click={() => value = \\\"\\\"}>\\n      <!-- clear -->\\n      <svg width=\\\"0.7em\\\" height=\\\"0.7em\\\" viewBox=\\\"0 0 18 18\\\" fill=\\\"currentColor\\\">\\n        <path fill-rule=\\\"evenodd\\\" clip-rule=\\\"evenodd\\\" d=\\\"M16.945 4.88593C17.9213 3.90962 17.9213 2.32671 16.945 1.3504C15.9687 0.374086 14.3858 0.374086 13.4095 1.3504L9.17725 5.58263L4.94501 1.3504C3.9687 0.374086 2.38579 0.374086 1.40948 1.3504C0.433168 2.32671 0.433168 3.90962 1.40948 4.88593L5.64171 9.11816L1.40948 13.3504C0.433168 14.3267 0.433168 15.9096 1.40948 16.8859C2.38579 17.8622 3.9687 17.8622 4.94501 16.8859L9.17725 12.6537L13.4095 16.8859C14.3858 17.8622 15.9687 17.8622 16.945 16.8859C17.9213 15.9096 17.9213 14.3267 16.945 13.3504L12.7128 9.11816L16.945 4.88593Z\\\" />\\n      </svg>\\n\\n    </div>\\n  {/if}\\n  {#if type == \\\"dropdown\\\"}\\n    <select bind:value={value}>\\n      <option value=\\\"\\\">Any</option>\\n      {#each options as option}\\n        <option\\n          value={option}>\\n          { option }\\n        </option>\\n      {/each}\\n    </select>\\n  {:else if type == \\\"inline\\\"}\\n  <div class=\\\"options\\\">\\n    {#each options as option}\\n      <button\\n        class=\\\"option\\\"\\n        class:active={option == value}\\n        class:inactive={value && option != value}\\n        style={`color: ${colors[option]}`}\\n        on:click={() => onSelect(option)}>\\n        { option }\\n      </button>\\n    {/each}\\n  </div>\\n\\n  {:else if type == \\\"input\\\"}\\n    <input bind:value {placeholder} />\\n  {/if}\\n</div>\\n\\n<style>\\n  .filter {\\n    position: relative;\\n    flex: 1;\\n    min-width: 7em;\\n    margin-left: 0.6em;\\n    /* padding: 0.6em 0; */\\n    background: none;\\n    border: none;\\n    /* text-align: right; */\\n    /* appearance: none; */\\n    /* cursor: pointer; */\\n  }\\n  .filter--type-input {\\n    flex: 2;\\n    min-width: 10em;\\n  }\\n  .label {\\n    padding-left: 0.7em;\\n    font-size: 0.8em;\\n    margin-bottom: 0.5em;\\n  }\\n  select {\\n    width: 100%;\\n    padding: 0.6em 0.1em 0.6em 0.6em;\\n    background: #f4f4f4;\\n    border: none;\\n  }\\n  .options {\\n    margin-top: 0.5em;\\n  }\\n  .option {\\n    display: block;\\n    width: calc(100% + 0.6em);\\n    margin: 0 -0.6em 0 0;\\n    text-align: right;\\n    padding: 0.3em 0.6em;\\n    font-size: 0.8em;\\n    -webkit-appearance: none;\\n       -moz-appearance: none;\\n            appearance: none;\\n    background: none;\\n    border: none;\\n    cursor: pointer;\\n  }\\n  .option.inactive {\\n    color: #81818f !important;\\n  }\\n  input {\\n\\t\\twidth: calc(100% - 1.2em);\\n    padding: 0.56em 0.6em;\\n\\t\\tfont-size: 0.9em;\\n\\t\\tline-height: 1em;\\n    border: none;\\n    background: #f4f4f4;\\n\\t}\\n  .clear {\\n    position: absolute;\\n    top: 0;\\n    right: 0;\\n    /* text-transform: uppercase; */\\n    /* letter-spacing: 0.06em; */\\n    font-size: 0.6em;\\n    /* font-weight: 700; */\\n    height: 1em;\\n    width: 1em;\\n    display: flex;\\n    align-items: center;\\n    justify-content: center;\\n    cursor: pointer;\\n    color: #9696ad;\\n    background: #e3e3e9;\\n    padding: 0.5em;\\n    border-radius: 100%;\\n    transition: background 0.2s ease-out;\\n  }\\n  .clear:hover {\\n    background: #d2d2db;\\n  }\\n\\t@media (max-width: 900px) {\\n    .filter {\\n      /* margin: 1em; */\\n      width: 100%;\\n    }\\n    select {\\n      max-width: none;\\n      width: 100%;\\n    }\\n  }\\n\\t@media (max-width: 800px) {\\n    input {\\n      padding: 0.9em 0.1em 0.9em 0.6em;\\n    }\\n  }\\n\\t@media (max-width: 600px) {\\n    .filter {\\n      margin-left: 0.6em;\\n    }\\n  }\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0xpc3RGaWx0ZXIuc3ZlbHRlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7RUFDRTtJQUNFLGtCQUFrQjtJQUNsQixPQUFPO0lBQ1AsY0FBYztJQUNkLGtCQUFrQjtJQUNsQixzQkFBc0I7SUFDdEIsZ0JBQWdCO0lBQ2hCLFlBQVk7SUFDWix1QkFBdUI7SUFDdkIsc0JBQXNCO0lBQ3RCLHFCQUFxQjtFQUN2QjtFQUNBO0lBQ0UsT0FBTztJQUNQLGVBQWU7RUFDakI7RUFDQTtJQUNFLG1CQUFtQjtJQUNuQixnQkFBZ0I7SUFDaEIsb0JBQW9CO0VBQ3RCO0VBQ0E7SUFDRSxXQUFXO0lBQ1gsZ0NBQWdDO0lBQ2hDLG1CQUFtQjtJQUNuQixZQUFZO0VBQ2Q7RUFDQTtJQUNFLGlCQUFpQjtFQUNuQjtFQUNBO0lBQ0UsY0FBYztJQUNkLHlCQUF5QjtJQUN6QixvQkFBb0I7SUFDcEIsaUJBQWlCO0lBQ2pCLG9CQUFvQjtJQUNwQixnQkFBZ0I7SUFDaEIsd0JBQWdCO09BQWhCLHFCQUFnQjtZQUFoQixnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLFlBQVk7SUFDWixlQUFlO0VBQ2pCO0VBQ0E7SUFDRSx5QkFBeUI7RUFDM0I7RUFDQTtFQUNBLHlCQUF5QjtJQUN2QixxQkFBcUI7RUFDdkIsZ0JBQWdCO0VBQ2hCLGdCQUFnQjtJQUNkLFlBQVk7SUFDWixtQkFBbUI7Q0FDdEI7RUFDQztJQUNFLGtCQUFrQjtJQUNsQixNQUFNO0lBQ04sUUFBUTtJQUNSLCtCQUErQjtJQUMvQiw0QkFBNEI7SUFDNUIsZ0JBQWdCO0lBQ2hCLHNCQUFzQjtJQUN0QixXQUFXO0lBQ1gsVUFBVTtJQUNWLGFBQWE7SUFDYixtQkFBbUI7SUFDbkIsdUJBQXVCO0lBQ3ZCLGVBQWU7SUFDZixjQUFjO0lBQ2QsbUJBQW1CO0lBQ25CLGNBQWM7SUFDZCxtQkFBbUI7SUFDbkIsb0NBQW9DO0VBQ3RDO0VBQ0E7SUFDRSxtQkFBbUI7RUFDckI7Q0FDRDtJQUNHO01BQ0UsaUJBQWlCO01BQ2pCLFdBQVc7SUFDYjtJQUNBO01BQ0UsZUFBZTtNQUNmLFdBQVc7SUFDYjtFQUNGO0NBQ0Q7SUFDRztNQUNFLGdDQUFnQztJQUNsQztFQUNGO0NBQ0Q7SUFDRztNQUNFLGtCQUFrQjtJQUNwQjtFQUNGIiwiZmlsZSI6InNyYy9jb21wb25lbnRzL0xpc3RGaWx0ZXIuc3ZlbHRlIiwic291cmNlc0NvbnRlbnQiOlsiXG4gIC5maWx0ZXIge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICBmbGV4OiAxO1xuICAgIG1pbi13aWR0aDogN2VtO1xuICAgIG1hcmdpbi1sZWZ0OiAwLjZlbTtcbiAgICAvKiBwYWRkaW5nOiAwLjZlbSAwOyAqL1xuICAgIGJhY2tncm91bmQ6IG5vbmU7XG4gICAgYm9yZGVyOiBub25lO1xuICAgIC8qIHRleHQtYWxpZ246IHJpZ2h0OyAqL1xuICAgIC8qIGFwcGVhcmFuY2U6IG5vbmU7ICovXG4gICAgLyogY3Vyc29yOiBwb2ludGVyOyAqL1xuICB9XG4gIC5maWx0ZXItLXR5cGUtaW5wdXQge1xuICAgIGZsZXg6IDI7XG4gICAgbWluLXdpZHRoOiAxMGVtO1xuICB9XG4gIC5sYWJlbCB7XG4gICAgcGFkZGluZy1sZWZ0OiAwLjdlbTtcbiAgICBmb250LXNpemU6IDAuOGVtO1xuICAgIG1hcmdpbi1ib3R0b206IDAuNWVtO1xuICB9XG4gIHNlbGVjdCB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgcGFkZGluZzogMC42ZW0gMC4xZW0gMC42ZW0gMC42ZW07XG4gICAgYmFja2dyb3VuZDogI2Y0ZjRmNDtcbiAgICBib3JkZXI6IG5vbmU7XG4gIH1cbiAgLm9wdGlvbnMge1xuICAgIG1hcmdpbi10b3A6IDAuNWVtO1xuICB9XG4gIC5vcHRpb24ge1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIHdpZHRoOiBjYWxjKDEwMCUgKyAwLjZlbSk7XG4gICAgbWFyZ2luOiAwIC0wLjZlbSAwIDA7XG4gICAgdGV4dC1hbGlnbjogcmlnaHQ7XG4gICAgcGFkZGluZzogMC4zZW0gMC42ZW07XG4gICAgZm9udC1zaXplOiAwLjhlbTtcbiAgICBhcHBlYXJhbmNlOiBub25lO1xuICAgIGJhY2tncm91bmQ6IG5vbmU7XG4gICAgYm9yZGVyOiBub25lO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgfVxuICAub3B0aW9uLmluYWN0aXZlIHtcbiAgICBjb2xvcjogIzgxODE4ZiAhaW1wb3J0YW50O1xuICB9XG4gIGlucHV0IHtcblx0XHR3aWR0aDogY2FsYygxMDAlIC0gMS4yZW0pO1xuICAgIHBhZGRpbmc6IDAuNTZlbSAwLjZlbTtcblx0XHRmb250LXNpemU6IDAuOWVtO1xuXHRcdGxpbmUtaGVpZ2h0OiAxZW07XG4gICAgYm9yZGVyOiBub25lO1xuICAgIGJhY2tncm91bmQ6ICNmNGY0ZjQ7XG5cdH1cbiAgLmNsZWFyIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIHJpZ2h0OiAwO1xuICAgIC8qIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7ICovXG4gICAgLyogbGV0dGVyLXNwYWNpbmc6IDAuMDZlbTsgKi9cbiAgICBmb250LXNpemU6IDAuNmVtO1xuICAgIC8qIGZvbnQtd2VpZ2h0OiA3MDA7ICovXG4gICAgaGVpZ2h0OiAxZW07XG4gICAgd2lkdGg6IDFlbTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICAgIGNvbG9yOiAjOTY5NmFkO1xuICAgIGJhY2tncm91bmQ6ICNlM2UzZTk7XG4gICAgcGFkZGluZzogMC41ZW07XG4gICAgYm9yZGVyLXJhZGl1czogMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kIDAuMnMgZWFzZS1vdXQ7XG4gIH1cbiAgLmNsZWFyOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiAjZDJkMmRiO1xuICB9XG5cdEBtZWRpYSAobWF4LXdpZHRoOiA5MDBweCkge1xuICAgIC5maWx0ZXIge1xuICAgICAgLyogbWFyZ2luOiAxZW07ICovXG4gICAgICB3aWR0aDogMTAwJTtcbiAgICB9XG4gICAgc2VsZWN0IHtcbiAgICAgIG1heC13aWR0aDogbm9uZTtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgIH1cbiAgfVxuXHRAbWVkaWEgKG1heC13aWR0aDogODAwcHgpIHtcbiAgICBpbnB1dCB7XG4gICAgICBwYWRkaW5nOiAwLjllbSAwLjFlbSAwLjllbSAwLjZlbTtcbiAgICB9XG4gIH1cblx0QG1lZGlhIChtYXgtd2lkdGg6IDYwMHB4KSB7XG4gICAgLmZpbHRlciB7XG4gICAgICBtYXJnaW4tbGVmdDogMC42ZW07XG4gICAgfVxuICB9XG4iXX0= */</style>\"],\"names\":[],\"mappings\":\"AAwDE,OAAO,cAAC,CAAC,AACP,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,SAAS,CAAE,GAAG,CACd,WAAW,CAAE,KAAK,CAElB,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,AAId,CAAC,AACD,mBAAmB,cAAC,CAAC,AACnB,IAAI,CAAE,CAAC,CACP,SAAS,CAAE,IAAI,AACjB,CAAC,AACD,MAAM,cAAC,CAAC,AACN,YAAY,CAAE,KAAK,CACnB,SAAS,CAAE,KAAK,CAChB,aAAa,CAAE,KAAK,AACtB,CAAC,AACD,MAAM,cAAC,CAAC,AACN,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAAC,KAAK,CAChC,UAAU,CAAE,OAAO,CACnB,MAAM,CAAE,IAAI,AACd,CAAC,AACD,QAAQ,cAAC,CAAC,AACR,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,OAAO,cAAC,CAAC,AACP,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,KAAK,CAAC,CACzB,MAAM,CAAE,CAAC,CAAC,MAAM,CAAC,CAAC,CAAC,CAAC,CACpB,UAAU,CAAE,KAAK,CACjB,OAAO,CAAE,KAAK,CAAC,KAAK,CACpB,SAAS,CAAE,KAAK,CAChB,kBAAkB,CAAE,IAAI,CACrB,eAAe,CAAE,IAAI,CAChB,UAAU,CAAE,IAAI,CACxB,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,OAAO,SAAS,cAAC,CAAC,AAChB,KAAK,CAAE,OAAO,CAAC,UAAU,AAC3B,CAAC,AACD,KAAK,cAAC,CAAC,AACP,KAAK,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,KAAK,CAAC,CACvB,OAAO,CAAE,MAAM,CAAC,KAAK,CACvB,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,CACd,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,OAAO,AACtB,CAAC,AACA,MAAM,cAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,KAAK,CAAE,CAAC,CAGR,SAAS,CAAE,KAAK,CAEhB,MAAM,CAAE,GAAG,CACX,KAAK,CAAE,GAAG,CACV,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,MAAM,CAAE,OAAO,CACf,KAAK,CAAE,OAAO,CACd,UAAU,CAAE,OAAO,CACnB,OAAO,CAAE,KAAK,CACd,aAAa,CAAE,IAAI,CACnB,UAAU,CAAE,UAAU,CAAC,IAAI,CAAC,QAAQ,AACtC,CAAC,AACD,oBAAM,MAAM,AAAC,CAAC,AACZ,UAAU,CAAE,OAAO,AACrB,CAAC,AACF,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACxB,OAAO,cAAC,CAAC,AAEP,KAAK,CAAE,IAAI,AACb,CAAC,AACD,MAAM,cAAC,CAAC,AACN,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,AACb,CAAC,AACH,CAAC,AACF,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACxB,KAAK,cAAC,CAAC,AACL,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAAC,KAAK,AAClC,CAAC,AACH,CAAC,AACF,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACxB,OAAO,cAAC,CAAC,AACP,WAAW,CAAE,KAAK,AACpB,CAAC,AACH,CAAC\"}"
};

const ListFilter = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { label } = $$props;
	let { value } = $$props;
	let { options } = $$props;
	let { type = "dropdown" } = $$props;
	let { placeholder = "" } = $$props;
	let { colors = {} } = $$props;

	if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	if ($$props.options === void 0 && $$bindings.options && options !== void 0) $$bindings.options(options);
	if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
	if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0) $$bindings.placeholder(placeholder);
	if ($$props.colors === void 0 && $$bindings.colors && colors !== void 0) $$bindings.colors(colors);
	$$result.css.add(css$6);

	return `<div class="${escape(null_to_empty(`filter filter--type-${type}`)) + " svelte-ykp2bq"}">
  <div class="${"label svelte-ykp2bq"}">
    ${escape(label)}
  </div>
  ${value
	? `<div class="${"clear svelte-ykp2bq"}">
      
      <svg width="${"0.7em"}" height="${"0.7em"}" viewBox="${"0 0 18 18"}" fill="${"currentColor"}">
        <path fill-rule="${"evenodd"}" clip-rule="${"evenodd"}" d="${"M16.945 4.88593C17.9213 3.90962 17.9213 2.32671 16.945 1.3504C15.9687 0.374086 14.3858 0.374086 13.4095 1.3504L9.17725 5.58263L4.94501 1.3504C3.9687 0.374086 2.38579 0.374086 1.40948 1.3504C0.433168 2.32671 0.433168 3.90962 1.40948 4.88593L5.64171 9.11816L1.40948 13.3504C0.433168 14.3267 0.433168 15.9096 1.40948 16.8859C2.38579 17.8622 3.9687 17.8622 4.94501 16.8859L9.17725 12.6537L13.4095 16.8859C14.3858 17.8622 15.9687 17.8622 16.945 16.8859C17.9213 15.9096 17.9213 14.3267 16.945 13.3504L12.7128 9.11816L16.945 4.88593Z"}"></path>
      </svg>

    </div>`
	: ``}
  ${type == "dropdown"
	? `<select class="${"svelte-ykp2bq"}"${add_attribute("value", value, 1)}>
      <option value="${""}">Any</option>
      ${each(options, option => `<option${add_attribute("value", option, 0)}>
          ${escape(option)}
        </option>`)}
    </select>`
	: `${type == "inline"
		? `<div class="${"options svelte-ykp2bq"}">
    ${each(options, option => `<button class="${[
				"option svelte-ykp2bq",
				(option == value ? "active" : "") + " " + (value && option != value ? "inactive" : "")
			].join(" ").trim()}"${add_attribute("style", `color: ${colors[option]}`, 0)}>
        ${escape(option)}
      </button>`)}
  </div>`
		: `${type == "input"
			? `<input${add_attribute("placeholder", placeholder, 0)} class="${"svelte-ykp2bq"}"${add_attribute("value", value, 1)}>`
			: ``}`}`}
</div>`;
});

/* src/components/ListTimeline.svelte generated by Svelte v3.19.1 */

const css$7 = {
	code: ".c.svelte-1lmtcyw{width:100%;margin-top:2em}canvas.svelte-1lmtcyw{position:absolute;top:0;left:0}svg.svelte-1lmtcyw{overflow:visible}text.svelte-1lmtcyw{fill:#8b8ba0;font-size:0.65em;text-transform:uppercase;letter-spacing:0.1em}.x-tick.svelte-1lmtcyw{text-anchor:middle}.tick-mark.svelte-1lmtcyw{stroke:#cacadb}.grid-mark.svelte-1lmtcyw{stroke:#e5e5ee}.y-tick.svelte-1lmtcyw{text-anchor:start}@media(min-width: 800px){.c.svelte-1lmtcyw{margin-top:3.6em}}",
	map: "{\"version\":3,\"file\":\"ListTimeline.svelte\",\"sources\":[\"ListTimeline.svelte\"],\"sourcesContent\":[\"<script>\\n  import { bin, extent, max, min } from \\\"d3-array\\\"\\n  import { scaleLinear, scaleTime } from \\\"d3-scale\\\"\\n  import { area, line, curveMonotoneX } from \\\"d3-shape\\\"\\n  import { timeFormat, timeParse } from \\\"d3-time-format\\\"\\n  import { timeDay, timeMonth } from \\\"d3-time\\\"\\n  import { dateAccessor, parseDate, categories, categoryAccessor, categoryColors, tags, tagAccessor, tagColors, countriesAccessor, ratings, ratingAccessor, sources, sourceAccessor, sourceColors, organizationAccessor } from \\\"./data-utils\\\"\\n  import { debounce, scaleCanvas } from \\\"./utils\\\"\\n\\n  export let filterFunction\\n  export let data\\n  export let isFiltered\\n  export let color\\n  export let overrideWidth\\n  export let iteration\\n\\n  let containerHeight = 190\\n  let height = containerHeight - 20\\n  let containerWidth = 1200\\n  let canvasElement\\n\\n  $: width = overrideWidth || containerWidth\\n\\n  const formatDay = timeFormat(\\\"%d/%m/%Y\\\")\\n  const prettyMonth = timeFormat(\\\"%B\\\")\\n  const today = new Date()\\n\\n  let bins = []\\n  let filteredBins = []\\n  let xTicks = []\\n  let yTicks = []\\n  let xScale\\n  let yScale\\n  let itemWidth = 10\\n\\n  const updateBins = () => {\\n    const allDates = data.map(dateAccessor)\\n    const xExtent = [\\n      min(allDates),\\n      min([new Date(), max(allDates)]),\\n    ]\\n    const days = timeDay.range(...xExtent)\\n\\n    bins = bin()\\n      .value(d => dateAccessor(d))\\n      .thresholds(\\n        days\\n      )\\n      (data)\\n\\n    const filteredData = data.filter(filterFunction)\\n    filteredBins = bin()\\n      .value(d => dateAccessor(d))\\n      .thresholds(days)\\n      (filteredData)\\n\\n    xScale = scaleTime()\\n      .domain(xExtent)\\n      .range([0, width])\\n\\n    itemWidth = bins[1] ? Math.floor(\\n      xScale(bins[1].x0) - xScale(bins[0].x0) - (width < 500 ? 0 : 1)\\n    ) : 10\\n\\n    xTicks = timeMonth.range(\\n      ...xExtent,\\n    ).map(d => [\\n      prettyMonth(d),\\n      xScale(d),\\n    ])\\n\\n    const maxCount = max(bins.map(d => d.length))\\n    yScale = scaleLinear()\\n      .domain([0, maxCount])\\n      .range([height, 0])\\n\\n    yTicks = [\\n      Math.round(maxCount),\\n      Math.round(maxCount / 2),\\n    ].map(d => [\\n        d,\\n        yScale(d),\\n      ])\\n  }\\n\\n  $: iteration, width, updateBins()\\n\\n  $: parsedBins = bins.map(bin => {\\n    let runningY = height\\n    const bars = [{\\n      y: yScale(bin.length),\\n      height: height - yScale(bin.length),\\n      color: \\\"#dbdbeb\\\",\\n    },\\n    ...(!isFiltered ?\\n      tags.map(tag => {\\n        const barHeight = height - yScale(bin.filter(d => tagAccessor(d) == tag).length)\\n        runningY -= barHeight\\n        return {\\n          y: runningY,\\n          height: barHeight,\\n          color: tagColors[tag] || \\\"#dbdbeb\\\",\\n          isTag: true,\\n        }\\n      })\\n    : [])\\n    ]\\n\\n    return {\\n      x: xScale(bin.x0) - itemWidth,\\n      bars,\\n    }\\n  })\\n\\n  // $: tagBins = bins.map(bin => {\\n  //   let runningY = 0\\n  //   return tags.map(tag => {\\n  //     const numberInTag = bin.filter(d => tagAccessor(d) == tag).length\\n  //     runningY += numberInTag\\n  //     return {\\n  //       start: runningY - numberInTag,\\n  //       end: runningY,\\n  //       color: tagColors[tag],\\n  //     }\\n  //   })\\n  // })\\n\\n\\n  const drawCanvas = () => {\\n    if (!canvasElement) return\\n\\n    const ctx = canvasElement.getContext(\\\"2d\\\")\\n    scaleCanvas(canvasElement, ctx, width, height)\\n\\n    // ctx.imageSmoothingEnabled = false\\n    ctx.strokeWidth = 3\\n    const drawItem = ({ x, y, color }) => {\\n      ctx.beginPath()\\n      ctx.moveTo(Math.round(x - itemWidth / 2), Math.round(y))\\n      ctx.lineTo(Math.round(x + itemWidth / 2), Math.round(y))\\n      ctx.strokeWidth = 1\\n      ctx.strokeStyle = color\\n      ctx.stroke()\\n    }\\n\\n    parsedBins.forEach(({ x, bars }, i) => {\\n      // const x = xScale(bin.x0)\\n      // const numberOfFilteredItems = (filteredBins[i] || []).length\\n      bars.forEach(({ y, height, color: barColor, isTag }, j) => {\\n\\n        ctx.fillStyle = barColor\\n        ctx.fillRect(x, y, itemWidth, height + 1)\\n\\n        // const tag = tagAccessor(item)\\n          // ? numberOfFilteredItems >= j ? (color || \\\"#57a039\\\") : \\\"#dbdbeb\\\"\\n          // : (tagBins[i][\\n          //   tagBins[i].findIndex(({ start, end }) => start < j && end >= j)\\n          // ] || {}).color || \\\"#dbdbeb\\\"\\n        // const y = height + -j * 2\\n      })\\n\\n      ctx.fillStyle = \\\"#fff\\\"\\n      ctx.fillRect(x + itemWidth, 0, 1, height)\\n      ctx.fillStyle = \\\"#fff\\\"\\n      ctx.fillRect(x - 1, 0, 1, height)\\n\\n      ctx.fillStyle = color || \\\"#656275\\\"\\n      const y = isFiltered ? yScale((filteredBins[i] || []).length) : height\\n      ctx.fillRect(x, y, itemWidth, height - y)\\n    })\\n  }\\n\\n  const debouncedDrawCanvas = debounce(drawCanvas, 300)\\n  // $: (() => {{\\n  //   const _ = width\\n  //   drawCanvas()\\n  // }})\\n  // onMount(drawCanvas)\\n  $: debouncedDrawCanvas()\\n  $: width, iteration, debouncedDrawCanvas()\\n\\n</script>\\n\\n<div class=\\\"c\\\" bind:clientWidth={containerWidth} style={`height: ${containerHeight}px`}>\\n  <svg {height} {width}>\\n    <!-- {#each parsedBins as { x, bars }, i}\\n      {#each bars as { y, height, color, isTag }}\\n        <rect\\n          class=\\\"full-area\\\"\\n          x={x}\\n          y={y}\\n          width={itemWidth}\\n          height={height}\\n          style={`fill: ${!isFiltered || !isTag ? color : \\\"\\\"}`}\\n        />\\n      {/each}\\n      <rect\\n        class=\\\"filtered-area\\\"\\n        y={isFiltered ? yScale((filteredBins[i] || []).length) : height}\\n        height={isFiltered ? height - yScale((filteredBins[i] || []).length) : 0}\\n        x={x}\\n        width={itemWidth}\\n        style={`fill: ${color}`}\\n      />\\n    {/each} -->\\n    {#each xTicks as [label, offset]}\\n      <line\\n        class=\\\"tick-mark\\\"\\n        x1={offset}\\n        x2={offset}\\n        y1={height}\\n        y2={height + 5}\\n      />\\n      <text class=\\\"x-tick\\\" x={offset} y={height + 19}>\\n        { label }\\n      </text>\\n    {/each}\\n    {#each yTicks as [label, offset], i}\\n      <line\\n        class=\\\"grid-mark\\\"\\n        x1={0}\\n        x2={width}\\n        y1={offset}\\n        y2={offset}\\n      />\\n      <text class=\\\"y-tick\\\" x={0} y={offset - 5}>\\n        { label }{ !i ? \\\" new fact checks per day\\\" : \\\"\\\" }\\n      </text>\\n    {/each}\\n    <line\\n      class=\\\"tick-mark\\\"\\n      x1={0}\\n      x2={width}\\n      y1={height + 1}\\n      y2={height + 1}\\n    />\\n  </svg>\\n  <canvas\\n    style={`height: ${height}px; width: ${width}px`}\\n    bind:this={canvasElement}\\n  />\\n</div>\\n\\n<style>\\n  .c {\\n    width: 100%;\\n    margin-top: 2em;\\n    /* overflow: hidden; */\\n  }\\n  canvas {\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n  }\\n  svg {\\n    overflow: visible;\\n  }\\n  rect {\\n    /* shape-rendering: crispEdges; */\\n    transition: all 0.3s ease-out;\\n  }\\n  .full-area {\\n    fill: #dbdbeb;\\n  }\\n  .filtered-area {\\n    fill: #656275;\\n    transition: all 0.3s ease-out;\\n  }\\n  text {\\n    fill: #8b8ba0;\\n    font-size: 0.65em;\\n    text-transform: uppercase;\\n    letter-spacing: 0.1em;\\n  }\\n  .x-tick {\\n    text-anchor: middle;\\n  }\\n  .tick-mark {\\n    stroke: #cacadb;\\n  }\\n  .grid-mark {\\n    stroke: #e5e5ee;\\n  }\\n  .y-tick {\\n    /* text-anchor: end; */\\n    text-anchor: start;\\n    /* dominant-baseline: middle; */\\n  }\\n\\n  @media (min-width: 800px) {\\n    .c {\\n      margin-top: 3.6em;\\n    }\\n  }\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0xpc3RUaW1lbGluZS5zdmVsdGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtFQUNFO0lBQ0UsV0FBVztJQUNYLGVBQWU7SUFDZixzQkFBc0I7RUFDeEI7RUFDQTtJQUNFLGtCQUFrQjtJQUNsQixNQUFNO0lBQ04sT0FBTztFQUNUO0VBQ0E7SUFDRSxpQkFBaUI7RUFDbkI7RUFDQTtJQUNFLGlDQUFpQztJQUNqQyw2QkFBNkI7RUFDL0I7RUFDQTtJQUNFLGFBQWE7RUFDZjtFQUNBO0lBQ0UsYUFBYTtJQUNiLDZCQUE2QjtFQUMvQjtFQUNBO0lBQ0UsYUFBYTtJQUNiLGlCQUFpQjtJQUNqQix5QkFBeUI7SUFDekIscUJBQXFCO0VBQ3ZCO0VBQ0E7SUFDRSxtQkFBbUI7RUFDckI7RUFDQTtJQUNFLGVBQWU7RUFDakI7RUFDQTtJQUNFLGVBQWU7RUFDakI7RUFDQTtJQUNFLHNCQUFzQjtJQUN0QixrQkFBa0I7SUFDbEIsK0JBQStCO0VBQ2pDOztFQUVBO0lBQ0U7TUFDRSxpQkFBaUI7SUFDbkI7RUFDRiIsImZpbGUiOiJzcmMvY29tcG9uZW50cy9MaXN0VGltZWxpbmUuc3ZlbHRlIiwic291cmNlc0NvbnRlbnQiOlsiXG4gIC5jIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBtYXJnaW4tdG9wOiAyZW07XG4gICAgLyogb3ZlcmZsb3c6IGhpZGRlbjsgKi9cbiAgfVxuICBjYW52YXMge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0b3A6IDA7XG4gICAgbGVmdDogMDtcbiAgfVxuICBzdmcge1xuICAgIG92ZXJmbG93OiB2aXNpYmxlO1xuICB9XG4gIHJlY3Qge1xuICAgIC8qIHNoYXBlLXJlbmRlcmluZzogY3Jpc3BFZGdlczsgKi9cbiAgICB0cmFuc2l0aW9uOiBhbGwgMC4zcyBlYXNlLW91dDtcbiAgfVxuICAuZnVsbC1hcmVhIHtcbiAgICBmaWxsOiAjZGJkYmViO1xuICB9XG4gIC5maWx0ZXJlZC1hcmVhIHtcbiAgICBmaWxsOiAjNjU2Mjc1O1xuICAgIHRyYW5zaXRpb246IGFsbCAwLjNzIGVhc2Utb3V0O1xuICB9XG4gIHRleHQge1xuICAgIGZpbGw6ICM4YjhiYTA7XG4gICAgZm9udC1zaXplOiAwLjY1ZW07XG4gICAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgICBsZXR0ZXItc3BhY2luZzogMC4xZW07XG4gIH1cbiAgLngtdGljayB7XG4gICAgdGV4dC1hbmNob3I6IG1pZGRsZTtcbiAgfVxuICAudGljay1tYXJrIHtcbiAgICBzdHJva2U6ICNjYWNhZGI7XG4gIH1cbiAgLmdyaWQtbWFyayB7XG4gICAgc3Ryb2tlOiAjZTVlNWVlO1xuICB9XG4gIC55LXRpY2sge1xuICAgIC8qIHRleHQtYW5jaG9yOiBlbmQ7ICovXG4gICAgdGV4dC1hbmNob3I6IHN0YXJ0O1xuICAgIC8qIGRvbWluYW50LWJhc2VsaW5lOiBtaWRkbGU7ICovXG4gIH1cblxuICBAbWVkaWEgKG1pbi13aWR0aDogODAwcHgpIHtcbiAgICAuYyB7XG4gICAgICBtYXJnaW4tdG9wOiAzLjZlbTtcbiAgICB9XG4gIH1cbiJdfQ== */</style>\"],\"names\":[],\"mappings\":\"AAoPE,EAAE,eAAC,CAAC,AACF,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,GAAG,AAEjB,CAAC,AACD,MAAM,eAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,AACT,CAAC,AACD,GAAG,eAAC,CAAC,AACH,QAAQ,CAAE,OAAO,AACnB,CAAC,AAYD,IAAI,eAAC,CAAC,AACJ,IAAI,CAAE,OAAO,CACb,SAAS,CAAE,MAAM,CACjB,cAAc,CAAE,SAAS,CACzB,cAAc,CAAE,KAAK,AACvB,CAAC,AACD,OAAO,eAAC,CAAC,AACP,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,UAAU,eAAC,CAAC,AACV,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,UAAU,eAAC,CAAC,AACV,MAAM,CAAE,OAAO,AACjB,CAAC,AACD,OAAO,eAAC,CAAC,AAEP,WAAW,CAAE,KAAK,AAEpB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,EAAE,eAAC,CAAC,AACF,UAAU,CAAE,KAAK,AACnB,CAAC,AACH,CAAC\"}"
};

let containerHeight = 190;

const ListTimeline = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { filterFunction } = $$props;
	let { data } = $$props;
	let { isFiltered } = $$props;
	let { color } = $$props;
	let { overrideWidth } = $$props;
	let { iteration } = $$props;
	let height = containerHeight - 20;
	let containerWidth = 1200;
	let canvasElement;
	const formatDay = d3TimeFormat.timeFormat("%d/%m/%Y");
	const prettyMonth = d3TimeFormat.timeFormat("%B");
	let bins = [];
	let filteredBins = [];
	let xTicks = [];
	let yTicks = [];
	let xScale;
	let yScale;
	let itemWidth = 10;

	const updateBins = () => {
		const allDates = data.map(dateAccessor);
		const xExtent = [d3Array.min(allDates), d3Array.min([new Date(), d3Array.max(allDates)])];
		const days = d3Time.timeDay.range(...xExtent);
		bins = d3Array.bin().value(d => dateAccessor(d)).thresholds(days)(data);
		const filteredData = data.filter(filterFunction);
		filteredBins = d3Array.bin().value(d => dateAccessor(d)).thresholds(days)(filteredData);
		xScale = d3Scale.scaleTime().domain(xExtent).range([0, width]);

		itemWidth = bins[1]
		? Math.floor(xScale(bins[1].x0) - xScale(bins[0].x0) - (width < 500 ? 0 : 1))
		: 10;

		xTicks = d3Time.timeMonth.range(...xExtent).map(d => [prettyMonth(d), xScale(d)]);
		const maxCount = d3Array.max(bins.map(d => d.length));
		yScale = d3Scale.scaleLinear().domain([0, maxCount]).range([height, 0]);
		yTicks = [Math.round(maxCount), Math.round(maxCount / 2)].map(d => [d, yScale(d)]);
	};

	// $: tagBins = bins.map(bin => {
	//   let runningY = 0
	//   return tags.map(tag => {
	//     const numberInTag = bin.filter(d => tagAccessor(d) == tag).length
	//     runningY += numberInTag
	//     return {
	//       start: runningY - numberInTag,
	//       end: runningY,
	//       color: tagColors[tag],
	//     }
	//   })
	// })
	const drawCanvas = () => {
		return;
	};

	const debouncedDrawCanvas = debounce(drawCanvas, 300);
	if ($$props.filterFunction === void 0 && $$bindings.filterFunction && filterFunction !== void 0) $$bindings.filterFunction(filterFunction);
	if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
	if ($$props.isFiltered === void 0 && $$bindings.isFiltered && isFiltered !== void 0) $$bindings.isFiltered(isFiltered);
	if ($$props.color === void 0 && $$bindings.color && color !== void 0) $$bindings.color(color);
	if ($$props.overrideWidth === void 0 && $$bindings.overrideWidth && overrideWidth !== void 0) $$bindings.overrideWidth(overrideWidth);
	if ($$props.iteration === void 0 && $$bindings.iteration && iteration !== void 0) $$bindings.iteration(iteration);
	$$result.css.add(css$7);
	let width = overrideWidth || containerWidth;

	 {
		(updateBins());
	}

	let parsedBins = bins.map(bin => {
		let runningY = height;

		const bars = [
			{
				y: yScale(bin.length),
				height: height - yScale(bin.length),
				color: "#dbdbeb"
			},
			...!isFiltered
			? tags.map(tag => {
					const barHeight = height - yScale(bin.filter(d => tagAccessor(d) == tag).length);
					runningY -= barHeight;

					return {
						y: runningY,
						height: barHeight,
						color: tagColors[tag] || "#dbdbeb",
						isTag: true
					};
				})
			: []
		];

		return { x: xScale(bin.x0) - itemWidth, bars };
	});

	 {
		debouncedDrawCanvas();
	}

	 {
		(debouncedDrawCanvas());
	}

	return `<div class="${"c svelte-1lmtcyw"}"${add_attribute("style", `height: ${containerHeight}px`, 0)}>
  <svg${add_attribute("height", height, 0)}${add_attribute("width", width, 0)} class="${"svelte-1lmtcyw"}">
    
    ${each(xTicks, ([label, offset]) => `<line class="${"tick-mark svelte-1lmtcyw"}"${add_attribute("x1", offset, 0)}${add_attribute("x2", offset, 0)}${add_attribute("y1", height, 0)}${add_attribute("y2", height + 5, 0)}></line>
      <text class="${"x-tick svelte-1lmtcyw"}"${add_attribute("x", offset, 0)}${add_attribute("y", height + 19, 0)}>
        ${escape(label)}
      </text>`)}
    ${each(yTicks, ([label, offset], i) => `<line class="${"grid-mark svelte-1lmtcyw"}"${add_attribute("x1", 0, 0)}${add_attribute("x2", width, 0)}${add_attribute("y1", offset, 0)}${add_attribute("y2", offset, 0)}></line>
      <text class="${"y-tick svelte-1lmtcyw"}"${add_attribute("x", 0, 0)}${add_attribute("y", offset - 5, 0)}>
        ${escape(label)}${escape(!i ? " new fact checks per day" : "")}
      </text>`)}
    <line class="${"tick-mark svelte-1lmtcyw"}"${add_attribute("x1", 0, 0)}${add_attribute("x2", width, 0)}${add_attribute("y1", height + 1, 0)}${add_attribute("y2", height + 1, 0)}></line>
  </svg>
  <canvas${add_attribute("style", `height: ${height}px; width: ${width}px`, 0)} class="${"svelte-1lmtcyw"}"${add_attribute("this", canvasElement, 1)}></canvas>
</div>`;
});

/* src/components/List.svelte generated by Svelte v3.19.1 */

const css$8 = {
	code: ".c.svelte-s14geo{position:relative;padding:1em 0 10em;margin:0 auto 9em;width:90%}.loading.svelte-s14geo{text-align:center;padding:1em;font-style:italic}.top.svelte-s14geo{padding-bottom:1em}.count.svelte-s14geo{color:#9093a1;text-align:left;margin:0.6em 0 -0.7em 1.8em;font-style:italic;font-weight:300;font-size:0.9em}.list.svelte-s14geo{position:relative;margin-top:5em}.card.svelte-s14geo{position:absolute;top:0;left:0;text-align:left;width:100%;transition:transform 0.6s ease-out}.card--column--1.svelte-s14geo{opacity:0}.hidden.svelte-s14geo{opacity:0;pointer-events:none}.card.svelte-s14geo .row{margin-top:auto;margin-bottom:1.2em}.load-more.svelte-s14geo{position:absolute;bottom:-6em;left:50%;-webkit-appearance:none;-moz-appearance:none;appearance:none;font-size:1.3em;font-weight:700;cursor:pointer;background:none;border:none;transform:translateX(-50%)}@media(max-width: 600px){.list.svelte-s14geo{margin-left:2vw}}",
	map: "{\"version\":3,\"file\":\"List.svelte\",\"sources\":[\"List.svelte\"],\"sourcesContent\":[\"<script>\\n  import { draw, fly } from \\\"svelte/transition\\\"\\n  // import VirtualList from '@sveltejs/svelte-virtual-list';\\nimport { dateAccessor, countriesAccessor, ratings, ratingAccessor, sources, sourceAccessor, sourceColors, organizationAccessor, tagsAccessor, titleAccessor, categories, categoryAccessor, categoryColors } from \\\"./data-utils\\\"\\n  import { debounce, smoothScrollTo } from \\\"./utils\\\"\\n\\n  import flags from \\\"./flags/all.js\\\"\\n  import ListItem from \\\"./ListItem.svelte\\\"\\n  import ListFilter from \\\"./ListFilter.svelte\\\"\\n  import ListTimeline from \\\"./ListTimeline.svelte\\\"\\n  import Number from \\\"./Number.svelte\\\"\\n\\n  export let isLoading\\n  export let data = []\\n  export let iteration\\n  export let isFiltered\\n  export let filterIteration\\n  export let filterFunction\\n  export let filterColor\\n\\n  const documentGlobal = typeof document !== \\\"undefined\\\" && document\\n\\n  let windowWidth = 1200\\n  let selectedCategory = null\\n  let selectedType = null\\n  let selectedRating = null\\n  // let selectedLang = null\\n  let selectedOrg = null\\n  let selectedTag = null\\n  let selectedCountry = null\\n  let searchString = \\\"\\\"\\n  let containerElement\\n  let inputElement\\n  let listWidth = 1200\\n\\n  let typeColors = sourceColors\\n  let totalHeight = 300\\n\\n  const pageHeight = 1600\\n  let pageIndex = 1\\n\\n  $: ids = data.map(({ id }) => id)\\n  const metadata = {}\\n  $: filterIteration, pageIndex = 1\\n\\n  $: (() => {\\n    let runningColumnId = 0\\n    const itemsPerRow = Math.round(windowWidth / 500)\\n    let runningYs = new Array(itemsPerRow).fill(0)\\n    const itemWidth = 378\\n\\n    data.forEach(d => {\\n      const isShowing = filterFunction(d)\\n\\n      if (!isShowing) {\\n        metadata[d.id] = {\\n          ...d,\\n          x: 0,\\n          y: 0,\\n          height: 0,\\n          columnId: -1,\\n          mainSource: sourceAccessor(d)[0],\\n          isShowing: false,\\n        }\\n        return\\n      }\\n\\n      const height = Math.max(\\n          2,\\n          Math.round(\\n            titleAccessor(d).length\\n            * 1.3\\n            // * (d.language_code == \\\"zh\\\" ? 3.5 : 2)\\n            / 30\\n          )\\n        )\\n        * 30\\n        + 170\\n      metadata[d.id] = {\\n        ...d,\\n        x: runningColumnId * itemWidth,\\n        y: runningYs[runningColumnId],\\n        height,\\n        columnId: runningColumnId,\\n        mainSource: sourceAccessor(d)[0],\\n        isShowing: true,\\n      }\\n      runningYs[runningColumnId] += height + 60\\n      runningColumnId = (runningColumnId + 1) % itemsPerRow\\n    })\\n\\n    listWidth = itemWidth * (itemsPerRow * 0.98)\\n    if (itemsPerRow == 1) listWidth = null\\n    totalHeight = Math.max(...runningYs)\\n  })()\\n\\n  $: itemsCount = (data || []).length\\n  $: showingItemsCount = Object.values(metadata).filter(d => d.isShowing).length\\n\\n  const scrollToTop = () => {\\n    if (!containerElement) return\\n    const elementY = containerElement.offsetTop - 100\\n\\n    const currentScrollY = documentGlobal && documentGlobal.scrollingElement && documentGlobal.scrollingElement.scrollTop || 0\\n    // don't scroll down page from vizes above\\n    if (currentScrollY <= elementY) return\\n\\n    // containerElement.scrollIntoView({\\n    //   behavior: 'smooth',\\n    //   block: 'start' ,\\n    // })\\n    smoothScrollTo(elementY, 300)\\n  }\\n\\n  // const filterTo = (type, newValue) => {\\n  //   if (type == \\\"type\\\") {\\n  //     selectedType = newValue\\n  //   }\\n  //   scrollToTop()\\n  // }\\n  // const onUpdateSearchString = e => {\\n  //   const newValue = e.target.value\\n  //   searchString = newValue\\n  //   scrollToTop()\\n  // }\\n  // const debouncedOnUpdateSearchString = debounce(onUpdateSearchString, 300)\\n  $: filterIteration && scrollToTop()\\n\\n  $: listHeight = pageHeight * pageIndex\\n</script>\\n\\n<svelte:window bind:innerWidth={windowWidth} />\\n\\n<div class=\\\"c\\\" style={`width: ${listWidth}px`} bind:this={containerElement}>\\n  <div class=\\\"main-list\\\">\\n    <!-- <div class=\\\"filters\\\">\\n      <ListFilter\\n        label=\\\"Category\\\"\\n        options={categories}\\n        bind:value={selectedCategory}\\n        type=\\\"inline\\\"\\n        colors={categoryColors}\\n        {scrollToTop}\\n      />\\n      <ListFilter\\n        label=\\\"Country\\\"\\n        options={countries}\\n        bind:value={selectedCountry}\\n        {scrollToTop}\\n      />\\n      <ListFilter\\n        label=\\\"Rating\\\"\\n        options={ratings}\\n        bind:value={selectedRating}\\n        {scrollToTop}\\n      />\\n      <ListFilter\\n        label=\\\"Source\\\"\\n        options={sources}\\n        bind:value={selectedType}\\n        {scrollToTop}\\n      />\\n      <ListFilter\\n        label=\\\"Fact-checker\\\"\\n        options={organizations}\\n        bind:value={selectedOrg}\\n        {scrollToTop}\\n      />\\n      <ListFilter\\n        label=\\\"Tags\\\"\\n        options={tags}\\n        bind:value={selectedTag}\\n        {scrollToTop}\\n      />\\n    </div> -->\\n    <div class=\\\"list\\\" style={`height: ${listHeight + 210}px;`}>\\n      {#each ids as id}\\n        {#if metadata[id] && metadata[id].y <= (listHeight)}\\n          <div\\n            class={`card card--column-${metadata[id].columnId} card-${\\n              titleAccessor(metadata[id]).length <  60 ?   \\\"s\\\" :\\n              titleAccessor(metadata[id]).length <  90 ?   \\\"m\\\" :\\n              titleAccessor(metadata[id]).length < 160 ?   \\\"l\\\" :\\n              titleAccessor(metadata[id]).length < 200 ?  \\\"xl\\\" :\\n                                                          \\\"xxl\\\"\\n            }`}\\n            class:hidden={!metadata[id].isShowing}\\n            style={[\\n              `transform: translate(${metadata[id].x}px, ${metadata[id].y}px)`,\\n              `height: ${metadata[id].height}px`,\\n              `width: ${listWidth ? \\\"345px\\\" : null}`,\\n            ].join(\\\";\\\")}\\n            >\\n            <ListItem\\n              item={metadata[id]}\\n            />\\n          </div>\\n        {/if}\\n      {/each}\\n      {#if !ids.filter(id => metadata[id].isShowing).length}\\n        <p class=\\\"loading\\\">\\n          {isLoading ? \\\"Loading fact checks...\\\" : \\\"No items found with those filters\\\"}\\n        </p>\\n      {/if}\\n\\n    </div>\\n\\n    {#if listHeight < totalHeight}\\n      <button on:click={() => pageIndex++} class=\\\"load-more\\\">\\n        Show more\\n      </button>\\n    {/if}\\n\\n  </div>\\n</div>\\n\\n<style>\\n  .c {\\n    /* display: flex;\\n    flex-direction: column; */\\n    position: relative;\\n    /* max-width: calc(100% - 12em); */\\n    /* max-width: 69em; */\\n    /* width: 100%; */\\n    padding: 1em 0 10em;\\n    margin: 0 auto 9em;\\n    width: 90%;\\n    /* overflow: hidden; */\\n  }\\n  .loading {\\n    text-align: center;\\n    padding: 1em;\\n    font-style: italic;\\n  }\\n  .top {\\n    /* position: sticky;\\n    top: -155px; */\\n    /* display: flex;\\n    flex-direction: column;\\n    align-items: flex-end;\\n    justify-content: flex-end; */\\n    /* margin-left: 210px; */\\n    /* background: #f4f5fa;\\n    box-shadow: 0px 8px 10px -8px rgba(52, 73, 94, .2), 0 1px 1px rgba(52, 73, 94, 0.1);\\n    z-index: 100; */\\n    padding-bottom: 1em;\\n  }\\n  /* .input {\\n    position: sticky;\\n    top: 0;\\n    width: 100%;\\n    padding-top: 1em;\\n    padding-bottom: 1.2em;\\n  }\\n  .input input {\\n    width: calc(100% - 2.9em);\\n    padding: 0.8em 1em;\\n    font-size: 1.1em;\\n    line-height: 1em;\\n    border: none;\\n  } */\\n  .count {\\n    color: #9093a1;\\n    text-align: left;\\n    margin: 0.6em 0 -0.7em 1.8em;\\n    font-style: italic;\\n    font-weight: 300;\\n    font-size: 0.9em;\\n  }\\n\\n  .main-list {\\n    /* display: flex; */\\n  }\\n  .list {\\n    position: relative;\\n    margin-top: 5em;\\n    /* flex: 1; */\\n    /* display: flex;\\n    flex-direction: column;\\n    flex-wrap: wrap;\\n    display: grid; */\\n    /* grid-template-columns: repeat(3, 1fr);\\n    grid-auto-rows: 70px;\\n    grid-gap: 2em;\\n    grid-column-gap: 4em; */\\n  }\\n  /* .filters {\\n    position: sticky;\\n    top: 6em;\\n    flex: 0 0 180px;\\n    width: 180px;\\n    height: 37.6em;\\n    padding-right: 30px;\\n    text-align: right;\\n  } */\\n  .card {\\n    /* max-width: 25em; */\\n    /* margin: 1em; */\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n    text-align: left;\\n    width: 100%;\\n    /* max-width: 90vw; */\\n    /* padding-bottom: 6px;\\n    padding-left: 6px;\\n    padding-right: 2px;\\n    padding-top: 2px; */\\n    /* overflow: hidden; */\\n    transition: transform 0.6s ease-out;\\n\\n    /* transform: translateY(30px); */\\n    /* opacity: 0; */\\n    /* animation-name: popIn;\\n    animation-duration: 0.3s;\\n    animation-fill-mode: forwards; */\\n  }\\n  .card--column--1 {\\n    opacity: 0;\\n  }\\n  /* .card--column-1 { left: 33%; }\\n  .card--column-2 { left: 66%; } */\\n  /* .card:nth-child(9n+4) {\\n    grid-column: span 2;\\n    grid-row: span 2;\\n  }\\n  .card:nth-child(9n+4).card-l,\\n  .card:nth-child(9n+4).card-xl,\\n  .card:nth-child(9n+4).card-xxl {\\n    grid-row: span 3;\\n  }\\n  .card-xs {\\n    grid-row: span 2;\\n  }\\n  .card-s {\\n    grid-row: span 3;\\n  }\\n  .card-m {\\n    grid-row: span 4;\\n  }\\n  .card-l {\\n    grid-row: span 5;\\n  }\\n  .card-xl {\\n    grid-row: span 6;\\n  }\\n  .card-xl {\\n    grid-row: span 7;\\n  } */\\n  .hidden {\\n    opacity: 0;\\n    pointer-events: none;\\n  }\\n  .card :global(.row) {\\n    margin-top: auto;\\n    margin-bottom: 1.2em;\\n  }\\n  .load-more {\\n    position: absolute;\\n    bottom: -6em;\\n    left: 50%;\\n    -webkit-appearance: none;\\n       -moz-appearance: none;\\n            appearance: none;\\n    font-size: 1.3em;\\n    font-weight: 700;\\n    cursor: pointer;\\n    background: none;\\n    border: none;\\n    transform: translateX(-50%);\\n  }\\n\\n  @media (max-width: 600px) {\\n    .list {\\n      margin-left: 2vw;\\n    }\\n  }\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0xpc3Quc3ZlbHRlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7RUFDRTtJQUNFOzZCQUN5QjtJQUN6QixrQkFBa0I7SUFDbEIsa0NBQWtDO0lBQ2xDLHFCQUFxQjtJQUNyQixpQkFBaUI7SUFDakIsbUJBQW1CO0lBQ25CLGtCQUFrQjtJQUNsQixVQUFVO0lBQ1Ysc0JBQXNCO0VBQ3hCO0VBQ0E7SUFDRSxrQkFBa0I7SUFDbEIsWUFBWTtJQUNaLGtCQUFrQjtFQUNwQjtFQUNBO0lBQ0U7a0JBQ2M7SUFDZDs7O2dDQUc0QjtJQUM1Qix3QkFBd0I7SUFDeEI7O21CQUVlO0lBQ2YsbUJBQW1CO0VBQ3JCO0VBQ0E7Ozs7Ozs7Ozs7Ozs7S0FhRztFQUNIO0lBQ0UsY0FBYztJQUNkLGdCQUFnQjtJQUNoQiw0QkFBNEI7SUFDNUIsa0JBQWtCO0lBQ2xCLGdCQUFnQjtJQUNoQixnQkFBZ0I7RUFDbEI7O0VBRUE7SUFDRSxtQkFBbUI7RUFDckI7RUFDQTtJQUNFLGtCQUFrQjtJQUNsQixlQUFlO0lBQ2YsYUFBYTtJQUNiOzs7b0JBR2dCO0lBQ2hCOzs7MkJBR3VCO0VBQ3pCO0VBQ0E7Ozs7Ozs7O0tBUUc7RUFDSDtJQUNFLHFCQUFxQjtJQUNyQixpQkFBaUI7SUFDakIsa0JBQWtCO0lBQ2xCLE1BQU07SUFDTixPQUFPO0lBQ1AsZ0JBQWdCO0lBQ2hCLFdBQVc7SUFDWCxxQkFBcUI7SUFDckI7Ozt1QkFHbUI7SUFDbkIsc0JBQXNCO0lBQ3RCLG1DQUFtQzs7SUFFbkMsaUNBQWlDO0lBQ2pDLGdCQUFnQjtJQUNoQjs7b0NBRWdDO0VBQ2xDO0VBQ0E7SUFDRSxVQUFVO0VBQ1o7RUFDQTtrQ0FDZ0M7RUFDaEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBMEJHO0VBQ0g7SUFDRSxVQUFVO0lBQ1Ysb0JBQW9CO0VBQ3RCO0VBQ0E7SUFDRSxnQkFBZ0I7SUFDaEIsb0JBQW9CO0VBQ3RCO0VBQ0E7SUFDRSxrQkFBa0I7SUFDbEIsWUFBWTtJQUNaLFNBQVM7SUFDVCx3QkFBZ0I7T0FBaEIscUJBQWdCO1lBQWhCLGdCQUFnQjtJQUNoQixnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLGVBQWU7SUFDZixnQkFBZ0I7SUFDaEIsWUFBWTtJQUNaLDJCQUEyQjtFQUM3Qjs7RUFFQTtJQUNFO01BQ0UsZ0JBQWdCO0lBQ2xCO0VBQ0YiLCJmaWxlIjoic3JjL2NvbXBvbmVudHMvTGlzdC5zdmVsdGUiLCJzb3VyY2VzQ29udGVudCI6WyJcbiAgLmMge1xuICAgIC8qIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgKi9cbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgLyogbWF4LXdpZHRoOiBjYWxjKDEwMCUgLSAxMmVtKTsgKi9cbiAgICAvKiBtYXgtd2lkdGg6IDY5ZW07ICovXG4gICAgLyogd2lkdGg6IDEwMCU7ICovXG4gICAgcGFkZGluZzogMWVtIDAgMTBlbTtcbiAgICBtYXJnaW46IDAgYXV0byA5ZW07XG4gICAgd2lkdGg6IDkwJTtcbiAgICAvKiBvdmVyZmxvdzogaGlkZGVuOyAqL1xuICB9XG4gIC5sb2FkaW5nIHtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgcGFkZGluZzogMWVtO1xuICAgIGZvbnQtc3R5bGU6IGl0YWxpYztcbiAgfVxuICAudG9wIHtcbiAgICAvKiBwb3NpdGlvbjogc3RpY2t5O1xuICAgIHRvcDogLTE1NXB4OyAqL1xuICAgIC8qIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDsgKi9cbiAgICAvKiBtYXJnaW4tbGVmdDogMjEwcHg7ICovXG4gICAgLyogYmFja2dyb3VuZDogI2Y0ZjVmYTtcbiAgICBib3gtc2hhZG93OiAwcHggOHB4IDEwcHggLThweCByZ2JhKDUyLCA3MywgOTQsIC4yKSwgMCAxcHggMXB4IHJnYmEoNTIsIDczLCA5NCwgMC4xKTtcbiAgICB6LWluZGV4OiAxMDA7ICovXG4gICAgcGFkZGluZy1ib3R0b206IDFlbTtcbiAgfVxuICAvKiAuaW5wdXQge1xuICAgIHBvc2l0aW9uOiBzdGlja3k7XG4gICAgdG9wOiAwO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHBhZGRpbmctdG9wOiAxZW07XG4gICAgcGFkZGluZy1ib3R0b206IDEuMmVtO1xuICB9XG4gIC5pbnB1dCBpbnB1dCB7XG4gICAgd2lkdGg6IGNhbGMoMTAwJSAtIDIuOWVtKTtcbiAgICBwYWRkaW5nOiAwLjhlbSAxZW07XG4gICAgZm9udC1zaXplOiAxLjFlbTtcbiAgICBsaW5lLWhlaWdodDogMWVtO1xuICAgIGJvcmRlcjogbm9uZTtcbiAgfSAqL1xuICAuY291bnQge1xuICAgIGNvbG9yOiAjOTA5M2ExO1xuICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgbWFyZ2luOiAwLjZlbSAwIC0wLjdlbSAxLjhlbTtcbiAgICBmb250LXN0eWxlOiBpdGFsaWM7XG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgICBmb250LXNpemU6IDAuOWVtO1xuICB9XG5cbiAgLm1haW4tbGlzdCB7XG4gICAgLyogZGlzcGxheTogZmxleDsgKi9cbiAgfVxuICAubGlzdCB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIG1hcmdpbi10b3A6IDVlbTtcbiAgICAvKiBmbGV4OiAxOyAqL1xuICAgIC8qIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBmbGV4LXdyYXA6IHdyYXA7XG4gICAgZGlzcGxheTogZ3JpZDsgKi9cbiAgICAvKiBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgzLCAxZnIpO1xuICAgIGdyaWQtYXV0by1yb3dzOiA3MHB4O1xuICAgIGdyaWQtZ2FwOiAyZW07XG4gICAgZ3JpZC1jb2x1bW4tZ2FwOiA0ZW07ICovXG4gIH1cbiAgLyogLmZpbHRlcnMge1xuICAgIHBvc2l0aW9uOiBzdGlja3k7XG4gICAgdG9wOiA2ZW07XG4gICAgZmxleDogMCAwIDE4MHB4O1xuICAgIHdpZHRoOiAxODBweDtcbiAgICBoZWlnaHQ6IDM3LjZlbTtcbiAgICBwYWRkaW5nLXJpZ2h0OiAzMHB4O1xuICAgIHRleHQtYWxpZ246IHJpZ2h0O1xuICB9ICovXG4gIC5jYXJkIHtcbiAgICAvKiBtYXgtd2lkdGg6IDI1ZW07ICovXG4gICAgLyogbWFyZ2luOiAxZW07ICovXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHRleHQtYWxpZ246IGxlZnQ7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgLyogbWF4LXdpZHRoOiA5MHZ3OyAqL1xuICAgIC8qIHBhZGRpbmctYm90dG9tOiA2cHg7XG4gICAgcGFkZGluZy1sZWZ0OiA2cHg7XG4gICAgcGFkZGluZy1yaWdodDogMnB4O1xuICAgIHBhZGRpbmctdG9wOiAycHg7ICovXG4gICAgLyogb3ZlcmZsb3c6IGhpZGRlbjsgKi9cbiAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC42cyBlYXNlLW91dDtcblxuICAgIC8qIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgzMHB4KTsgKi9cbiAgICAvKiBvcGFjaXR5OiAwOyAqL1xuICAgIC8qIGFuaW1hdGlvbi1uYW1lOiBwb3BJbjtcbiAgICBhbmltYXRpb24tZHVyYXRpb246IDAuM3M7XG4gICAgYW5pbWF0aW9uLWZpbGwtbW9kZTogZm9yd2FyZHM7ICovXG4gIH1cbiAgLmNhcmQtLWNvbHVtbi0tMSB7XG4gICAgb3BhY2l0eTogMDtcbiAgfVxuICAvKiAuY2FyZC0tY29sdW1uLTEgeyBsZWZ0OiAzMyU7IH1cbiAgLmNhcmQtLWNvbHVtbi0yIHsgbGVmdDogNjYlOyB9ICovXG4gIC8qIC5jYXJkOm50aC1jaGlsZCg5bis0KSB7XG4gICAgZ3JpZC1jb2x1bW46IHNwYW4gMjtcbiAgICBncmlkLXJvdzogc3BhbiAyO1xuICB9XG4gIC5jYXJkOm50aC1jaGlsZCg5bis0KS5jYXJkLWwsXG4gIC5jYXJkOm50aC1jaGlsZCg5bis0KS5jYXJkLXhsLFxuICAuY2FyZDpudGgtY2hpbGQoOW4rNCkuY2FyZC14eGwge1xuICAgIGdyaWQtcm93OiBzcGFuIDM7XG4gIH1cbiAgLmNhcmQteHMge1xuICAgIGdyaWQtcm93OiBzcGFuIDI7XG4gIH1cbiAgLmNhcmQtcyB7XG4gICAgZ3JpZC1yb3c6IHNwYW4gMztcbiAgfVxuICAuY2FyZC1tIHtcbiAgICBncmlkLXJvdzogc3BhbiA0O1xuICB9XG4gIC5jYXJkLWwge1xuICAgIGdyaWQtcm93OiBzcGFuIDU7XG4gIH1cbiAgLmNhcmQteGwge1xuICAgIGdyaWQtcm93OiBzcGFuIDY7XG4gIH1cbiAgLmNhcmQteGwge1xuICAgIGdyaWQtcm93OiBzcGFuIDc7XG4gIH0gKi9cbiAgLmhpZGRlbiB7XG4gICAgb3BhY2l0eTogMDtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgfVxuICAuY2FyZCA6Z2xvYmFsKC5yb3cpIHtcbiAgICBtYXJnaW4tdG9wOiBhdXRvO1xuICAgIG1hcmdpbi1ib3R0b206IDEuMmVtO1xuICB9XG4gIC5sb2FkLW1vcmUge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBib3R0b206IC02ZW07XG4gICAgbGVmdDogNTAlO1xuICAgIGFwcGVhcmFuY2U6IG5vbmU7XG4gICAgZm9udC1zaXplOiAxLjNlbTtcbiAgICBmb250LXdlaWdodDogNzAwO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgIGJvcmRlcjogbm9uZTtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XG4gIH1cblxuICBAbWVkaWEgKG1heC13aWR0aDogNjAwcHgpIHtcbiAgICAubGlzdCB7XG4gICAgICBtYXJnaW4tbGVmdDogMnZ3O1xuICAgIH1cbiAgfVxuIl19 */</style>\"],\"names\":[],\"mappings\":\"AAyNE,EAAE,cAAC,CAAC,AAGF,QAAQ,CAAE,QAAQ,CAIlB,OAAO,CAAE,GAAG,CAAC,CAAC,CAAC,IAAI,CACnB,MAAM,CAAE,CAAC,CAAC,IAAI,CAAC,GAAG,CAClB,KAAK,CAAE,GAAG,AAEZ,CAAC,AACD,QAAQ,cAAC,CAAC,AACR,UAAU,CAAE,MAAM,CAClB,OAAO,CAAE,GAAG,CACZ,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,IAAI,cAAC,CAAC,AAWJ,cAAc,CAAE,GAAG,AACrB,CAAC,AAeD,MAAM,cAAC,CAAC,AACN,KAAK,CAAE,OAAO,CACd,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,KAAK,CAAC,CAAC,CAAC,MAAM,CAAC,KAAK,CAC5B,UAAU,CAAE,MAAM,CAClB,WAAW,CAAE,GAAG,CAChB,SAAS,CAAE,KAAK,AAClB,CAAC,AAKD,KAAK,cAAC,CAAC,AACL,QAAQ,CAAE,QAAQ,CAClB,UAAU,CAAE,GAAG,AAUjB,CAAC,AAUD,KAAK,cAAC,CAAC,AAGL,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,IAAI,CAOX,UAAU,CAAE,SAAS,CAAC,IAAI,CAAC,QAAQ,AAOrC,CAAC,AACD,gBAAgB,cAAC,CAAC,AAChB,OAAO,CAAE,CAAC,AACZ,CAAC,AA8BD,OAAO,cAAC,CAAC,AACP,OAAO,CAAE,CAAC,CACV,cAAc,CAAE,IAAI,AACtB,CAAC,AACD,mBAAK,CAAC,AAAQ,IAAI,AAAE,CAAC,AACnB,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,KAAK,AACtB,CAAC,AACD,UAAU,cAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,IAAI,CACZ,IAAI,CAAE,GAAG,CACT,kBAAkB,CAAE,IAAI,CACrB,eAAe,CAAE,IAAI,CAChB,UAAU,CAAE,IAAI,CACxB,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,SAAS,CAAE,WAAW,IAAI,CAAC,AAC7B,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AACzB,KAAK,cAAC,CAAC,AACL,WAAW,CAAE,GAAG,AAClB,CAAC,AACH,CAAC\"}"
};
const pageHeight = 1600;

const List = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { isLoading } = $$props;
	let { data = [] } = $$props;
	let { iteration } = $$props;
	let { isFiltered } = $$props;
	let { filterIteration } = $$props;
	let { filterFunction } = $$props;
	let { filterColor } = $$props;
	let windowWidth = 1200;
	let containerElement;
	let listWidth = 1200;
	let totalHeight = 300;
	let pageIndex = 1;
	const metadata = {};

	if ($$props.isLoading === void 0 && $$bindings.isLoading && isLoading !== void 0) $$bindings.isLoading(isLoading);
	if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
	if ($$props.iteration === void 0 && $$bindings.iteration && iteration !== void 0) $$bindings.iteration(iteration);
	if ($$props.isFiltered === void 0 && $$bindings.isFiltered && isFiltered !== void 0) $$bindings.isFiltered(isFiltered);
	if ($$props.filterIteration === void 0 && $$bindings.filterIteration && filterIteration !== void 0) $$bindings.filterIteration(filterIteration);
	if ($$props.filterFunction === void 0 && $$bindings.filterFunction && filterFunction !== void 0) $$bindings.filterFunction(filterFunction);
	if ($$props.filterColor === void 0 && $$bindings.filterColor && filterColor !== void 0) $$bindings.filterColor(filterColor);
	$$result.css.add(css$8);
	let ids = data.map(({ id }) => id);

	 {
		(pageIndex = 1);
	}

	 {
		(() => {
			let runningColumnId = 0;
			const itemsPerRow = Math.round(windowWidth / 500);
			let runningYs = new Array(itemsPerRow).fill(0);
			const itemWidth = 378;

			data.forEach(d => {
				const isShowing = filterFunction(d);

				if (!isShowing) {
					metadata[d.id] = {
						...d,
						x: 0,
						y: 0,
						height: 0,
						columnId: -1,
						mainSource: sourceAccessor(d)[0],
						isShowing: false
					};

					return;
				}

				const height = Math.max(2, Math.round(titleAccessor(d).length * 1.3 / // * (d.language_code == "zh" ? 3.5 : 2)
				30)) * 30 + 170;

				metadata[d.id] = {
					...d,
					x: runningColumnId * itemWidth,
					y: runningYs[runningColumnId],
					height,
					columnId: runningColumnId,
					mainSource: sourceAccessor(d)[0],
					isShowing: true
				};

				runningYs[runningColumnId] += height + 60;
				runningColumnId = (runningColumnId + 1) % itemsPerRow;
			});

			listWidth = itemWidth * (itemsPerRow * 0.98);
			if (itemsPerRow == 1) listWidth = null;
			totalHeight = Math.max(...runningYs);
		})();
	}

	let itemsCount = (data || []).length;
	let showingItemsCount = Object.values(metadata).filter(d => d.isShowing).length;
	let listHeight = pageHeight * pageIndex;

	return `

<div class="${"c svelte-s14geo"}"${add_attribute("style", `width: ${listWidth}px`, 0)}${add_attribute("this", containerElement, 1)}>
  <div class="${"main-list svelte-s14geo"}">
    
    <div class="${"list svelte-s14geo"}"${add_attribute("style", `height: ${listHeight + 210}px;`, 0)}>
      ${each(ids, id => `${metadata[id] && metadata[id].y <= listHeight
	? `<div class="${[
			escape(null_to_empty(`card card--column-${metadata[id].columnId} card-${titleAccessor(metadata[id]).length < 60
			? "s"
			: titleAccessor(metadata[id]).length < 90
				? "m"
				: titleAccessor(metadata[id]).length < 160
					? "l"
					: titleAccessor(metadata[id]).length < 200 ? "xl" : "xxl"}`)) + " svelte-s14geo",
			!metadata[id].isShowing ? "hidden" : ""
		].join(" ").trim()}"${add_attribute(
			"style",
			[
				`transform: translate(${metadata[id].x}px, ${metadata[id].y}px)`,
				`height: ${metadata[id].height}px`,
				`width: ${listWidth ? "345px" : null}`
			].join(";"),
			0
		)}>
            ${validate_component(ListItem, "ListItem").$$render($$result, { item: metadata[id] }, {}, {})}
          </div>`
	: ``}`)}
      ${!ids.filter(id => metadata[id].isShowing).length
	? `<p class="${"loading svelte-s14geo"}">
          ${escape(isLoading
		? "Loading fact checks..."
		: "No items found with those filters")}
        </p>`
	: ``}

    </div>

    ${listHeight < totalHeight
	? `<button class="${"load-more svelte-s14geo"}">
        Show more
      </button>`
	: ``}

  </div>
</div>`;
});

/* src/components/Footer.svelte generated by Svelte v3.19.1 */

const css$9 = {
	code: "footer.svelte-1wc09a8.svelte-1wc09a8{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10em 2em;background:#fff}.logo.svelte-1wc09a8.svelte-1wc09a8{width:11em}.item.svelte-1wc09a8.svelte-1wc09a8{display:flex;flex-direction:column;align-items:center;position:relative}.label.svelte-1wc09a8.svelte-1wc09a8{font-size:1em;line-height:1.6em}.orgs-label.svelte-1wc09a8.svelte-1wc09a8{max-width:50em;margin-top:4em;line-height:1.6em;text-align:center;font-size:1em}.orgs.svelte-1wc09a8.svelte-1wc09a8{display:flex;align-items:flex-start;justify-content:center;flex-wrap:wrap;padding:1em;text-align:center}.org.svelte-1wc09a8.svelte-1wc09a8{padding:0.6em 1em;font-weight:700;opacity:0.6}.inline-link.svelte-1wc09a8.svelte-1wc09a8{color:inherit;font-weight:700}.gni.svelte-1wc09a8.svelte-1wc09a8{margin-top:2em;width:100%;display:flex;text-align:right;justify-content:flex-end;align-items:flex-end}.gni.svelte-1wc09a8 .label.svelte-1wc09a8{margin-right:0.8em}",
	map: "{\"version\":3,\"file\":\"Footer.svelte\",\"sources\":[\"Footer.svelte\"],\"sourcesContent\":[\"<script>\\n  export let organizations\\n</script>\\n\\n<footer id=\\\"footer\\\">\\n  <div class=\\\"orgs-label\\\">\\n    Led by the <a class=\\\"inline-link\\\" href=\\\"https://www.poynter.org/ifcn/\\\" target=\\\"_blank\\\">International Fact-Checking Network (IFCN)</a> at <a class=\\\"inline-link\\\" href=\\\"https://www.poynter.org/\\\" target=\\\"_blank\\\">the Poynter Institute</a>, the <a class=\\\"inline-link\\\" href=\\\"https://www.poynter.org/coronavirusfactsalliance/\\\" target=\\\"_blank\\\">CoronaVirusFacts / DatosCoronaVirus Alliance</a> unites more than 100 fact-checkers around the world in publishing, sharing and translating facts surrounding the novel coronavirus.\\n    <br />\\n    <br />\\n    Members of the <a class=\\\"inline-link\\\" href=\\\"https://www.poynter.org/coronavirusfactsalliance/\\\" target=\\\"_blank\\\">CoronaVirusFacts / DatosCoronaVirus Alliance</a> include\\n  </div>\\n  <div class=\\\"orgs\\\">\\n    {#each organizations as org}\\n      <div class=\\\"org\\\">\\n        { org }\\n      </div>\\n    {/each}\\n  </div>\\n\\n  <div class=\\\"item gni\\\">\\n    <div class=\\\"label\\\">\\n      With support from\\n    </div>\\n    <img class=\\\"logo\\\" src=\\\"assets/newsinit_logo.png\\\" alt=\\\"Google News Initiative logo\\\" />\\n  </div>\\n\\n</footer>\\n\\n<style>\\n  footer {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    justify-content: center;\\n    padding: 10em 2em;\\n    background: #fff;\\n  }\\n  .logo {\\n    width: 11em;\\n  }\\n  .item {\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    position: relative;\\n  }\\n  .label {\\n    font-size: 1em;\\n    line-height: 1.6em;\\n    /* text-transform: uppercase;\\n    letter-spacing: 0.1em; */\\n  }\\n  .orgs-label {\\n    max-width: 50em;\\n    margin-top: 4em;\\n    line-height: 1.6em;\\n    text-align: center;\\n    font-size: 1em;\\n  }\\n  .orgs {\\n    display: flex;\\n    align-items: flex-start;\\n    justify-content: center;\\n    flex-wrap: wrap;\\n    padding: 1em;\\n    text-align: center;\\n  }\\n  .org {\\n    padding: 0.6em 1em;\\n    font-weight: 700;\\n    opacity: 0.6;\\n  }\\n  .inline-link {\\n    color: inherit;\\n    font-weight: 700;\\n  }\\n  .gni {\\n    margin-top: 2em;\\n    width: 100%;\\n    display: flex;\\n    text-align: right;\\n    justify-content: flex-end;\\n    align-items: flex-end;\\n  }\\n  .gni .label {\\n    margin-right: 0.8em;\\n  }\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0Zvb3Rlci5zdmVsdGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtFQUNFO0lBQ0UsYUFBYTtJQUNiLHNCQUFzQjtJQUN0QixtQkFBbUI7SUFDbkIsdUJBQXVCO0lBQ3ZCLGlCQUFpQjtJQUNqQixnQkFBZ0I7RUFDbEI7RUFDQTtJQUNFLFdBQVc7RUFDYjtFQUNBO0lBQ0UsYUFBYTtJQUNiLHNCQUFzQjtJQUN0QixtQkFBbUI7SUFDbkIsa0JBQWtCO0VBQ3BCO0VBQ0E7SUFDRSxjQUFjO0lBQ2Qsa0JBQWtCO0lBQ2xCOzRCQUN3QjtFQUMxQjtFQUNBO0lBQ0UsZUFBZTtJQUNmLGVBQWU7SUFDZixrQkFBa0I7SUFDbEIsa0JBQWtCO0lBQ2xCLGNBQWM7RUFDaEI7RUFDQTtJQUNFLGFBQWE7SUFDYix1QkFBdUI7SUFDdkIsdUJBQXVCO0lBQ3ZCLGVBQWU7SUFDZixZQUFZO0lBQ1osa0JBQWtCO0VBQ3BCO0VBQ0E7SUFDRSxrQkFBa0I7SUFDbEIsZ0JBQWdCO0lBQ2hCLFlBQVk7RUFDZDtFQUNBO0lBQ0UsY0FBYztJQUNkLGdCQUFnQjtFQUNsQjtFQUNBO0lBQ0UsZUFBZTtJQUNmLFdBQVc7SUFDWCxhQUFhO0lBQ2IsaUJBQWlCO0lBQ2pCLHlCQUF5QjtJQUN6QixxQkFBcUI7RUFDdkI7RUFDQTtJQUNFLG1CQUFtQjtFQUNyQiIsImZpbGUiOiJzcmMvY29tcG9uZW50cy9Gb290ZXIuc3ZlbHRlIiwic291cmNlc0NvbnRlbnQiOlsiXG4gIGZvb3RlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgcGFkZGluZzogMTBlbSAyZW07XG4gICAgYmFja2dyb3VuZDogI2ZmZjtcbiAgfVxuICAubG9nbyB7XG4gICAgd2lkdGg6IDExZW07XG4gIH1cbiAgLml0ZW0ge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgfVxuICAubGFiZWwge1xuICAgIGZvbnQtc2l6ZTogMWVtO1xuICAgIGxpbmUtaGVpZ2h0OiAxLjZlbTtcbiAgICAvKiB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgIGxldHRlci1zcGFjaW5nOiAwLjFlbTsgKi9cbiAgfVxuICAub3Jncy1sYWJlbCB7XG4gICAgbWF4LXdpZHRoOiA1MGVtO1xuICAgIG1hcmdpbi10b3A6IDRlbTtcbiAgICBsaW5lLWhlaWdodDogMS42ZW07XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIGZvbnQtc2l6ZTogMWVtO1xuICB9XG4gIC5vcmdzIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGZsZXgtd3JhcDogd3JhcDtcbiAgICBwYWRkaW5nOiAxZW07XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB9XG4gIC5vcmcge1xuICAgIHBhZGRpbmc6IDAuNmVtIDFlbTtcbiAgICBmb250LXdlaWdodDogNzAwO1xuICAgIG9wYWNpdHk6IDAuNjtcbiAgfVxuICAuaW5saW5lLWxpbmsge1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gIH1cbiAgLmduaSB7XG4gICAgbWFyZ2luLXRvcDogMmVtO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgdGV4dC1hbGlnbjogcmlnaHQ7XG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcbiAgICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XG4gIH1cbiAgLmduaSAubGFiZWwge1xuICAgIG1hcmdpbi1yaWdodDogMC44ZW07XG4gIH1cbiJdfQ== */</style>\"],\"names\":[],\"mappings\":\"AA6BE,MAAM,8BAAC,CAAC,AACN,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,OAAO,CAAE,IAAI,CAAC,GAAG,CACjB,UAAU,CAAE,IAAI,AAClB,CAAC,AACD,KAAK,8BAAC,CAAC,AACL,KAAK,CAAE,IAAI,AACb,CAAC,AACD,KAAK,8BAAC,CAAC,AACL,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,QAAQ,AACpB,CAAC,AACD,MAAM,8BAAC,CAAC,AACN,SAAS,CAAE,GAAG,CACd,WAAW,CAAE,KAAK,AAGpB,CAAC,AACD,WAAW,8BAAC,CAAC,AACX,SAAS,CAAE,IAAI,CACf,UAAU,CAAE,GAAG,CACf,WAAW,CAAE,KAAK,CAClB,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,GAAG,AAChB,CAAC,AACD,KAAK,8BAAC,CAAC,AACL,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,UAAU,CACvB,eAAe,CAAE,MAAM,CACvB,SAAS,CAAE,IAAI,CACf,OAAO,CAAE,GAAG,CACZ,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,IAAI,8BAAC,CAAC,AACJ,OAAO,CAAE,KAAK,CAAC,GAAG,CAClB,WAAW,CAAE,GAAG,CAChB,OAAO,CAAE,GAAG,AACd,CAAC,AACD,YAAY,8BAAC,CAAC,AACZ,KAAK,CAAE,OAAO,CACd,WAAW,CAAE,GAAG,AAClB,CAAC,AACD,IAAI,8BAAC,CAAC,AACJ,UAAU,CAAE,GAAG,CACf,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,KAAK,CACjB,eAAe,CAAE,QAAQ,CACzB,WAAW,CAAE,QAAQ,AACvB,CAAC,AACD,mBAAI,CAAC,MAAM,eAAC,CAAC,AACX,YAAY,CAAE,KAAK,AACrB,CAAC\"}"
};

const Footer = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { organizations } = $$props;
	if ($$props.organizations === void 0 && $$bindings.organizations && organizations !== void 0) $$bindings.organizations(organizations);
	$$result.css.add(css$9);

	return `<footer id="${"footer"}" class="${"svelte-1wc09a8"}">
  <div class="${"orgs-label svelte-1wc09a8"}">
    Led by the <a class="${"inline-link svelte-1wc09a8"}" href="${"https://www.poynter.org/ifcn/"}" target="${"_blank"}">International Fact-Checking Network (IFCN)</a> at <a class="${"inline-link svelte-1wc09a8"}" href="${"https://www.poynter.org/"}" target="${"_blank"}">the Poynter Institute</a>, the <a class="${"inline-link svelte-1wc09a8"}" href="${"https://www.poynter.org/coronavirusfactsalliance/"}" target="${"_blank"}">CoronaVirusFacts / DatosCoronaVirus Alliance</a> unites more than 100 fact-checkers around the world in publishing, sharing and translating facts surrounding the novel coronavirus.
    <br>
    <br>
    Members of the <a class="${"inline-link svelte-1wc09a8"}" href="${"https://www.poynter.org/coronavirusfactsalliance/"}" target="${"_blank"}">CoronaVirusFacts / DatosCoronaVirus Alliance</a> include
  </div>
  <div class="${"orgs svelte-1wc09a8"}">
    ${each(organizations, org => `<div class="${"org svelte-1wc09a8"}">
        ${escape(org)}
      </div>`)}
  </div>

  <div class="${"item gni svelte-1wc09a8"}">
    <div class="${"label svelte-1wc09a8"}">
      With support from
    </div>
    <img class="${"logo svelte-1wc09a8"}" src="${"assets/newsinit_logo.png"}" alt="${"Google News Initiative logo"}">
  </div>

</footer>`;
});

/* src/components/App.svelte generated by Svelte v3.19.1 */

const css$a = {
	code: "@font-face{font-family:\"Poynter Gothic\";src:url('assets/PoynterGothicText-Regular.woff') format('woff');font-weight:500}@font-face{font-family:\"Poynter Gothic\";src:url('assets/PoynterGothicText-Bold.woff') format('woff');font-weight:700}main.svelte-1axubdp{width:100%;margin:0 auto;color:#1f2025;display:flex;flex-direction:column;font-family:\"Poynter Gothic\", Helvetica, Arial, sans-serif;--max-lines:20}.section.svelte-1axubdp{display:flex;flex-direction:column;align-items:center;min-height:6em}.section+.section.svelte-1axubdp{margin:3em 0 2em}p.svelte-1axubdp{max-width:60em;text-align:center;margin:1em 0;padding:0 3rem;font-size:1.3em;line-height:1.6em}.sticky.svelte-1axubdp{position:-webkit-sticky;position:sticky;top:0;margin-top:0.2em;padding:0.3em 1em 0.5em;background:#fff;box-shadow:0px 8px 10px -8px rgba(52, 73, 94, .2), 0 1px 1px rgba(52, 73, 94, 0.1);z-index:500}.sticky-contents.svelte-1axubdp{display:flex;align-items:flex-end;max-width:60em;margin:0 auto}.filters-label.svelte-1axubdp{margin:0 1em 0.5em 0}@media(max-width: 800px){.sticky-contents.svelte-1axubdp{font-size:0.8em}.filters-label.svelte-1axubdp{width:100%;margin:1em 0 0 1em;margin-bottom:1em}}.map-title.svelte-1axubdp{max-width:20em;margin-bottom:-5vw}@media(max-width: 900px){.sticky.svelte-1axubdp{position:relative}.sticky-contents.svelte-1axubdp{flex-wrap:wrap}.map-title.svelte-1axubdp{margin-bottom:2em}}.embedded{overflow:hidden}",
	map: "{\"version\":3,\"file\":\"App.svelte\",\"sources\":[\"App.svelte\"],\"sourcesContent\":[\"<script>\\n\\timport { onMount } from 'svelte'\\n\\timport { csv } from \\\"d3-request\\\"\\n\\n\\t// // import Header from \\\"./Header.svelte\\\"\\n\\timport Intro from \\\"./Intro.svelte\\\"\\n\\timport Clusters from \\\"./Clusters--topics.svelte\\\"\\n\\timport MapClusters from \\\"./MapClusters.svelte\\\"\\n\\timport Map from \\\"./Map.svelte\\\"\\n\\timport List from \\\"./List.svelte\\\"\\n\\timport ListTimeline from \\\"./ListTimeline.svelte\\\"\\n\\timport ListFilter from \\\"./ListFilter.svelte\\\"\\n\\timport Footer from \\\"./Footer.svelte\\\"\\n  import { debounce, flatten, getUrlParams } from \\\"./utils\\\"\\n  import { categoryAccessor, categoryColors, categories, dateAccessor, ratings, sources, titleAccessor, countryAccessor, countriesAccessor, organizationAccessor, ratingAccessor, sourceAccessor, getMatchingTags, tags, tagsAccessor, tagColors } from \\\"./data-utils\\\"\\n\\n\\t// const dataUrl = \\\"https://pudding.cool/misc/covid-fact-checker/data.json\\\"\\n\\tconst dataUrl = \\\"https://pudding.cool/misc/covid-fact-checker/data.csv\\\"\\n\\tlet iteration = 0\\n\\tlet filterIteration = 0\\n\\tlet data = []\\n\\tlet countries = []\\n\\tlet organizations = []\\n\\tlet isLoading = true\\n\\tlet embed = null\\n\\tconst allSections = [\\n\\t\\t\\\"intro\\\",\\n\\t\\t\\\"filters\\\",\\n\\t\\t\\\"clusters\\\",\\n\\t\\t\\\"map\\\",\\n\\t\\t\\\"timeline\\\",\\n\\t\\t\\\"list\\\",\\n\\t\\t\\\"footer\\\",\\n\\t]\\n\\t// let sections = [\\\"intro\\\"]\\n\\tlet sections = []\\n\\tconst sortedTags = [...tags].sort()\\n\\tconst sortedSources = sources.sort()\\n\\n\\tonMount(() => {\\n\\t\\t// const res = await fetch(dataUrl)\\n\\t\\tconst urlParams = getUrlParams()\\n\\t\\tsections = urlParams[\\\"embed\\\"] ? urlParams[\\\"embed\\\"].split(\\\",\\\") : allSections\\n\\t\\tif (sections.length < 3) {\\n\\t\\t\\tdocument.body.classList.add(\\\"embedded\\\")\\n\\t\\t}\\n\\n\\t\\tcsv(dataUrl)\\n\\t\\t.row(d => ({\\n\\t\\t\\t...d,\\n\\t\\t\\tdate: d[\\\"When did you see the claim?\\\"],\\n\\t\\t\\tcountries: (d[\\\"Countries\\\"] || \\\"\\\").split(\\\",\\\"),\\n\\t\\t\\torganization: d[\\\"Organization\\\"],\\n\\t\\t\\tcategory: d[\\\"Category\\\"],\\n\\t\\t\\trating: d[\\\"Final rating\\\"],\\n\\t\\t\\tlang: d[\\\"Language of your fact-check\\\"],\\n\\t\\t\\turl: d[\\\"URL to fact-checked article (in your language)\\\"],\\n\\t\\t\\tsource: d[\\\"Who said/posted it?\\\"],\\n\\t\\t\\ttitle: d[\\\"What did you fact-check?\\\"],\\n\\t\\t\\ttags: d[\\\"manual topic override\\\"] ? [d[\\\"manual topic override\\\"]] : getMatchingTags(d[\\\"What did you fact-check?\\\"]),\\n\\t\\t}))\\n\\t\\t.get(resJson => {\\n\\t\\t\\tdata = resJson\\n\\t\\t\\t\\t.sort((a,b) => (\\n\\t\\t\\t\\t\\tdateAccessor(a) > dateAccessor(b) ? -1 : 1\\n\\t\\t\\t\\t)).map((d,i) =>({\\n\\t\\t\\t\\t\\t...d,\\n\\t\\t\\t\\t\\tid: i,\\n\\t\\t\\t\\t}))\\n\\t\\t\\tisLoading = false\\n\\t\\t\\tcountries = [...new Set(flatten(data.map(countriesAccessor)))].sort()\\n\\t\\t\\torganizations = [...new Set(data.map(organizationAccessor))].sort()\\n\\t\\t\\titeration++\\n\\t\\t})\\n\\t})\\n\\n\\tlet searchString = \\\"\\\"\\n\\tlet searchStringRaw = \\\"\\\"\\n  const onUpdateSearchString = e => {\\n    const newValue = searchStringRaw\\n    searchString = newValue\\n\\t\\tfilterIteration++\\n\\t}\\n\\tconst debouncedOnUpdateSearchString = debounce(onUpdateSearchString, 300)\\n\\t$: searchStringRaw, debouncedOnUpdateSearchString()\\n\\n\\t// let selectedCategory = null\\n\\tlet selectedTag = null\\n\\tlet selectedCountry = null\\n\\tlet selectedRating = null\\n\\tlet selectedSource = null\\n\\tlet selectedOrg = null\\n\\t$: filterFunction = d => (\\n\\t\\t(!selectedTag || (tagsAccessor(d).includes(selectedTag)))\\n\\t\\t&& (!selectedCountry || (countryAccessor(d) == selectedCountry))\\n\\t\\t&& (!selectedRating || (ratingAccessor(d) == selectedRating))\\n\\t\\t&& (!selectedOrg || (organizationAccessor(d) == selectedOrg))\\n\\t\\t&& (!selectedSource || (sourceAccessor(d) == selectedSource))\\n\\t\\t&& (!searchString || ((titleAccessor(d).toLowerCase().includes(searchString.toLowerCase()))))\\n\\t)\\n\\n\\t$: isFiltered = searchString || selectedTag || selectedCountry || selectedRating || selectedOrg || selectedSource\\n\\t$: filterColor = isFiltered && (\\n\\t\\tselectedTag && !(searchString || selectedCountry) ? tagColors[selectedTag] : null\\n\\t)\\n\\t$: selectedTag, selectedCountry, selectedRating, selectedOrg, selectedSource, filterIteration++\\n</script>\\n\\n<!-- <Header /> -->\\n\\n<main>\\n\\t{#if sections.includes(\\\"intro\\\")}\\n\\t\\t<Intro {data} {isLoading} />\\n\\t{/if}\\n\\n\\t{#if sections.includes(\\\"filters\\\")}\\n\\t\\t\\t<div class=\\\"sticky\\\">\\n\\t\\t\\t\\t<div class=\\\"sticky-contents\\\">\\n\\t\\t\\t\\t\\t<div class=\\\"filters-label\\\">\\n\\t\\t\\t\\t\\t\\tFilter the {#if sections.filter(d => d != \\\"filters\\\").length == 1}\\n\\t\\t\\t\\t\\t\\t\\t{ sections.filter(d => d != \\\"filters\\\") }\\n\\t\\t\\t\\t\\t\\t{:else}\\n\\t\\t\\t\\t\\t\\t\\tfact checks\\n\\t\\t\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t<ListFilter\\n\\t\\t\\t\\t\\t\\tlabel=\\\"Filter the fact checks\\\"\\n\\t\\t\\t\\t\\t\\toptions={categories}\\n\\t\\t\\t\\t\\t\\tplaceholder=\\\"Search for a fact check...\\\"\\n\\t\\t\\t\\t\\t\\tbind:value={searchStringRaw}\\n\\t\\t\\t\\t\\t\\ttype=\\\"input\\\"\\n\\t\\t\\t\\t\\t/>\\n\\t\\t\\t\\t\\t<ListFilter\\n\\t\\t\\t\\t\\t\\tlabel=\\\"Topic\\\"\\n\\t\\t\\t\\t\\t\\toptions={sortedTags}\\n\\t\\t\\t\\t\\t\\tbind:value={selectedTag}\\n\\t\\t\\t\\t\\t/>\\n\\t\\t\\t\\t\\t<!-- <ListFilter\\n\\t\\t\\t\\t\\t\\tlabel=\\\"Primary Country\\\"\\n\\t\\t\\t\\t\\t\\toptions={countries}\\n\\t\\t\\t\\t\\t\\tbind:value={selectedCountry}\\n\\t\\t\\t\\t\\t/> -->\\n\\t\\t\\t\\t\\t<!-- <ListFilter\\n\\t\\t\\t\\t\\t\\tlabel=\\\"Rating\\\"\\n\\t\\t\\t\\t\\t\\toptions={ratings}\\n\\t\\t\\t\\t\\t\\tbind:value={selectedRating}\\n\\t\\t\\t\\t\\t/> -->\\n\\t\\t\\t\\t\\t<!-- <ListFilter\\n\\t\\t\\t\\t\\t\\tlabel=\\\"Source\\\"\\n\\t\\t\\t\\t\\t\\toptions={sortedSources}\\n\\t\\t\\t\\t\\t\\tbind:value={selectedSource}\\n\\t\\t\\t\\t\\t/> -->\\n\\t\\t\\t\\t\\t<ListFilter\\n\\t\\t\\t\\t\\t\\tlabel=\\\"Fact-checker\\\"\\n\\t\\t\\t\\t\\t\\toptions={organizations}\\n\\t\\t\\t\\t\\t\\tbind:value={selectedOrg}\\n\\t\\t\\t\\t\\t/>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t</div>\\n\\t\\t{/if}\\n\\n\\t\\t{#if sections.includes(\\\"map\\\") && sections.includes(\\\"clusters\\\")}\\n\\t\\t\\t\\t<p style=\\\"margin-bottom: 3em; margin-top: 0;\\\">\\n\\t\\t\\t\\t\\tWe've grouped each of these fact-checks into categories:\\n\\t\\t\\t\\t</p>\\n\\t\\t{/if}\\n\\n\\t\\t{#if sections.includes(\\\"clusters\\\")}\\n\\t\\t\\t<div class=\\\"section\\\" id=\\\"categories\\\">\\n\\t\\t\\t\\t<Clusters {data} {isFiltered} {filterIteration} {filterFunction} {filterColor} {iteration} isEmbedded={sections.length < allSections.length} />\\n\\t\\t\\t</div>\\n\\t\\t{/if}\\n\\n\\t\\t{#if sections.includes(\\\"map\\\") && sections.includes(\\\"clusters\\\")}\\n\\t\\t\\t<p class=\\\"map-title\\\" style=\\\"margin: 3em auto -3em\\\">\\n\\t\\t\\t\\tWe also looked at what country each fact check primarily originated in.\\n\\t\\t\\t</p>\\n\\t\\t{/if}\\n\\n\\t\\t{#if sections.includes(\\\"map\\\")}\\n\\t\\t\\t<div class=\\\"section\\\" id=\\\"countries\\\">\\n\\t\\t\\t\\t<Map {data} {isFiltered} {filterIteration} {filterFunction} {filterColor} {iteration} {countries} isEmbedded={sections.length < allSections.length} />\\n\\t\\t\\t</div>\\n\\t\\t{/if}\\n\\n\\t\\t{#if sections.includes(\\\"timeline\\\")}\\n\\t\\t\\t<ListTimeline\\n\\t\\t\\t\\t{data}\\n\\t\\t\\t\\t{filterFunction}\\n\\t\\t\\t\\titeration={filterIteration + iteration}\\n\\t\\t\\t\\tcolor={filterColor}\\n\\t\\t\\t\\t{isFiltered}\\n\\t\\t\\t/>\\n\\t\\t{/if}\\n\\n\\t\\t{#if sections.includes(\\\"list\\\")}\\n\\t\\t\\t<div class=\\\"section\\\" id=\\\"list\\\">\\n\\t\\t\\t\\t<List {data} {isLoading} {isFiltered} {filterIteration} {filterFunction} {filterColor} {iteration} />\\n\\t\\t\\t</div>\\n\\t\\t{/if}\\n</main>\\n\\n{#if sections.includes(\\\"footer\\\")}\\n\\t<Footer {organizations} />\\n{/if}\\n\\n<style>\\n\\t@font-face {\\n\\t\\tfont-family: \\\"Poynter Gothic\\\";\\n\\t\\tsrc: url('assets/PoynterGothicText-Regular.woff') format('woff');\\n\\t\\tfont-weight: 500;\\n\\t}\\n\\t@font-face {\\n\\t\\tfont-family: \\\"Poynter Gothic\\\";\\n\\t\\tsrc: url('assets/PoynterGothicText-Bold.woff') format('woff');\\n\\t\\tfont-weight: 700;\\n\\t}\\n\\n\\tmain {\\n\\t\\t/* max-width: 70em; */\\n\\t\\twidth: 100%;\\n\\t\\tmargin: 0 auto;\\n\\t\\t/* padding: 6em 4em; */\\n\\t\\tcolor: #1f2025;\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\tfont-family: \\\"Poynter Gothic\\\", Helvetica, Arial, sans-serif;\\n\\t\\t/* align-items: center; */\\n\\t\\t/* text-align: center; */\\n\\t\\t/* background: #f3f8fb; */\\n\\n\\t\\t--max-lines: 20;\\n\\t}\\n\\n\\t.section {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\talign-items: center;\\n\\t\\tmin-height: 6em;\\n\\t}\\n\\t.section + .section {\\n\\t\\tmargin: 3em 0 2em;\\n\\t}\\n\\tp {\\n\\t\\tmax-width: 60em;\\n\\t\\t/* text-align: left; */\\n\\t\\ttext-align: center;\\n\\t\\tmargin: 1em 0;\\n\\t\\tpadding: 0 3rem;\\n\\t\\tfont-size: 1.3em;\\n\\t\\tline-height: 1.6em;\\n\\t}\\n\\t.sticky {\\n\\t\\tposition: -webkit-sticky;\\n\\t\\tposition: sticky;\\n\\t\\ttop: 0;\\n\\t\\tmargin-top: 0.2em;\\n\\t\\tpadding: 0.3em 1em 0.5em;\\n    background: #fff;\\n    box-shadow: 0px 8px 10px -8px rgba(52, 73, 94, .2), 0 1px 1px rgba(52, 73, 94, 0.1);\\n\\t\\tz-index: 500;\\n\\t}\\n\\t.sticky-contents {\\n\\t\\tdisplay: flex;\\n\\t\\t/* align-items: center; */\\n\\t\\talign-items: flex-end;\\n\\t\\tmax-width: 60em;\\n\\t\\tmargin: 0 auto;\\n\\t}\\n\\t.filters-label {\\n    margin: 0 1em 0.5em 0;\\n\\t}\\n\\t@media (max-width: 800px) {\\n\\t\\t.sticky-contents {\\n\\t\\t\\tfont-size: 0.8em;\\n\\t\\t}\\n\\t\\t.filters-label {\\n\\t\\t\\twidth: 100%;\\n\\t\\t\\tmargin: 1em 0 0 1em;\\n\\t\\t\\tmargin-bottom: 1em;\\n\\t\\t}\\n\\t}\\n\\t.search {\\n\\t\\tflex: 1;\\n\\t\\t/* padding-right: 0.6em; */\\n\\t\\t/* margin-bottom: 0.1em; */\\n\\t}\\n\\t/* .right:before {\\n\\t\\tcontent: \\\"\\\";\\n\\t\\tposition: absolute;\\n\\t\\ttop: 0;\\n\\t\\tright: 0;\\n\\t\\tbottom: 0;\\n\\t\\tleft: 0;\\n\\t\\tbackground: #f3f8fb;\\n\\t\\tz-index: -1;\\n\\t} */\\n\\t.map-title {\\n\\t\\tmax-width: 20em;\\n\\t\\tmargin-bottom: -5vw;\\n\\t}\\n\\tselect {\\n\\t\\tposition: fixed;\\n\\t\\ttop: 0;\\n\\t\\tright: 0;\\n\\t\\tfont-size: 0.8em;\\n\\t\\tz-index: 1000;\\n\\t}\\n\\n\\t@media (max-width: 900px) {\\n\\t\\t.sticky {\\n\\t\\t\\tposition: relative;\\n\\t\\t}\\n\\t\\t.sticky-contents {\\n\\t\\t\\tflex-wrap: wrap;\\n\\t\\t}\\n\\t\\t.map-title {\\n\\t\\t\\tmargin-bottom: 2em;\\n\\t\\t}\\n\\t}\\n\\n\\t:global(.embedded) {\\n\\t\\toverflow: hidden;\\n\\t}\\n\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jb21wb25lbnRzL0FwcC5zdmVsdGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtDQUNDO0VBQ0MsNkJBQTZCO0VBQzdCLGdFQUFnRTtFQUNoRSxnQkFBZ0I7Q0FDakI7Q0FDQTtFQUNDLDZCQUE2QjtFQUM3Qiw2REFBNkQ7RUFDN0QsZ0JBQWdCO0NBQ2pCOztDQUVBO0VBQ0MscUJBQXFCO0VBQ3JCLFdBQVc7RUFDWCxjQUFjO0VBQ2Qsc0JBQXNCO0VBQ3RCLGNBQWM7RUFDZCxhQUFhO0VBQ2Isc0JBQXNCO0VBQ3RCLDJEQUEyRDtFQUMzRCx5QkFBeUI7RUFDekIsd0JBQXdCO0VBQ3hCLHlCQUF5Qjs7RUFFekIsZUFBZTtDQUNoQjs7Q0FFQTtFQUNDLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsbUJBQW1CO0VBQ25CLGVBQWU7Q0FDaEI7Q0FDQTtFQUNDLGlCQUFpQjtDQUNsQjtDQUNBO0VBQ0MsZUFBZTtFQUNmLHNCQUFzQjtFQUN0QixrQkFBa0I7RUFDbEIsYUFBYTtFQUNiLGVBQWU7RUFDZixnQkFBZ0I7RUFDaEIsa0JBQWtCO0NBQ25CO0NBQ0E7RUFDQyx3QkFBZ0I7RUFBaEIsZ0JBQWdCO0VBQ2hCLE1BQU07RUFDTixpQkFBaUI7RUFDakIsd0JBQXdCO0lBQ3RCLGdCQUFnQjtJQUNoQixtRkFBbUY7RUFDckYsWUFBWTtDQUNiO0NBQ0E7RUFDQyxhQUFhO0VBQ2IseUJBQXlCO0VBQ3pCLHFCQUFxQjtFQUNyQixlQUFlO0VBQ2YsY0FBYztDQUNmO0NBQ0E7SUFDRyxxQkFBcUI7Q0FDeEI7Q0FDQTtFQUNDO0dBQ0MsZ0JBQWdCO0VBQ2pCO0VBQ0E7R0FDQyxXQUFXO0dBQ1gsbUJBQW1CO0dBQ25CLGtCQUFrQjtFQUNuQjtDQUNEO0NBQ0E7RUFDQyxPQUFPO0VBQ1AsMEJBQTBCO0VBQzFCLDBCQUEwQjtDQUMzQjtDQUNBOzs7Ozs7Ozs7SUFTRztDQUNIO0VBQ0MsZUFBZTtFQUNmLG1CQUFtQjtDQUNwQjtDQUNBO0VBQ0MsZUFBZTtFQUNmLE1BQU07RUFDTixRQUFRO0VBQ1IsZ0JBQWdCO0VBQ2hCLGFBQWE7Q0FDZDs7Q0FFQTtFQUNDO0dBQ0Msa0JBQWtCO0VBQ25CO0VBQ0E7R0FDQyxlQUFlO0VBQ2hCO0VBQ0E7R0FDQyxrQkFBa0I7RUFDbkI7Q0FDRDs7Q0FFQTtFQUNDLGdCQUFnQjtDQUNqQiIsImZpbGUiOiJzcmMvY29tcG9uZW50cy9BcHAuc3ZlbHRlIiwic291cmNlc0NvbnRlbnQiOlsiXG5cdEBmb250LWZhY2Uge1xuXHRcdGZvbnQtZmFtaWx5OiBcIlBveW50ZXIgR290aGljXCI7XG5cdFx0c3JjOiB1cmwoJ2Fzc2V0cy9Qb3ludGVyR290aGljVGV4dC1SZWd1bGFyLndvZmYnKSBmb3JtYXQoJ3dvZmYnKTtcblx0XHRmb250LXdlaWdodDogNTAwO1xuXHR9XG5cdEBmb250LWZhY2Uge1xuXHRcdGZvbnQtZmFtaWx5OiBcIlBveW50ZXIgR290aGljXCI7XG5cdFx0c3JjOiB1cmwoJ2Fzc2V0cy9Qb3ludGVyR290aGljVGV4dC1Cb2xkLndvZmYnKSBmb3JtYXQoJ3dvZmYnKTtcblx0XHRmb250LXdlaWdodDogNzAwO1xuXHR9XG5cblx0bWFpbiB7XG5cdFx0LyogbWF4LXdpZHRoOiA3MGVtOyAqL1xuXHRcdHdpZHRoOiAxMDAlO1xuXHRcdG1hcmdpbjogMCBhdXRvO1xuXHRcdC8qIHBhZGRpbmc6IDZlbSA0ZW07ICovXG5cdFx0Y29sb3I6ICMxZjIwMjU7XG5cdFx0ZGlzcGxheTogZmxleDtcblx0XHRmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuXHRcdGZvbnQtZmFtaWx5OiBcIlBveW50ZXIgR290aGljXCIsIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWY7XG5cdFx0LyogYWxpZ24taXRlbXM6IGNlbnRlcjsgKi9cblx0XHQvKiB0ZXh0LWFsaWduOiBjZW50ZXI7ICovXG5cdFx0LyogYmFja2dyb3VuZDogI2YzZjhmYjsgKi9cblxuXHRcdC0tbWF4LWxpbmVzOiAyMDtcblx0fVxuXG5cdC5zZWN0aW9uIHtcblx0XHRkaXNwbGF5OiBmbGV4O1xuXHRcdGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG5cdFx0YWxpZ24taXRlbXM6IGNlbnRlcjtcblx0XHRtaW4taGVpZ2h0OiA2ZW07XG5cdH1cblx0LnNlY3Rpb24gKyAuc2VjdGlvbiB7XG5cdFx0bWFyZ2luOiAzZW0gMCAyZW07XG5cdH1cblx0cCB7XG5cdFx0bWF4LXdpZHRoOiA2MGVtO1xuXHRcdC8qIHRleHQtYWxpZ246IGxlZnQ7ICovXG5cdFx0dGV4dC1hbGlnbjogY2VudGVyO1xuXHRcdG1hcmdpbjogMWVtIDA7XG5cdFx0cGFkZGluZzogMCAzcmVtO1xuXHRcdGZvbnQtc2l6ZTogMS4zZW07XG5cdFx0bGluZS1oZWlnaHQ6IDEuNmVtO1xuXHR9XG5cdC5zdGlja3kge1xuXHRcdHBvc2l0aW9uOiBzdGlja3k7XG5cdFx0dG9wOiAwO1xuXHRcdG1hcmdpbi10b3A6IDAuMmVtO1xuXHRcdHBhZGRpbmc6IDAuM2VtIDFlbSAwLjVlbTtcbiAgICBiYWNrZ3JvdW5kOiAjZmZmO1xuICAgIGJveC1zaGFkb3c6IDBweCA4cHggMTBweCAtOHB4IHJnYmEoNTIsIDczLCA5NCwgLjIpLCAwIDFweCAxcHggcmdiYSg1MiwgNzMsIDk0LCAwLjEpO1xuXHRcdHotaW5kZXg6IDUwMDtcblx0fVxuXHQuc3RpY2t5LWNvbnRlbnRzIHtcblx0XHRkaXNwbGF5OiBmbGV4O1xuXHRcdC8qIGFsaWduLWl0ZW1zOiBjZW50ZXI7ICovXG5cdFx0YWxpZ24taXRlbXM6IGZsZXgtZW5kO1xuXHRcdG1heC13aWR0aDogNjBlbTtcblx0XHRtYXJnaW46IDAgYXV0bztcblx0fVxuXHQuZmlsdGVycy1sYWJlbCB7XG4gICAgbWFyZ2luOiAwIDFlbSAwLjVlbSAwO1xuXHR9XG5cdEBtZWRpYSAobWF4LXdpZHRoOiA4MDBweCkge1xuXHRcdC5zdGlja3ktY29udGVudHMge1xuXHRcdFx0Zm9udC1zaXplOiAwLjhlbTtcblx0XHR9XG5cdFx0LmZpbHRlcnMtbGFiZWwge1xuXHRcdFx0d2lkdGg6IDEwMCU7XG5cdFx0XHRtYXJnaW46IDFlbSAwIDAgMWVtO1xuXHRcdFx0bWFyZ2luLWJvdHRvbTogMWVtO1xuXHRcdH1cblx0fVxuXHQuc2VhcmNoIHtcblx0XHRmbGV4OiAxO1xuXHRcdC8qIHBhZGRpbmctcmlnaHQ6IDAuNmVtOyAqL1xuXHRcdC8qIG1hcmdpbi1ib3R0b206IDAuMWVtOyAqL1xuXHR9XG5cdC8qIC5yaWdodDpiZWZvcmUge1xuXHRcdGNvbnRlbnQ6IFwiXCI7XG5cdFx0cG9zaXRpb246IGFic29sdXRlO1xuXHRcdHRvcDogMDtcblx0XHRyaWdodDogMDtcblx0XHRib3R0b206IDA7XG5cdFx0bGVmdDogMDtcblx0XHRiYWNrZ3JvdW5kOiAjZjNmOGZiO1xuXHRcdHotaW5kZXg6IC0xO1xuXHR9ICovXG5cdC5tYXAtdGl0bGUge1xuXHRcdG1heC13aWR0aDogMjBlbTtcblx0XHRtYXJnaW4tYm90dG9tOiAtNXZ3O1xuXHR9XG5cdHNlbGVjdCB7XG5cdFx0cG9zaXRpb246IGZpeGVkO1xuXHRcdHRvcDogMDtcblx0XHRyaWdodDogMDtcblx0XHRmb250LXNpemU6IDAuOGVtO1xuXHRcdHotaW5kZXg6IDEwMDA7XG5cdH1cblxuXHRAbWVkaWEgKG1heC13aWR0aDogOTAwcHgpIHtcblx0XHQuc3RpY2t5IHtcblx0XHRcdHBvc2l0aW9uOiByZWxhdGl2ZTtcblx0XHR9XG5cdFx0LnN0aWNreS1jb250ZW50cyB7XG5cdFx0XHRmbGV4LXdyYXA6IHdyYXA7XG5cdFx0fVxuXHRcdC5tYXAtdGl0bGUge1xuXHRcdFx0bWFyZ2luLWJvdHRvbTogMmVtO1xuXHRcdH1cblx0fVxuXG5cdDpnbG9iYWwoLmVtYmVkZGVkKSB7XG5cdFx0b3ZlcmZsb3c6IGhpZGRlbjtcblx0fVxuIl19 */</style>\\n\"],\"names\":[],\"mappings\":\"AA+MC,UAAU,AAAC,CAAC,AACX,WAAW,CAAE,gBAAgB,CAC7B,GAAG,CAAE,IAAI,uCAAuC,CAAC,CAAC,OAAO,MAAM,CAAC,CAChE,WAAW,CAAE,GAAG,AACjB,CAAC,AACD,UAAU,AAAC,CAAC,AACX,WAAW,CAAE,gBAAgB,CAC7B,GAAG,CAAE,IAAI,oCAAoC,CAAC,CAAC,OAAO,MAAM,CAAC,CAC7D,WAAW,CAAE,GAAG,AACjB,CAAC,AAED,IAAI,eAAC,CAAC,AAEL,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CAAC,IAAI,CAEd,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,gBAAgB,CAAC,CAAC,SAAS,CAAC,CAAC,KAAK,CAAC,CAAC,UAAU,CAK3D,WAAW,CAAE,EAAE,AAChB,CAAC,AAED,QAAQ,eAAC,CAAC,AACT,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,UAAU,CAAE,GAAG,AAChB,CAAC,AACD,QAAQ,CAAG,QAAQ,eAAC,CAAC,AACpB,MAAM,CAAE,GAAG,CAAC,CAAC,CAAC,GAAG,AAClB,CAAC,AACD,CAAC,eAAC,CAAC,AACF,SAAS,CAAE,IAAI,CAEf,UAAU,CAAE,MAAM,CAClB,MAAM,CAAE,GAAG,CAAC,CAAC,CACb,OAAO,CAAE,CAAC,CAAC,IAAI,CACf,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,KAAK,AACnB,CAAC,AACD,OAAO,eAAC,CAAC,AACR,QAAQ,CAAE,cAAc,CACxB,QAAQ,CAAE,MAAM,CAChB,GAAG,CAAE,CAAC,CACN,UAAU,CAAE,KAAK,CACjB,OAAO,CAAE,KAAK,CAAC,GAAG,CAAC,KAAK,CACtB,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,KAAK,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,EAAE,CAAC,CAAC,GAAG,CAAC,CACrF,OAAO,CAAE,GAAG,AACb,CAAC,AACD,gBAAgB,eAAC,CAAC,AACjB,OAAO,CAAE,IAAI,CAEb,WAAW,CAAE,QAAQ,CACrB,SAAS,CAAE,IAAI,CACf,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC,AACD,cAAc,eAAC,CAAC,AACb,MAAM,CAAE,CAAC,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,AACxB,CAAC,AACD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,gBAAgB,eAAC,CAAC,AACjB,SAAS,CAAE,KAAK,AACjB,CAAC,AACD,cAAc,eAAC,CAAC,AACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CACnB,aAAa,CAAE,GAAG,AACnB,CAAC,AACF,CAAC,AAgBD,UAAU,eAAC,CAAC,AACX,SAAS,CAAE,IAAI,CACf,aAAa,CAAE,IAAI,AACpB,CAAC,AASD,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,OAAO,eAAC,CAAC,AACR,QAAQ,CAAE,QAAQ,AACnB,CAAC,AACD,gBAAgB,eAAC,CAAC,AACjB,SAAS,CAAE,IAAI,AAChB,CAAC,AACD,UAAU,eAAC,CAAC,AACX,aAAa,CAAE,GAAG,AACnB,CAAC,AACF,CAAC,AAEO,SAAS,AAAE,CAAC,AACnB,QAAQ,CAAE,MAAM,AACjB,CAAC\"}"
};

const dataUrl = "https://pudding.cool/misc/covid-fact-checker/data.csv";
let selectedCountry = null;
let selectedRating = null;
let selectedSource = null;

const App = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let iteration = 0;
	let filterIteration = 0;
	let data = [];
	let countries = [];
	let organizations = [];
	let isLoading = true;
	const allSections = ["intro", "filters", "clusters", "map", "timeline", "list", "footer"];

	// let sections = ["intro"]
	let sections = [];

	const sortedTags = [...tags].sort();
	const sortedSources = sources.sort();

	onMount(() => {
		// const res = await fetch(dataUrl)
		const urlParams = getUrlParams();

		sections = urlParams["embed"]
		? urlParams["embed"].split(",")
		: allSections;

		if (sections.length < 3) {
			document.body.classList.add("embedded");
		}

		d3Request.csv(dataUrl).row(d => ({
			...d,
			date: d["When did you see the claim?"],
			countries: (d["Countries"] || "").split(","),
			organization: d["Organization"],
			category: d["Category"],
			rating: d["Final rating"],
			lang: d["Language of your fact-check"],
			url: d["URL to fact-checked article (in your language)"],
			source: d["Who said/posted it?"],
			title: d["What did you fact-check?"],
			tags: d["manual topic override"]
			? [d["manual topic override"]]
			: getMatchingTags(d["What did you fact-check?"])
		})).get(resJson => {
			data = resJson.sort((a, b) => dateAccessor(a) > dateAccessor(b) ? -1 : 1).map((d, i) => ({ ...d, id: i }));
			isLoading = false;
			countries = [...new Set(flatten(data.map(countriesAccessor)))].sort();
			organizations = [...new Set(data.map(organizationAccessor))].sort();
			iteration++;
		});
	});

	let searchString = "";
	let searchStringRaw = "";

	const onUpdateSearchString = e => {
		const newValue = searchStringRaw;
		searchString = newValue;
		filterIteration++;
	};

	const debouncedOnUpdateSearchString = debounce(onUpdateSearchString, 300);

	// let selectedCategory = null
	let selectedTag = null;

	let selectedOrg = null;
	$$result.css.add(css$a);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		 {
			(debouncedOnUpdateSearchString());
		}

		let filterFunction = d => (!selectedTag || tagsAccessor(d).includes(selectedTag)) && (!selectedCountry ) && (!selectedRating ) && (!selectedOrg || organizationAccessor(d) == selectedOrg) && (!selectedSource ) && (!searchString || titleAccessor(d).toLowerCase().includes(searchString.toLowerCase()));
		let isFiltered = searchString || selectedTag || selectedCountry || selectedRating || selectedOrg || selectedSource;

		let filterColor = isFiltered && (selectedTag && !(searchString || selectedCountry)
		? tagColors[selectedTag]
		: null);

		 {
			(filterIteration++);
		}

		$$rendered = `

<main class="${"svelte-1axubdp"}">
	${sections.includes("intro")
		? `${validate_component(Intro, "Intro").$$render($$result, { data, isLoading }, {}, {})}`
		: ``}

	${sections.includes("filters")
		? `<div class="${"sticky svelte-1axubdp"}">
				<div class="${"sticky-contents svelte-1axubdp"}">
					<div class="${"filters-label svelte-1axubdp"}">
						Filter the ${sections.filter(d => d != "filters").length == 1
			? `${escape(sections.filter(d => d != "filters"))}`
			: `fact checks`}
					</div>
					${validate_component(ListFilter, "ListFilter").$$render(
				$$result,
				{
					label: "Filter the fact checks",
					options: categories,
					placeholder: "Search for a fact check...",
					type: "input",
					value: searchStringRaw
				},
				{
					value: $$value => {
						searchStringRaw = $$value;
						$$settled = false;
					}
				},
				{}
			)}
					${validate_component(ListFilter, "ListFilter").$$render(
				$$result,
				{
					label: "Topic",
					options: sortedTags,
					value: selectedTag
				},
				{
					value: $$value => {
						selectedTag = $$value;
						$$settled = false;
					}
				},
				{}
			)}
					
					
					
					${validate_component(ListFilter, "ListFilter").$$render(
				$$result,
				{
					label: "Fact-checker",
					options: organizations,
					value: selectedOrg
				},
				{
					value: $$value => {
						selectedOrg = $$value;
						$$settled = false;
					}
				},
				{}
			)}
				</div>
			</div>`
		: ``}

		${sections.includes("map") && sections.includes("clusters")
		? `<p style="${"margin-bottom: 3em; margin-top: 0;"}" class="${"svelte-1axubdp"}">
					We&#39;ve grouped each of these fact-checks into categories:
				</p>`
		: ``}

		${sections.includes("clusters")
		? `<div class="${"section svelte-1axubdp"}" id="${"categories"}">
				${validate_component(Clusters_topics, "Clusters").$$render(
				$$result,
				{
					data,
					isFiltered,
					filterIteration,
					filterFunction,
					filterColor,
					iteration,
					isEmbedded: sections.length < allSections.length
				},
				{},
				{}
			)}
			</div>`
		: ``}

		${sections.includes("map") && sections.includes("clusters")
		? `<p class="${"map-title svelte-1axubdp"}" style="${"margin: 3em auto -3em"}">
				We also looked at what country each fact check primarily originated in.
			</p>`
		: ``}

		${sections.includes("map")
		? `<div class="${"section svelte-1axubdp"}" id="${"countries"}">
				${validate_component(Map$1, "Map").$$render(
				$$result,
				{
					data,
					isFiltered,
					filterIteration,
					filterFunction,
					filterColor,
					iteration,
					countries,
					isEmbedded: sections.length < allSections.length
				},
				{},
				{}
			)}
			</div>`
		: ``}

		${sections.includes("timeline")
		? `${validate_component(ListTimeline, "ListTimeline").$$render(
				$$result,
				{
					data,
					filterFunction,
					iteration: filterIteration + iteration,
					color: filterColor,
					isFiltered
				},
				{},
				{}
			)}`
		: ``}

		${sections.includes("list")
		? `<div class="${"section svelte-1axubdp"}" id="${"list"}">
				${validate_component(List, "List").$$render(
				$$result,
				{
					data,
					isLoading,
					isFiltered,
					filterIteration,
					filterFunction,
					filterColor,
					iteration
				},
				{},
				{}
			)}
			</div>`
		: ``}
</main>

${sections.includes("footer")
		? `${validate_component(Footer, "Footer").$$render($$result, { organizations }, {}, {})}`
		: ``}`;
	} while (!$$settled);

	return $$rendered;
});

/* src/routes/index.svelte generated by Svelte v3.19.1 */

const css$b = {
	code: "body,button{font-family:'Poynter Gothic', sans-serif}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<script>\\n  import App from \\\"../components/App.svelte\\\";\\n</script>\\n\\n<style global src=\\\"../../static/assets/global.css\\\">:global(html),\\n:global(body) {\\n  /* background: #f4f5fa; */\\n}\\n:global(body),\\n:global(button) {\\n  font-family: 'Poynter Gothic', sans-serif;\\n  /* font-family: 'Inter', sans-serif; */\\n}\\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9yb3V0ZXMvc3JjL3JvdXRlcy9pbmRleC5zdmVsdGUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0VBRUUseUJBQXlCO0FBQzNCO0FBQ0E7O0VBRUUseUNBQXlDO0VBQ3pDLHNDQUFzQztBQUN4QyIsImZpbGUiOiJzcmMvcm91dGVzL2luZGV4LnN2ZWx0ZSIsInNvdXJjZXNDb250ZW50IjpbImh0bWwsXG5ib2R5IHtcbiAgLyogYmFja2dyb3VuZDogI2Y0ZjVmYTsgKi9cbn1cbmJvZHksXG5idXR0b24ge1xuICBmb250LWZhbWlseTogJ1BveW50ZXIgR290aGljJywgc2Fucy1zZXJpZjtcbiAgLyogZm9udC1mYW1pbHk6ICdJbnRlcicsIHNhbnMtc2VyaWY7ICovXG59Il19 */</style>\\n\\n<App />\\n\"],\"names\":[],\"mappings\":\"AAQQ,IAAI,AAAC,CACL,MAAM,AAAE,CAAC,AACf,WAAW,CAAE,gBAAgB,CAAC,CAAC,UAAU,AAE3C,CAAC\"}"
};

const Routes = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	$$result.css.add(css$b);
	return `${validate_component(App, "App").$$render($$result, {}, {}, {})}`;
});

/* src/routes/_layout.svelte generated by Svelte v3.19.1 */

const Layout = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	return `${$$slots.default ? $$slots.default({}) : ``}`;
});

/* src/routes/_error.svelte generated by Svelte v3.19.1 */

const Error$1 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { status } = $$props;
	let { error } = $$props;
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);

	return `${($$result.head += `${($$result.title = `<title>${escape(status)}</title>`, "")}`, "")}

<h1>${escape(status)}</h1>

<p>${escape(error.message)}</p>

${ ``}`;
});

// This file is generated by Sapper — do not edit it!

const manifest = {
	server_routes: [
		
	],

	pages: [
		{
			// index.svelte
			pattern: /^\/$/,
			parts: [
				{ name: "index", file: "index.svelte", component: Routes }
			]
		}
	],

	root: Layout,
	root_preload: () => {},
	error: Error$1
};

const build_dir = "__sapper__/build";

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop$1) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop$1) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop$1;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const CONTEXT_KEY = {};

/* src/node_modules/@sapper/internal/App.svelte generated by Svelte v3.19.1 */

const App$1 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { stores } = $$props;
	let { error } = $$props;
	let { status } = $$props;
	let { segments } = $$props;
	let { level0 } = $$props;
	let { level1 = null } = $$props;
	let { notify } = $$props;
	afterUpdate(notify);
	setContext(CONTEXT_KEY, stores);
	if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0) $$bindings.stores(stores);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.segments === void 0 && $$bindings.segments && segments !== void 0) $$bindings.segments(segments);
	if ($$props.level0 === void 0 && $$bindings.level0 && level0 !== void 0) $$bindings.level0(level0);
	if ($$props.level1 === void 0 && $$bindings.level1 && level1 !== void 0) $$bindings.level1(level1);
	if ($$props.notify === void 0 && $$bindings.notify && notify !== void 0) $$bindings.notify(notify);

	return `


${validate_component(Layout, "Layout").$$render($$result, Object.assign({ segment: segments[0] }, level0.props), {}, {
		default: () => `
	${error
		? `${validate_component(Error$1, "Error").$$render($$result, { error, status }, {}, {})}`
		: `${validate_component(level1.component || missing_component, "svelte:component").$$render($$result, Object.assign(level1.props), {}, {})}`}
`
	})}`;
});

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime$1() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (var i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime$1.prototype.define = function(typeMap, force) {
  for (var type in typeMap) {
    var extensions = typeMap[type].map(function(t) {return t.toLowerCase()});
    type = type.toLowerCase();

    for (var i = 0; i < extensions.length; i++) {
      var ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] == '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      var ext = extensions[0];
      this._extensions[type] = (ext[0] != '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime$1.prototype.getType = function(path) {
  path = String(path);
  var last = path.replace(/^.*[/\\]/, '').toLowerCase();
  var ext = last.replace(/^.*\./, '').toLowerCase();

  var hasPath = last.length < path.length;
  var hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime$1.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

var Mime_1$1 = Mime$1;

var standard$1 = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomsvc+xml":["atomsvc"],"application/bdoc":["bdoc"],"application/ccxml+xml":["ccxml"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma","es"],"application/emma+xml":["emma"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/patch-ops-error+xml":["xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-diff+xml":["xdf"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/ktx":["ktx"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};

var lite$1 = new Mime_1$1(standard$1);

function get_server_route_handler(routes) {
	async function handle_route(route, req, res, next) {
		req.params = route.params(route.pattern.exec(req.path));

		const method = req.method.toLowerCase();
		// 'delete' cannot be exported from a module because it is a keyword,
		// so check for 'del' instead
		const method_export = method === 'delete' ? 'del' : method;
		const handle_method = route.handlers[method_export];
		if (handle_method) {
			if (process.env.SAPPER_EXPORT) {
				const { write, end, setHeader } = res;
				const chunks = [];
				const headers = {};

				// intercept data so that it can be exported
				res.write = function(chunk) {
					chunks.push(Buffer.from(chunk));
					write.apply(res, arguments);
				};

				res.setHeader = function(name, value) {
					headers[name.toLowerCase()] = value;
					setHeader.apply(res, arguments);
				};

				res.end = function(chunk) {
					if (chunk) chunks.push(Buffer.from(chunk));
					end.apply(res, arguments);

					process.send({
						__sapper__: true,
						event: 'file',
						url: req.url,
						method: req.method,
						status: res.statusCode,
						type: headers['content-type'],
						body: Buffer.concat(chunks).toString()
					});
				};
			}

			const handle_next = (err) => {
				if (err) {
					res.statusCode = 500;
					res.end(err.message);
				} else {
					process.nextTick(next);
				}
			};

			try {
				await handle_method(req, res, handle_next);
			} catch (err) {
				console.error(err);
				handle_next(err);
			}
		} else {
			// no matching handler for method
			process.nextTick(next);
		}
	}

	return function find_route(req, res, next) {
		for (const route of routes) {
			if (route.pattern.test(req.path)) {
				handle_route(route, req, res, next);
				return;
			}
		}

		next();
	};
}

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var parse_1 = parse;
var serialize_1 = serialize;

/**
 * Module variables.
 * @private
 */

var decode = decodeURIComponent;
var encode = encodeURIComponent;
var pairSplitRegExp = /; */;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode;

  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  var value = enc(val);

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  var str = name + '=' + value;

  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;
    if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + opt.expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string'
      ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      case 'none':
        str += '; SameSite=None';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return str;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

var cookie = {
	parse: parse_1,
	serialize: serialize_1
};

var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\0': '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join('\0');
function devalue(value) {
    var counts = new Map();
    function walk(thing) {
        if (typeof thing === 'function') {
            throw new Error("Cannot stringify a function");
        }
        if (counts.has(thing)) {
            counts.set(thing, counts.get(thing) + 1);
            return;
        }
        counts.set(thing, 1);
        if (!isPrimitive(thing)) {
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                case 'Date':
                case 'RegExp':
                    return;
                case 'Array':
                    thing.forEach(walk);
                    break;
                case 'Set':
                case 'Map':
                    Array.from(thing).forEach(walk);
                    break;
                default:
                    var proto = Object.getPrototypeOf(thing);
                    if (proto !== Object.prototype &&
                        proto !== null &&
                        Object.getOwnPropertyNames(proto).sort().join('\0') !== objectProtoOwnPropertyNames) {
                        throw new Error("Cannot stringify arbitrary non-POJOs");
                    }
                    if (Object.getOwnPropertySymbols(thing).length > 0) {
                        throw new Error("Cannot stringify POJOs with symbolic keys");
                    }
                    Object.keys(thing).forEach(function (key) { return walk(thing[key]); });
            }
        }
    }
    walk(value);
    var names = new Map();
    Array.from(counts)
        .filter(function (entry) { return entry[1] > 1; })
        .sort(function (a, b) { return b[1] - a[1]; })
        .forEach(function (entry, i) {
        names.set(entry[0], getName(i));
    });
    function stringify(thing) {
        if (names.has(thing)) {
            return names.get(thing);
        }
        if (isPrimitive(thing)) {
            return stringifyPrimitive(thing);
        }
        var type = getType(thing);
        switch (type) {
            case 'Number':
            case 'String':
            case 'Boolean':
                return "Object(" + stringify(thing.valueOf()) + ")";
            case 'RegExp':
                return thing.toString();
            case 'Date':
                return "new Date(" + thing.getTime() + ")";
            case 'Array':
                var members = thing.map(function (v, i) { return i in thing ? stringify(v) : ''; });
                var tail = thing.length === 0 || (thing.length - 1 in thing) ? '' : ',';
                return "[" + members.join(',') + tail + "]";
            case 'Set':
            case 'Map':
                return "new " + type + "([" + Array.from(thing).map(stringify).join(',') + "])";
            default:
                var obj = "{" + Object.keys(thing).map(function (key) { return safeKey(key) + ":" + stringify(thing[key]); }).join(',') + "}";
                var proto = Object.getPrototypeOf(thing);
                if (proto === null) {
                    return Object.keys(thing).length > 0
                        ? "Object.assign(Object.create(null)," + obj + ")"
                        : "Object.create(null)";
                }
                return obj;
        }
    }
    var str = stringify(value);
    if (names.size) {
        var params_1 = [];
        var statements_1 = [];
        var values_1 = [];
        names.forEach(function (name, thing) {
            params_1.push(name);
            if (isPrimitive(thing)) {
                values_1.push(stringifyPrimitive(thing));
                return;
            }
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                    values_1.push("Object(" + stringify(thing.valueOf()) + ")");
                    break;
                case 'RegExp':
                    values_1.push(thing.toString());
                    break;
                case 'Date':
                    values_1.push("new Date(" + thing.getTime() + ")");
                    break;
                case 'Array':
                    values_1.push("Array(" + thing.length + ")");
                    thing.forEach(function (v, i) {
                        statements_1.push(name + "[" + i + "]=" + stringify(v));
                    });
                    break;
                case 'Set':
                    values_1.push("new Set");
                    statements_1.push(name + "." + Array.from(thing).map(function (v) { return "add(" + stringify(v) + ")"; }).join('.'));
                    break;
                case 'Map':
                    values_1.push("new Map");
                    statements_1.push(name + "." + Array.from(thing).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return "set(" + stringify(k) + ", " + stringify(v) + ")";
                    }).join('.'));
                    break;
                default:
                    values_1.push(Object.getPrototypeOf(thing) === null ? 'Object.create(null)' : '{}');
                    Object.keys(thing).forEach(function (key) {
                        statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
                    });
            }
        });
        statements_1.push("return " + str);
        return "(function(" + params_1.join(',') + "){" + statements_1.join(';') + "}(" + values_1.join(',') + "))";
    }
    else {
        return str;
    }
}
function getName(num) {
    var name = '';
    do {
        name = chars[num % chars.length] + name;
        num = ~~(num / chars.length) - 1;
    } while (num >= 0);
    return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
    return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
    if (typeof thing === 'string')
        return stringifyString(thing);
    if (thing === void 0)
        return 'void 0';
    if (thing === 0 && 1 / thing < 0)
        return '-0';
    var str = String(thing);
    if (typeof thing === 'number')
        return str.replace(/^(-)?0\./, '$1.');
    return str;
}
function getType(thing) {
    return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
    return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
    return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
    var result = '"';
    for (var i = 0; i < str.length; i += 1) {
        var char = str.charAt(i);
        var code = char.charCodeAt(0);
        if (char === '"') {
            result += '\\"';
        }
        else if (char in escaped$1) {
            result += escaped$1[char];
        }
        else if (code >= 0xd800 && code <= 0xdfff) {
            var next = str.charCodeAt(i + 1);
            // If this is the beginning of a [high, low] surrogate pair,
            // add the next two characters, otherwise escape
            if (code <= 0xdbff && (next >= 0xdc00 && next <= 0xdfff)) {
                result += char + str[++i];
            }
            else {
                result += "\\u" + code.toString(16).toUpperCase();
            }
        }
        else {
            result += char;
        }
    }
    result += '"';
    return result;
}

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find$1(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find$1(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find$1(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find$1(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find$1(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find$1(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find$1(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

function get_page_handler(
	manifest,
	session_getter
) {
	const get_build_info =  (assets => () => assets)(JSON.parse(fs.readFileSync(path.join(build_dir, 'build.json'), 'utf-8')));

	const template =  (str => () => str)(read_template(build_dir));

	const has_service_worker = fs.existsSync(path.join(build_dir, 'service-worker.js'));

	const { server_routes, pages } = manifest;
	const error_route = manifest.error;

	function bail(req, res, err) {
		console.error(err);

		const message =  'Internal server error';

		res.statusCode = 500;
		res.end(`<pre>${message}</pre>`);
	}

	function handle_error(req, res, statusCode, error) {
		handle_page({
			pattern: null,
			parts: [
				{ name: null, component: error_route }
			]
		}, req, res, statusCode, error || new Error('Unknown error in preload function'));
	}

	async function handle_page(page, req, res, status = 200, error = null) {
		const is_service_worker_index = req.path === '/service-worker-index.html';
		const build_info




 = get_build_info();

		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Cache-Control',  'max-age=600');

		// preload main.js and current route
		// TODO detect other stuff we can preload? images, CSS, fonts?
		let preloaded_chunks = Array.isArray(build_info.assets.main) ? build_info.assets.main : [build_info.assets.main];
		if (!error && !is_service_worker_index) {
			page.parts.forEach(part => {
				if (!part) return;

				// using concat because it could be a string or an array. thanks webpack!
				preloaded_chunks = preloaded_chunks.concat(build_info.assets[part.name]);
			});
		}

		if (build_info.bundler === 'rollup') {
			// TODO add dependencies and CSS
			const link = preloaded_chunks
				.filter(file => file && !file.match(/\.map$/))
				.map(file => `<${req.baseUrl}/client/${file}>;rel="modulepreload"`)
				.join(', ');

			res.setHeader('Link', link);
		} else {
			const link = preloaded_chunks
				.filter(file => file && !file.match(/\.map$/))
				.map((file) => {
					const as = /\.css$/.test(file) ? 'style' : 'script';
					return `<${req.baseUrl}/client/${file}>;rel="preload";as="${as}"`;
				})
				.join(', ');

			res.setHeader('Link', link);
		}

		let session;
		try {
			session = await session_getter(req, res);
		} catch (err) {
			return bail(req, res, err);
		}

		let redirect;
		let preload_error;

		const preload_context = {
			redirect: (statusCode, location) => {
				if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
					throw new Error(`Conflicting redirects`);
				}
				location = location.replace(/^\//g, ''); // leading slash (only)
				redirect = { statusCode, location };
			},
			error: (statusCode, message) => {
				preload_error = { statusCode, message };
			},
			fetch: (url, opts) => {
				const parsed = new Url.URL(url, `http://127.0.0.1:${process.env.PORT}${req.baseUrl ? req.baseUrl + '/' :''}`);

				opts = Object.assign({}, opts);

				const include_credentials = (
					opts.credentials === 'include' ||
					opts.credentials !== 'omit' && parsed.origin === `http://127.0.0.1:${process.env.PORT}`
				);

				if (include_credentials) {
					opts.headers = Object.assign({}, opts.headers);

					const cookies = Object.assign(
						{},
						cookie.parse(req.headers.cookie || ''),
						cookie.parse(opts.headers.cookie || '')
					);

					const set_cookie = res.getHeader('Set-Cookie');
					(Array.isArray(set_cookie) ? set_cookie : [set_cookie]).forEach(str => {
						const match = /([^=]+)=([^;]+)/.exec(str);
						if (match) cookies[match[1]] = match[2];
					});

					const str = Object.keys(cookies)
						.map(key => `${key}=${cookies[key]}`)
						.join('; ');

					opts.headers.cookie = str;

					if (!opts.headers.authorization && req.headers.authorization) {
						opts.headers.authorization = req.headers.authorization;
					}
				}

				return fetch(parsed.href, opts);
			}
		};

		let preloaded;
		let match;
		let params;

		try {
			const root_preloaded = manifest.root_preload
				? manifest.root_preload.call(preload_context, {
					host: req.headers.host,
					path: req.path,
					query: req.query,
					params: {}
				}, session)
				: {};

			match = error ? null : page.pattern.exec(req.path);


			let toPreload = [root_preloaded];
			if (!is_service_worker_index) {
				toPreload = toPreload.concat(page.parts.map(part => {
					if (!part) return null;

					// the deepest level is used below, to initialise the store
					params = part.params ? part.params(match) : {};

					return part.preload
						? part.preload.call(preload_context, {
							host: req.headers.host,
							path: req.path,
							query: req.query,
							params
						}, session)
						: {};
				}));
			}

			preloaded = await Promise.all(toPreload);
		} catch (err) {
			if (error) {
				return bail(req, res, err)
			}

			preload_error = { statusCode: 500, message: err };
			preloaded = []; // appease TypeScript
		}

		try {
			if (redirect) {
				const location = Url.resolve((req.baseUrl || '') + '/', redirect.location);

				res.statusCode = redirect.statusCode;
				res.setHeader('Location', location);
				res.end();

				return;
			}

			if (preload_error) {
				handle_error(req, res, preload_error.statusCode, preload_error.message);
				return;
			}

			const segments = req.path.split('/').filter(Boolean);

			// TODO make this less confusing
			const layout_segments = [segments[0]];
			let l = 1;

			page.parts.forEach((part, i) => {
				layout_segments[l] = segments[i + 1];
				if (!part) return null;
				l++;
			});

			const props = {
				stores: {
					page: {
						subscribe: writable({
							host: req.headers.host,
							path: req.path,
							query: req.query,
							params
						}).subscribe
					},
					preloading: {
						subscribe: writable(null).subscribe
					},
					session: writable(session)
				},
				segments: layout_segments,
				status: error ? status : 200,
				error: error ? error instanceof Error ? error : { message: error } : null,
				level0: {
					props: preloaded[0]
				},
				level1: {
					segment: segments[0],
					props: {}
				}
			};

			if (!is_service_worker_index) {
				let l = 1;
				for (let i = 0; i < page.parts.length; i += 1) {
					const part = page.parts[i];
					if (!part) continue;

					props[`level${l++}`] = {
						component: part.component,
						props: preloaded[i + 1] || {},
						segment: segments[i]
					};
				}
			}

			const { html, head, css } = App$1.render(props);

			const serialized = {
				preloaded: `[${preloaded.map(data => try_serialize(data)).join(',')}]`,
				session: session && try_serialize(session, err => {
					throw new Error(`Failed to serialize session data: ${err.message}`);
				}),
				error: error && serialize_error(props.error)
			};

			let script = `__SAPPER__={${[
				error && `error:${serialized.error},status:${status}`,
				`baseUrl:"${req.baseUrl}"`,
				serialized.preloaded && `preloaded:${serialized.preloaded}`,
				serialized.session && `session:${serialized.session}`
			].filter(Boolean).join(',')}};`;

			if (has_service_worker) {
				script += `if('serviceWorker' in navigator)navigator.serviceWorker.register('${req.baseUrl}/service-worker.js');`;
			}

			const file = [].concat(build_info.assets.main).filter(file => file && /\.js$/.test(file))[0];
			const main = `${req.baseUrl}/client/${file}`;

			if (build_info.bundler === 'rollup') {
				if (build_info.legacy_assets) {
					const legacy_main = `${req.baseUrl}/client/legacy/${build_info.legacy_assets.main}`;
					script += `(function(){try{eval("async function x(){}");var main="${main}"}catch(e){main="${legacy_main}"};var s=document.createElement("script");try{new Function("if(0)import('')")();s.src=main;s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main",main);}document.head.appendChild(s);}());`;
				} else {
					script += `var s=document.createElement("script");try{new Function("if(0)import('')")();s.src="${main}";s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main","${main}")}document.head.appendChild(s)`;
				}
			} else {
				script += `</script><script src="${main}">`;
			}

			let styles;

			// TODO make this consistent across apps
			// TODO embed build_info in placeholder.ts
			if (build_info.css && build_info.css.main) {
				const css_chunks = new Set();
				if (build_info.css.main) css_chunks.add(build_info.css.main);
				page.parts.forEach(part => {
					if (!part) return;
					const css_chunks_for_part = build_info.css.chunks[part.file];

					if (css_chunks_for_part) {
						css_chunks_for_part.forEach(file => {
							css_chunks.add(file);
						});
					}
				});

				styles = Array.from(css_chunks)
					.map(href => `<link rel="stylesheet" href="client/${href}">`)
					.join('');
			} else {
				styles = (css && css.code ? `<style>${css.code}</style>` : '');
			}

			// users can set a CSP nonce using res.locals.nonce
			const nonce_attr = (res.locals && res.locals.nonce) ? ` nonce="${res.locals.nonce}"` : '';

			const body = template()
				.replace('%sapper.base%', () => `<base href="${req.baseUrl}/">`)
				.replace('%sapper.scripts%', () => `<script${nonce_attr}>${script}</script>`)
				.replace('%sapper.html%', () => html)
				.replace('%sapper.head%', () => `<noscript id='sapper-head-start'></noscript>${head}<noscript id='sapper-head-end'></noscript>`)
				.replace('%sapper.styles%', () => styles);

			res.statusCode = status;
			res.end(body);
		} catch(err) {
			if (error) {
				bail(req, res, err);
			} else {
				handle_error(req, res, 500, err);
			}
		}
	}

	return function find_route(req, res, next) {
		if (req.path === '/service-worker-index.html') {
			const homePage = pages.find(page => page.pattern.test('/'));
			handle_page(homePage, req, res);
			return;
		}

		for (const page of pages) {
			if (page.pattern.test(req.path)) {
				handle_page(page, req, res);
				return;
			}
		}

		handle_error(req, res, 404, 'Not found');
	};
}

function read_template(dir = build_dir) {
	return fs.readFileSync(`${dir}/template.html`, 'utf-8');
}

function try_serialize(data, fail) {
	try {
		return devalue(data);
	} catch (err) {
		if (fail) fail(err);
		return null;
	}
}

// Ensure we return something truthy so the client will not re-render the page over the error
function serialize_error(error) {
	if (!error) return null;
	let serialized = try_serialize(error);
	if (!serialized) {
		const { name, message, stack } = error ;
		serialized = try_serialize({ name, message, stack });
	}
	if (!serialized) {
		serialized = '{}';
	}
	return serialized;
}

function middleware(opts


 = {}) {
	const { session, ignore } = opts;

	let emitted_basepath = false;

	return compose_handlers(ignore, [
		(req, res, next) => {
			if (req.baseUrl === undefined) {
				let { originalUrl } = req;
				if (req.url === '/' && originalUrl[originalUrl.length - 1] !== '/') {
					originalUrl += '/';
				}

				req.baseUrl = originalUrl
					? originalUrl.slice(0, -req.url.length)
					: '';
			}

			if (!emitted_basepath && process.send) {
				process.send({
					__sapper__: true,
					event: 'basepath',
					basepath: req.baseUrl
				});

				emitted_basepath = true;
			}

			if (req.path === undefined) {
				req.path = req.url.replace(/\?.*/, '');
			}

			next();
		},

		fs.existsSync(path.join(build_dir, 'service-worker.js')) && serve({
			pathname: '/service-worker.js',
			cache_control: 'no-cache, no-store, must-revalidate'
		}),

		fs.existsSync(path.join(build_dir, 'service-worker.js.map')) && serve({
			pathname: '/service-worker.js.map',
			cache_control: 'no-cache, no-store, must-revalidate'
		}),

		serve({
			prefix: '/client/',
			cache_control:  'max-age=31536000, immutable'
		}),

		get_server_route_handler(manifest.server_routes),

		get_page_handler(manifest, session || noop$2)
	].filter(Boolean));
}

function compose_handlers(ignore, handlers) {
	const total = handlers.length;

	function nth_handler(n, req, res, next) {
		if (n >= total) {
			return next();
		}

		handlers[n](req, res, () => nth_handler(n+1, req, res, next));
	}

	return !ignore
		? (req, res, next) => nth_handler(0, req, res, next)
		: (req, res, next) => {
			if (should_ignore(req.path, ignore)) {
				next();
			} else {
				nth_handler(0, req, res, next);
			}
		};
}

function should_ignore(uri, val) {
	if (Array.isArray(val)) return val.some(x => should_ignore(uri, x));
	if (val instanceof RegExp) return val.test(uri);
	if (typeof val === 'function') return val(uri);
	return uri.startsWith(val.charCodeAt(0) === 47 ? val : `/${val}`);
}

function serve({ prefix, pathname, cache_control }



) {
	const filter = pathname
		? (req) => req.path === pathname
		: (req) => req.path.startsWith(prefix);

	const cache = new Map();

	const read =  (file) => (cache.has(file) ? cache : cache.set(file, fs.readFileSync(path.join(build_dir, file)))).get(file);

	return (req, res, next) => {
		if (filter(req)) {
			const type = lite$1.getType(req.path);

			try {
				const file = path.posix.normalize(decodeURIComponent(req.path));
				const data = read(file);

				res.setHeader('Content-Type', type);
				res.setHeader('Cache-Control', cache_control);
				res.end(data);
			} catch (err) {
				res.statusCode = 404;
				res.end('not found');
			}
		} else {
			next();
		}
	};
}

function noop$2(){}

const { PORT, NODE_ENV, BASEPATH } = process.env;
const dev = NODE_ENV === "development";
const basepath = BASEPATH || "/";
polka()
  .use(
    basepath,
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    middleware()
  )
  .listen(PORT, err => {
    if (err) console.log("error", err);
  });
