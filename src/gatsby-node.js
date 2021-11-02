const faker = require('faker');

const TYPE_SEPARATOR = ':';

const mapSchema = (schema, index) => {
  const item = {};

  Object.keys(schema).map((schemaKey) => {
    const schemaItem = schema[schemaKey];
    const name = schemaKey.split(TYPE_SEPARATOR)[0];

    if (typeof schemaItem === 'string') {
      item[name] = faker.fake(schemaItem);
    } else if (typeof schemaItem === 'object') {
      item[name] = mapSchema(schemaItem);
    } else if (typeof schemaItem === 'function') {
      item[name] = schemaItem.bind(null, faker, index)();
    } else {
      item[name] = schemaItem;
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

exports.createSchemaCustomization = (
  { actions: { createTypes } },
  { schema, type = 'Mock' },
) => {
  if (Object.keys(schema).some((key) => key.includes(TYPE_SEPARATOR))) {
    const types = Object.keys(schema).map((schemaKey) => {
      let schemaKeyType = 'String';
      let name = schemaKey;

      if (schemaKey.includes(TYPE_SEPARATOR)) {
        [name, schemaKeyType] = schemaKey.split(TYPE_SEPARATOR);
      }

      return `${name}: ${schemaKeyType}`;
    });

    createTypes(`
type ${type} implements Node {
  id: ID!
  ${types.join('\n\t')}
}
    `);
  }
};
