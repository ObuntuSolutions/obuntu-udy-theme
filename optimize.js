const sharp = require('sharp');
    const glob = require('glob');
    
    function convertImages() {
        return new Promise(yay => {
          glob('static/images/*.{png,jpeg,jpg}', {}, async function(er, files) {
            for (let file of files) {
              await sharp(file).toFile(file + '.webp');
            }
            yay();
          });
        });
      }
    
    (async() => {
        await convertImages();
    })();