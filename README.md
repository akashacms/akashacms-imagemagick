
Allows you to do this:

```
config.plugin('akashacms-imagemagick')
    .addImageRenderer(".jpg.jp2",  /^(.*\.jpg)\.(jp2)$/, 'path/to/img', {
        format: "JPEG",
        width: 1500
    });
```

Which causes all ".jpg.jp2" files in a given directory to be converted to ".jpg" at a width of 1500 pixels.

A faster alternative to ImageMagick is http://sharp.dimens.io/en/stable/ -- this has similar functionality, primarily focusing on image resize, while claiming to be hugely faster.  The primary use-case is image resize.
