const filteredCollection = require('./filteredCollection');
const htmlmin = require("html-minifier");

const {format} = require('date-fns');
      
module.exports = function(eleventyConfig, references) {

  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if( outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  eleventyConfig.addLiquidShortcode("seo", function(seo) { 
    let seoString = '';
    for (let key in seo) {
      switch(key) {
        case 'title':
          seoString += `<title>${seo.title}</title><meta property="og:title" content="${seo.title}" />`;
          break;
        case 'description':
          seoString += `<meta name="description" content="${seo.description}">`;
          break;
        default: {
          if (key == 'additional_tags') {
            seoString += seo.additional_tags;
          } else if (key.startsWith('og:')) {
            seoString += `<meta property="${key}" content="${seo[key]}">`;
          } else {
            seoString += `<meta name="${key}" content="${seo[key]}">`;
          }
          break;
        }  
      }
    }

    return seoString;
  });

  eleventyConfig.addLiquidFilter('json', function(value) {
    return JSON.stringify(value);
  });

  eleventyConfig.addLiquidFilter('filterBy', function(array, toFilter, field) {
    if (!Array.isArray(toFilter)) {
      toFilter = [toFilter];
    }
    if (!array) {
      return [];
    }
    return array.filter(item => {
      if (field in item) {
        let value = item[field];
        if (!Array.isArray(value)) {
          value = [value];
        }
        for (let f of toFilter) {
          if (value.includes(f)) {
            return true;
          }
        }
        return false;
      } else {
        return false;
      }
    });
  });

  eleventyConfig.addLiquidFilter('where', function(array, field, toFilter) {
    if (!Array.isArray(toFilter)) {
      toFilter = [toFilter];
    }
    if (!array) {
      return [];
    }
    return array.filter(item => {
      if (field in item.data) {
        let value = item.data[field];
        if (!Array.isArray(value)) {
          value = [value];
        }
        for (let f of toFilter) {
          if (value.includes(f)) {
            return true;
          }
        }
        return false;
      } else {
        return false;
      }
    });
  });

  eleventyConfig.addLiquidFilter('formatDate', function(date, formatString = "yyyy-MM-dd") {
    try {
      const d = new Date(date);
      return format(d, formatString);
    } catch (error) {
      const d = new Date(date);
      return format(d, "yyyy-MM-dd");
    }
  });

  eleventyConfig.addLiquidFilter('limit', function(array, limit, offset) {
    if (!array) {
      return [];
    }
    if (!offset || isNaN(offset)) {
      offset = 0;
    }
    
    return array.slice(offset, limit);
    
  });

  for (let ref in references) {
    eleventyConfig.addCollection(ref, function(collection) {
      const [from, to] = ref.split('**');
      field = references[ref].field;
      return filteredCollection(collection, from, field, references[ref].limit);
    });
  }

  eleventyConfig.addCollection('filtered', function(collection) {
    const filtereds = {};

    for (let ref in references) {
      const [from, to] = ref.split('**');
      field = references[ref].field;

      filtereds[ref] = {};

      const allRefs = {};

      const items = collection.getFilteredByTag(from);

      for (let item of items) {
        if (field in item.data) {
          const val = item.data[field];
          if (!allRefs[val]) {
            const allItems = collection
              .getFilteredByTag(from)
              .filter(item => item.data[field] && item.data[field].includes(val));
            allRefs[val] = allItems;
          }
        }
      }
      filtereds[ref] = allRefs;
    }

    return filtereds;
  });
};
