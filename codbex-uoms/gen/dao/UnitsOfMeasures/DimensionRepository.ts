import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface DimensionEntity {
    readonly Id: number;
    Name?: string;
    BaseUnit?: string;
}

export interface DimensionCreateEntity {
    readonly Name?: string;
    readonly BaseUnit?: string;
}

export interface DimensionUpdateEntity extends DimensionCreateEntity {
    readonly Id: number;
}

export interface DimensionEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            BaseUnit?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            BaseUnit?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            BaseUnit?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            BaseUnit?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            BaseUnit?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            BaseUnit?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            BaseUnit?: string;
        };
    },
    $select?: (keyof DimensionEntity)[],
    $sort?: string | (keyof DimensionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DimensionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DimensionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class DimensionRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_DIMENSION",
        properties: [
            {
                name: "Id",
                column: "DIMENSION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "DIMENSION_NAME",
                type: "VARCHAR",
            },
            {
                name: "BaseUnit",
                column: "DIMENSION_BASEUNIT",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(DimensionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DimensionEntityOptions): DimensionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): DimensionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: DimensionCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_DIMENSION",
            entity: entity,
            key: {
                name: "Id",
                column: "DIMENSION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DimensionUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_DIMENSION",
            entity: entity,
            key: {
                name: "Id",
                column: "DIMENSION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DimensionCreateEntity | DimensionUpdateEntity): number {
        const id = (entity as DimensionUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DimensionUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_DIMENSION",
            entity: entity,
            key: {
                name: "Id",
                column: "DIMENSION_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__DIMENSION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DimensionEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-uoms/UnitsOfMeasures/Dimension", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-uoms/UnitsOfMeasures/Dimension").send(JSON.stringify(data));
    }
}