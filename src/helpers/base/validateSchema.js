const Ajv = require('ajv');

module.exports = (schema, data, customKeywords) => {
    const ajv = new Ajv();
    if (customKeywords && Array.isArray(customKeywords)) {
        for (const o of customKeywords)
            ajv.addKeyword(o);
    }
    const validate = ajv.compile(schema);
    return validate(data);
};