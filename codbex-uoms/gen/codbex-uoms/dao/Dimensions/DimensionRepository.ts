import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface DimensionEntity {
    readonly Id: number;
    SAP?: string;
    Name: string;
}

export interface DimensionCreateEntity {
    readonly SAP?: string;
    readonly Name: string;
}

export interface DimensionUpdateEntity extends DimensionCreateEntity {
    readonly Id: number;
}

export interface DimensionEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            SAP?: string | string[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            SAP?: string | string[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            SAP?: string;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            SAP?: string;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            SAP?: string;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            SAP?: string;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            SAP?: string;
            Name?: string;
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

interface DimensionUpdateEntityEvent extends DimensionEntityEvent {
    readonly previousEntity: DimensionEntity;
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
                name: "SAP",
                column: "DIMENSION_SAP",
                type: "VARCHAR",
            },
            {
                name: "Name",
                column: "DIMENSION_NAME",
                type: "VARCHAR",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
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
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_DIMENSION",
            entity: entity,
            previousEntity: previousEntity,
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

    public count(options?: DimensionEntityOptions): number {
        return this.dao.count(options);
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

    private async triggerEvent(data: DimensionEntityEvent | DimensionUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-uoms-Dimensions-Dimension", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-uoms-Dimensions-Dimension").send(JSON.stringify(data));
    }
}
