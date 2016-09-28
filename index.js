
'use strict';

const fs          = require('fs');
const path        = require('path');
const util        = require('util');
const akasha      = require('akasharender');
const mahabhuta   = require('mahabhuta');
const imagemagick = require('imagemagick-native');

const log   = require('debug')('akashacms-imagemagick:main');
const error = require('debug')('akashacms-imagemagick:main');


class ImageMagickRenderer extends akasha.Renderer {
    constructor(name, regex) {
        super(name, regex);
    }

    setPath(path) { this._path = path; }
    get path() { return this._path; }

    setOptions(options) { this._options = options; }
    get options() { return this._options; }

    match(fname) {
        if (!fname.startsWith(this.path)) return false;
        var ret = super.match(fname);
        // console.log(`ImageMagickRenderer match ${fname} ${util.inspect(this._regex)} ${ret}`);
        return ret;
    }

    renderSync(text, metadata) {
        throw new Error("Cannot render images in synchronous environment");
    }

    renderToFile(basedir, fpath, renderTo, renderToPlus, metadata, config) {
        return doImageConversion(basedir, fpath, renderTo, this.filePath(fpath), this.options);
    }
}

module.exports = class ImageMagickPlugin extends akasha.Plugin {
	constructor() {
		super("akashacms-imagemagick");
	}

	configure(config) {
		this._config = config;
    }

    addImageRenderer(name, regex, path, options) {
        var r = new ImageMagickRenderer(name, regex);
        r.setPath(path);
        r.setOptions(options);
        akasha.registerRenderer(r);
    }
}

function doImageConversion(basedir, fpath, renderTo, renderfpath, renderOptions) {
    return new Promise((resolve, reject) => {
        var dirs = {
            srcpath: path.join(basedir, fpath),
            destpath: path.join(renderTo, renderfpath)
        };
        fs.readFile(dirs.srcpath, (err, data) => {
            if (err) reject(err);
            else {
                dirs.data = data;
                resolve(dirs);
            }
        })
    })
    .then(dirs => {
        return new Promise((resolve, reject) => {
            var opts = {};
            for (let key in renderOptions) {
                opts[key] = renderOptions[key];
            }
            opts.srcData = dirs.data;
            imagemagick.convert(opts,
            (err, result) => {
                if (err) reject(err);
                else {
                    dirs.result = result;
                    resolve(dirs);
                }
            });
        });
    })
    .then(dirs => {
        return new Promise((resolve, reject) => {
            fs.writeFile(dirs.destpath, dirs.result, err => {
                if (err) reject(err);
                else resolve();
            });
        })
    });
}

/*

THE FOLLOWING IS A POSSIBILITY ... the idea is a tag <image-convert> to specify
image conversions.  There would be a directory sitting next to documents containing
images that can be converted.  The parameters of this tag would describe the conversions.

module.exports.mahabhuta = new mahabhuta.MahafuncArray("akasharender built-in", {});

class ImageConverter extends mahabhuta.CustomElement {
	get elementName() { return "image-convert"; }
	process($element, metadata, dirty) {
		return akasha.partial(metadata.config, "ak_teaser.html.ejs", {
			teaser: typeof metadata["ak-teaser"] !== "undefined"
				? metadata["ak-teaser"] : metadata.teaser
		})
		.then(html => { dirty(); return html; });
	}
}
module.exports.mahabhuta.addMahafunc(new ImageConverter()); */

// TODO:
//   Function to configure the plugin
//   Support for options on convert operation
//   Specify matchers
//   ImageMagickRenderer as a base class from Renderer
//   Support .jpg.png .jpg.jp2

/* Something like this to become a Renderer object
{
    path: /regex of path/,
    extension: /regex of extension/,
    conversions: {
        parameters for conversion
    }
}

Renderer.match recieves the entire path name, so... /\/book\/foo\/.*\.jpg\.jp2$/ would apply to JP2->JPG conversion in the named directory

Or else <image-convert src="/path/to/source/image.jp2" blur="23" quality="100" output="image.jpeg"/>
The src would look in a directory outside the documents tree */
