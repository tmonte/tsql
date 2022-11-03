declare module "tsql" {
    export namespace tsql {

        type Selection<TSelection, TEntity> = Partial<{
            [TProperty in keyof TEntity]:
            TEntity[TProperty] extends object
            ? TProperty extends keyof TSelection
            ? TSelection[TProperty]
            : never
            : string
        }>

        type SelectionValue<TSelection extends Selection<TSelection, TEntity>, TEntity, TProperty extends keyof TSelection> =
            TProperty extends keyof TEntity ?
            TSelection[TProperty] extends string | number
            ? TSelection[TProperty]
            : TSelection[TProperty] extends object
            ? TProperty
            : never
            : never

        type EntityProperty<TSelection, TEntity, TProperty extends keyof TSelection> =
            TProperty extends keyof TEntity
            ? TSelection[TProperty] extends object
            ? FilterResponse<TSelection[TProperty], TEntity[TProperty]>
            : TEntity[TProperty]
            : never

        type FilterResponse<TSelection extends Selection<TSelection, TEntity>, TEntity> = {
            [TProperty in keyof TSelection as SelectionValue<TSelection, TEntity, TProperty>]:
            EntityProperty<TSelection, TEntity, TProperty>
        }

        type FieldCondition<TEntity> =
            | { readonly where: Condition<TEntity> }
            | {
                [TProperty in keyof TEntity]?:
                | { readonly eq: TEntity[TProperty] }
                | { readonly gt: TEntity[TProperty] extends number ? TEntity[TProperty] : never }
                | { readonly lt: TEntity[TProperty] extends number ? TEntity[TProperty] : never }
            }

        type Condition<TEntity> =
            | [FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>]
            | [FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>]
            | [FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>, 'or' | 'and', FieldCondition<TEntity>]

        type Order<TEntity> = {
            [TProperty in keyof TEntity]?: 'asc' | 'desc'
        }

        interface IFilterRequest<TSelection extends Selection<TSelection, TEntity>, TEntity> {
            readonly select?: TSelection
            readonly where?: Condition<TEntity>
            readonly order?: Order<TEntity>
            readonly limit?: number
            readonly offset?: number
        }

        type Result<TSelection extends Selection<TSelection, TEntity>, TEntity> =
            | { kind: 'success', value: Array<FilterResponse<TSelection, TEntity>> }
            | { kind: 'error', value: Error }

        export interface IFilter<TEntity> {
            <TSelection extends Selection<TSelection, TEntity>>(req: IFilterRequest<TSelection, TEntity>): Result<TSelection, TEntity>
        }

    }
}