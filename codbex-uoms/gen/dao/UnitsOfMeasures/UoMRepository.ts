import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface UoMEntity {
    readonly Id: string;
    Name?: string;
    Code?: string;
    Dimension?: string;
    Numerator?: number;
    Denominator?: number;
    Rounding?: number;
}

export interface UoMCreateEntity {
    readonly Name?: string;
    readonly Code?: string;
    readonly Dimension?: string;
    readonly Numerator?: number;
    readonly Denominator?: number;
    readonly Rounding?: number;
}

export interface UoMUpdateEntity extends UoMCreateEntity {
    readonly Id: string;
}

export interface UoMEntityOptions {
    $filter?: {
        equals?: {
            Id?: string | string[];
            Name?: string | string[];
            Code?: string | string[];
            Dimension?: string | string[];
            Numerator?: number | number[];
            Denominator?: number | number[];
            Rounding?: number | number[];
        };
        notEquals?: {
            Id?: string | string[];
            Name?: string | string[];
            Code?: string | string[];
            Dimension?: string | string[];
            Numerator?: number | number[];
            Denominator?: number | number[];
            Rounding?: number | number[];
        };
        contains?: {
            Id?: string;
            Name?: string;
            Code?: string;
            Dimension?: string;
            Numerator?: number;
            Denominator?: number;
            Rounding?: number;
        };
        greaterThan?: {
            Id?: string;
            Name?: string;
            Code?: string;
            Dimension?: string;
            Numerator?: number;
            Denominator?: number;
            Rounding?: number;
        };
        greaterThanOrEqual?: {
            Id?: string;
            Name?: string;
            Code?: string;
            Dimension?: string;
            Numerator?: number;
            Denominator?: number;
            Rounding?: number;
        };
        lessThan?: {
            Id?: string;
            Name?: string;
            Code?: string;
            Dimension?: string;
            Numerator?: number;
            Denominator?: number;
            Rounding?: number;
        };
        lessThanOrEqual?: {
            Id?: string;
            Name?: string;
            Code?: string;
            Dimension?: string;
            Numerator?: number;
            Denominator?: number;
            Rounding?: number;
        };
    },
    $select?: (keyof UoMEntity)[],
    $sort?: string | (keyof UoMEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface UoMEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<UoMEntity>;
    readonly key: {
        name: string;
        column: string;
        value: string;
    }
}

export class UoMRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_UOM",
        properties: [
            {
                name: "Id",
                column: "UOM_ID",
                type: "VARCHAR",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "UOM_NAME",
                type: "VARCHAR",
            },
            {
                name: "Code",
                column: "UOM_CODE",
                type: "VARCHAR",
            },
            {
                name: "Dimension",
                column: "UOM_DIMENSION",
                type: "VARCHAR",
            },
            {
                name: "Numerator",
                column: "UOM_NUMERATOR",
                type: "BIGINT",
            },
            {
                name: "Denominator",
                column: "UOM_DENOMINATOR",
                type: "BIGINT",
            },
            {
                name: "Rounding",
                column: "UOM_ROUNDING",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(UoMRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: UoMEntityOptions): UoMEntity[] {
        return this.dao.list(options);
    }

    public findById(id: string): UoMEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: UoMCreateEntity): string {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_UOM",
            entity: entity,
            key: {
                name: "Id",
                column: "UOM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: UoMUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_UOM",
            entity: entity,
            key: {
                name: "Id",
                column: "UOM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: UoMCreateEntity | UoMUpdateEntity): string {
        const id = (entity as UoMUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as UoMUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: string): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_UOM",
            entity: entity,
            key: {
                name: "Id",
                column: "UOM_ID",
                value: id
            }
        });
    }

    public count(options?: UoMEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX__UOM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: UoMEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-uoms-UnitsOfMeasures-UoM", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-uoms-UnitsOfMeasures-UoM").send(JSON.stringify(data));
    }
}
