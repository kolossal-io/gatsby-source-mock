# gatsby-source-mock

This plugin allows you to mock GraphQL data in Gatsby sites using [Faker.js](https://github.com/marak/Faker.js/) or custom callback functions. This is especially useful for mocking datasets that are still under development and can be hooked in later.

This plugin is based on the official [gatsby-source-faker](https://www.gatsbyjs.com/plugins/gatsby-source-faker/) plugin.

## Install

```bash
npm install --save gatsby-source-mock
```

or

```bash
yarn add gatsby-source-mock
```

## How to use

Define the schema in `gatsby-config.js`. See a full list of options [here](#options).

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-mock`,
      options: {
        schema: {
          name: `{{name.firstName}} {{name.lastName}}`,
          company: `{{company.companyName}}`,
          balance: (faker) => faker.finance.amount() / 2,
          features: {
            accountType: (faker) =>
              faker.random.arrayElement(['Free', 'Premium']),
            creditCard: {
              isValid: (faker) => faker.datatype.boolean(),
              number: `{{finance.creditCardNumber}}`,
            },
            account: {
              iban: `{{finance.iban}}`,
              bic: `{{finance.bic}}`,
            },
          },
        },
        count: 10,
        type: `BankAccount`,
        seed: 123456,
        locale: `de`,
      },
    },
  ],
};
```

### Faker.fake()

All strings will be parsed with [Faker.fake()](https://github.com/marak/Faker.js/#fakerfake), so you may use a mustache string format to use Faker.js methods:

```js
{
  options: {
    schema: {
      fullName: '{{name.firstName}} {{name.lastName}}',
      ...
    },
  }
}
```

### Callback

You may pass a callback function which will receive an instance of [Faker](https://github.com/marak/Faker.js/). This can be useful for more complex situations:

```js
{
  options: {
    schema: {
      emoji: (faker) => {
        return faker.random.arrayElement(
          ['🤖', '✌️', '🎮', '✊', '🙃']
        );
      },
      ...
    },
  }
}
```

The callback function will also receive the index of the current run as a second argument:

```js
{
  options: {
    schema: {
      counter: (faker, index) => {
        return `Number ${index + 1}`;
      },
      ...
    },
  }
}
```

## Defining data types

You can explicitely define data types by providing schema keys as `<name>:<type>`:

```js
{
  options: {
    schema: {
      'title:String!': '{{lorem.sentence}}',
      'publishedAt:Date!': faker => faker.date.past(),
      'likes:Number': faker => faker.datatype.number(),
      subline: '{{lorem.sentence}}',
    },
  }
}
```

This would result in a schema definition like this:

```graphql
id: ID!
title: String!
publishedAt(
  difference: String
  formatString: String
  fromNow: Boolean
  locale: String
): Date
likes: Number
subline: String
```

## Passing a dataset

You may define a dataset explicitely by passing an array to `schema`. You can still use `Faker.js` interpolation and callback functions:

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-mock`,
      options: {
        schema: [
          {
            name: `Fred {{name.lastName}}`,
            about: (faker) => faker.lorem.paragraphs(3),
          },
          {
            name: `Hermine {{name.lastName}}`,
            about: (faker) => faker.lorem.paragraph(),
          },
          {
            name: `{{name.firstName}} Bowie`,
            about: (faker) => faker.lorem.paragraphs(2),
          },
        ],
        type: `User`,
      },
    },
  ],
};
```

You can also define a dataset _and_ the `count` parameter to generate multiple nodes of the given dataset.

This example will create three nodes named `Harry` and two nodes named `Hermine` each with a random last name:

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-mock`,
      options: {
        schema: [
          {
            name: `Harry {{name.lastName}}`,
          },
          {
            name: `Hermine {{name.lastName}}`,
          },
        ],
        type: `Hogwarts`,
        count: 5,
      },
    },
  ],
};
```

## Options

| Option    | Description                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `schema`  | The object describing the schema                                                                                            |
| `count`   | The number of fake items being generated, defaults to `10`                                                                  |
| `type`    | Name of the graphql query node                                                                                              |
| `seed`    | You may specify a [randomness seed](https://github.com/marak/Faker.js/#setting-a-randomness-seed) to get consistent results |
| `locale`  | You may specify a [locale for fakes](https://github.com/marak/Faker.js/#localization), defaults to `en`                     |

## Query mock data

The GraphQL query will match the specified schema, for [the example above](#how-to-use) it could look like this:

```graphql
query {
  allBankAccount(limit: 2) {
    edges {
      node {
        id
        balance
        id
        name
        company
        features {
          account {
            bic
            iban
          }
          creditCard {
            number
            isValid
          }
        }
      }
    }
  }
}
```

The result for this example may look something like this:

```json
{
  "data": {
    "allBankAccount": {
      "edges": [
        {
          "node": {
            "balance": 448.62,
            "id": "155df202-6533-5eea-a2b7-fbb4e796bdab",
            "name": "Filip Laurén",
            "company": "Thyssen, Grasse and Restorff",
            "features": {
              "account": {
                "bic": "SGHEAFZ1",
                "iban": "BG79YWJV02007108V69521"
              },
              "creditCard": {
                "number": "6384-3821-1503-3495",
                "isValid": false
              }
            }
          }
        },
        {
          "node": {
            "balance": 112.395,
            "id": "3c523dc7-4771-557b-aa0b-f0b5124dd78b",
            "name": "Rike Weller",
            "company": "Breitenstein OHG",
            "features": {
              "account": {
                "bic": "CVCUAZT1",
                "iban": "MK64263157663695906"
              },
              "creditCard": {
                "number": "5434-1536-6521-4284",
                "isValid": false
              }
            }
          }
        }
      ]
    }
  },
  "extensions": {}
}
```
