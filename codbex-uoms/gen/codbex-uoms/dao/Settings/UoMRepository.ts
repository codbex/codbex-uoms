import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface UoMEntity {
    readonly Id: number;
    Name?: string;
    ISO?: string;
    Dimension?: number;
    SAP?: string;
    Numerator?: number;
    Denominator?: number;
    Rounding?: number;
    Base?: boolean;
}

export interface UoMCreateEntity {
    readonly Name?: string;
    readonly ISO?: string;
    readonly Dimension?: number;
    readonly SAP?: string;
    readonly Numerator?: number;
    readonly Denominator?: number;
    readonly Rounding?: number;
    readonly Base?: boolean;
}

export interface UoMUpdateEntity extends UoMCreateEntity {
    readonly Id: number;
}

export interface UoMEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            ISO?: string | string[];
            Dimension?: number | number[];
            SAP?: string | string[];
            Numerator?: number | number[];
            Denominator?: number | number[];
            Rounding?: number | number[];
            Base?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            ISO?: string | string[];
            Dimension?: number | number[];
            SAP?: string | string[];
            Numerator?: number | number[];
            Denominator?: number | number[];
            Rounding?: number | number[];
            Base?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            ISO?: string;
            Dimension?: number;
            SAP?: string;
            Numerator?: number;
            Denominator?: number;
            Rounding?: number;
            Base?: boolean;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            ISO?: string;
            Dimension?: number;
            SAP?: string;
            Numerator?: number;
            Denominator?: number;
            Rounding?: number;
            Base?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            ISO?: string;
            Dimension?: number;
            SAP?: string;
            Numerator?: number;
            Denominator?: number;
            Rounding?: number;
            Base?: boolean;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            ISO?: string;
            Dimension?: number;
            SAP?: string;
            Numerator?: number;
            Denominator?: number;
            Rounding?: number;
            Base?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            ISO?: string;
            Dimension?: number;
            SAP?: string;
            Numerator?: number;
            Denominator?: number;
            Rounding?: number;
            Base?: boolean;
        };
    },
    $select?: (keyof UoMEntity)[],
    $sort?: string | (keyof UoMEntity)[],
    $order?: 'ASC' | 'DESC',
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
        value: number;
    }
}

interface UoMUpdateEntityEvent extends UoMEntityEvent {
    readonly previousEntity: UoMEntity;
}

export class UoMRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_UOM",
        properties: [
            {
                name: "Id",
                column: "UOM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "UOM_NAME",
                type: "VARCHAR",
            },
            {
                name: "ISO",
                column: "UOM_ISO",
                type: "VARCHAR",
            },
            {
                name: "Dimension",
                column: "UOM_DIMENSION",
                type: "INTEGER",
            },
            {
                name: "SAP",
                column: "UOM_SAP",
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
            },
            {
                name: "Base",
                column: "UOM_BASE",
                type: "BOOLEAN",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(UoMRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: UoMEntityOptions = {}): UoMEntity[] {
        return this.dao.list(options).map((e: UoMEntity) => {
            EntityUtils.setBoolean(e, "Base");
            return e;
        });
    }

    public findById(id: number): UoMEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "Base");
        return entity ?? undefined;
    }

    public create(entity: UoMCreateEntity): number {
        EntityUtils.setBoolean(entity, "Base");
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
        EntityUtils.setBoolean(entity, "Base");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_UOM",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "UOM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: UoMCreateEntity | UoMUpdateEntity): number {
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

    public deleteById(id: number): void {
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

    private async triggerEvent(data: UoMEntityEvent | UoMUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-uoms-Settings-UoM", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-uoms-Settings-UoM").send(JSON.stringify(data));
    }
}
