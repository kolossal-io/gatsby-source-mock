const faker = require('faker');

const mapSchema = (schema, index) => {
  const item = {};

  Object.keys(schema).map((schemaKey) => {
    const schemaItem = schema[schemaKey];

    if (typeof schemaItem === 'string') {
      item[schemaKey] = faker.fake(schemaItem);
    } else if (typeof schemaItem === 'object') {
      item[schemaKey] = mapSchema(schemaItem);
    } else if (typeof schemaItem === 'function') {
      item[schemaKey] = schemaItem.bind(null, faker, index)();
    } else {
      item[schemaKey] = schemaItem;
    }
  });

  return item;
};

exports.sourceNodes = (
  { actions: { createNode }, createNodeId, createContentDigest },
  { schema, count, type, seed, locale },
) => {
  if (seed) {
    faker.seed(seed);
  }

  if (locale) {
    faker.locale = locale;
  }

  for (let i = 0; i < count; i++) {
    const item = mapSchema(schema, i);

    const nodeBase = {
      id: createNodeId(JSON.stringify(faker.datatype.number())),
      parent: null,
      children: [],
      internal: {
        type,
        contentDigest: createContentDigest(item),
      },
    };

    createNode(Object.assign({}, nodeBase, item));
  }
};
