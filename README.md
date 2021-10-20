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

You may pass a callback function which will receive an instance of [Faker](https://github.com/marak/Faker.js/) which may be useful for more complex situations:

```js
{
  options: {
    schema: {
      emojiAndWord: (faker) => {
        const emojis = ['🤖', '✌️', '🎮', '✊', '🙃'];
        const randomEmoji = emojis[
          Math.floor(Math.random() * emojis.length)
        ];

        return `${randomEmoji} ${faker.lorem.word()}`;
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
        company
        name
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
            "id": "6044e264-625a-5a26-916b-2f2e7597c47e",
            "balance": 448.62,
            "company": "Thyssen, Grasse and Restorff",
            "name": "Filip Laurén"
          }
        },
        {
          "node": {
            "id": "375600fa-36dd-57cd-9cb8-0be29f5450a3",
            "balance": 169.935,
            "company": "Neurohr - Koester",
            "name": "Norman Vieweg"
          }
        }
      ]
    }
  },
  "extensions": {}
}
```
