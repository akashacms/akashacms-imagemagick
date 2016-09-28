
Allows you to do this:

```
config.plugin('akashacms-imagemagick')
    .addImageRenderer(".jpg.jp2",  /^(.*\.jpg)\.(jp2)$/, 'path/to/img', {
        format: "JPEG",
        width: 1500
    });
```

Which causes all ".jpg.jp2" files in a given directory to be converted to ".jpg" at a width of 1500 pixels.
