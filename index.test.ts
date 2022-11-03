import { tsql } from 'tsql';

enum AOrB {
    A = "a",
    B = "b"
}

interface IFruitBasket {
    readonly apple: string
    readonly grape: number
    readonly passionfruit: "a" | "b"
    readonly date: Date
    readonly child: {
        readonly orange: boolean
        readonly grandChild: {
            readonly pear: AOrB
        }
    }
}

interface IFruitBasketAccess {
    readonly filter: tsql.IFilter<IFruitBasket>
}

declare const fba: IFruitBasketAccess;

const result = fba.filter({
    select: <const>{
        apple: "apple",
        grape: "grape",
        passionfruit: "maracuja",
        date: "date",
        child: {
            orange: "orange",
            grandChild: {
                pear: "pear"
            }
        },
    },
    where: [
        { apple: { eq: 'hello' } },
        'and',
        { grape: { gt: 32 } },
        'or',
        {
            where: [
                { apple: { eq: 'goodbye' } },
                'and',
                { grape: { lt: 33 } }
            ]
        }
    ],
    order: {
        apple: 'desc',
        grape: 'asc'
    },
    limit: 10,
    offset: 0
});

if (result.kind == 'success') {
    const re /*: "a" | "b" */ = result.value[0].maracuja
    const gc /*: AOrB */ = result.value[1].child.grandChild.pear
}
