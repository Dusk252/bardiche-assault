const Ajv = require('ajv');
const ajv = new Ajv();

module.exports = (schema, data) => {
    const validate = ajv.compile(schema);
    return validate(data);
};