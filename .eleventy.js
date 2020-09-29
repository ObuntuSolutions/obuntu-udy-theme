
      const filters = require('./_utils/filters.js');
      
      module.exports = function(eleventyConfig) {

        const references = JSON.parse('{"client-projects**is-this-featured":{"field":"is-this-featured","limit":4},"team-members**client-projects":{"field":"client-projects","limit":6}}');

        filters(eleventyConfig, references);

        eleventyConfig.addPassthroughCopy("static/**");
        eleventyConfig.addPassthroughCopy("admin/**");
        
        return {
          dir: {
            input: "site",
            includes: "_views",
            output: "public"
          }
        };
      };