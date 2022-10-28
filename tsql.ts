namespace TSQL {

    type PartialBase<TRequest, TEntity> = Partial<{
        [TProperty in keyof TEntity]:
        TEntity[TProperty] extends object
        ? TProperty extends keyof TRequest
        ? TRequest[TProperty]
        : never
        : string
    }>

    type SwapKeyWithValue<TRequest extends PartialBase<TRequest, TEntity>, TEntity, TProperty extends keyof TRequest> =
        TProperty extends keyof TEntity ?
        TRequest[TProperty] extends string | number
        ? TRequest[TProperty]
        : TRequest[TProperty] extends object
        ? TProperty
        : never
        : never

    type EntityProperty<TRequest, TEntity, TProperty extends keyof TRequest> =
        TProperty extends keyof TEntity
        ? TRequest[TProperty] extends object
        ? FilterResponse<TRequest[TProperty], TEntity[TProperty]>
        : TEntity[TProperty]
        : never

    type FilterResponse<TRequest extends PartialBase<TRequest, TEntity>, TEntity> = {
        [TProperty in keyof TRequest as SwapKeyWithValue<TRequest, TEntity, TProperty>]:
        EntityProperty<TRequest, TEntity, TProperty>
    }

    type FieldCondition<TEntity> =
        | { readonly where: Condition<TEntity> }
        | {
            [TP in keyof TEntity]?:
            | { readonly eq: TEntity[TP] }
            | { readonly gt: TEntity[TP] extends number ? TEntity[TP] : never }
            | { readonly lt: TEntity[TP] extends number ? TEntity[TP] : never }
        }

    type Condition<TEntity> =
        | [FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>]
        | [FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>]
        | [FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>]

    type Order<TEntity> = {
        [TP in keyof TEntity]?: 'asc' | 'desc'
    }

    interface IFilterRequest<TSelection extends PartialBase<TSelection, TEntity>, TEntity> {
        readonly select?: TSelection
        readonly where?: Condition<TEntity>
        readonly order?: Order<TEntity>
        readonly limit?: number
        readonly offset?: number
    }

    type Result<TSelection extends PartialBase<TSelection, TEntity>, TEntity> =
        | { kind: 'success', value: Array<FilterResponse<TSelection, TEntity>> }
        | { kind: 'error', value: Error }

    export interface IFilter<TEntity> {
        <TSelection extends PartialBase<TSelection, TEntity>>(req: IFilterRequest<TSelection, TEntity>): Result<TSelection, TEntity>
    }

}

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
    readonly filter: TSQL.IFilter<IFruitBasket>
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
