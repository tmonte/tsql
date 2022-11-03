# tsql
simple typesafe json query language

## install

`npm install --save-dev git+https://github.com/tmonte/tsql.git`

## usage example

Interfaces

```typescript

// Define the model
interface IFruitBasket {
    readonly apple: string
    readonly grape: number
    readonly passionfruit: "a" | "b"
    readonly box: {
        readonly orange: boolean
    }
}

// Define the operation
interface IFruitBasketService {
    readonly filter: tsql.IFilter<IFruitBasket>
}

```

Implementation
```typescript

declare const fbs: IFruitBasketService; // = new FruitBasketService();

const result = fbs.filter({
    select: <const>{ // this const assertion is required
        apple: "apple",
        grape: "grape",
        passionfruit: "delicious",
        box: {
            orange: "orange"
        },
    },
    where: [
        { apple: { eq: 'hello' } },
        'and',
        { grape: { gt: 32 } }
    ],
    order: {
        apple: 'desc',
        grape: 'asc'
    },
    limit: 10,
    offset: 0
});

if (result.kind == 'success') {
    const { delicious } = result.value[0];
    const { orange } = result.value[1].box;
    // ...
}

```
