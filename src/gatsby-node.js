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

const createNodeForItem = (
  { actions: { createNode }, createNodeId, createContentDigest },
  type,
  item,
) => {
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
};

exports.sourceNodes = (
  actions,
  { schema, count, type = 'Mock', seed, locale },
) => {
  if (seed) {
    faker.seed(seed);
  }

  if (locale) {
    faker.locale = locale;
  }

  if (Array.isArray(schema)) {
    for (let i = 0; i < count ?? schema.length; i++) {
      createNodeForItem(actions, type, mapSchema(schema[i % schema.length], i));
    }

    return;
  }

  for (let i = 0; i < count ?? 10; i++) {
    createNodeForItem(actions, type, mapSchema(schema, i));
  }
};
