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

## Options

| Option    | Description                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `schema`  | The object describing the schema                                                                                            |
| `count`   | The number of fake items being generated                                                                                    |
| `type`    | Name of the graphql query node                                                                                              |
| `seed`    | You may specify a [randomness seed](https://github.com/marak/Faker.js/#setting-a-randomness-seed) to get consistent results |
| `locale`  | You may specify a [locale for fakes](https://github.com/marak/Faker.js/#localization) (defaults to `en`)                    |

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
