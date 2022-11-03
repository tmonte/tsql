declare module "tsql" {
    export namespace tsql {

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
}