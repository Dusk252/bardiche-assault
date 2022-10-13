const Ajv = require('ajv');
const ajv = new Ajv();

module.exports = (schema, data, customKeywords) => {
    if (customKeywords && Array.isArray(customKeywords)) {
        for (const o of customKeywords)
            ajv.addKeyword(o);
    }
    const validate = ajv.compile(schema);
    return validate(data);
};