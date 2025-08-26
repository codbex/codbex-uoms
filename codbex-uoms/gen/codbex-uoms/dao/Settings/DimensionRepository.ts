import { sql, query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface DimensionEntity {
    readonly Id: number;
    Name: string;
    SAP?: string;
}

export interface DimensionCreateEntity {
    readonly Name: string;
    readonly SAP?: string;
}

export interface DimensionUpdateEntity extends DimensionCreateEntity {
    readonly Id: number;
}

export interface DimensionEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            SAP?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            SAP?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            SAP?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            SAP?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            SAP?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            SAP?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            SAP?: string;
        };
    },
    $select?: (keyof DimensionEntity)[],
    $sort?: string | (keyof DimensionEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
    $language?: string
}

export interface DimensionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DimensionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export interface DimensionUpdateEntityEvent extends DimensionEntityEvent {
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
                name: "Name",
                column: "DIMENSION_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "SAP",
                column: "DIMENSION_SAP",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DimensionRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: DimensionEntityOptions = {}): DimensionEntity[] {
        let list = this.dao.list(options);
        try {
            let script = sql.getDialect().select().column("*").from('"' + DimensionRepository.DEFINITION.table + '_LANG"').where('Language = ?').build();
            const resultSet = query.execute(script, [options.$language]);
            if (resultSet !== null && resultSet[0] !== null) {
                let translatedProperties = Object.getOwnPropertyNames(resultSet[0]);
                let maps = [];
                for (let i = 0; i < translatedProperties.length - 2; i++) {
                    maps[i] = {};
                }
                resultSet.forEach((r) => {
                    for (let i = 0; i < translatedProperties.length - 2; i++) {
                        maps[i][r[translatedProperties[0]]] = r[translatedProperties[i + 1]];
                    }
                });
                list.forEach((r) => {
                    for (let i = 0; i < translatedProperties.length - 2; i++) {
                        if (maps[i][r[translatedProperties[0]]]) {
                            r[translatedProperties[i + 1]] = maps[i][r[translatedProperties[0]]];
                        }
                    }

                });
            }
        } catch (Error) {
            console.error("Entity is marked as language dependent, but no language table present: " + DimensionRepository.DEFINITION.table);
        }
        return list;
    }

    public findById(id: number, options: DimensionEntityOptions = {}): DimensionEntity | undefined {
        const entity = this.dao.find(id);
        if (entity) {
            try {
                let script = sql.getDialect().select().column("*").from('"' + DimensionRepository.DEFINITION.table + '_LANG"').where('Language = ?').where('Id = ?').build();
                const resultSet = query.execute(script, [options.$language, id]);
                let translatedProperties = Object.getOwnPropertyNames(resultSet[0]);
                let maps = [];
                for (let i = 0; i < translatedProperties.length - 2; i++) {
                    maps[i] = {};
                }
                resultSet.forEach((r) => {
                    for (let i = 0; i < translatedProperties.length - 2; i++) {
                        maps[i][r[translatedProperties[0]]] = r[translatedProperties[i + 1]];
                    }
                });
                for (let i = 0; i < translatedProperties.length - 2; i++) {
                    if (maps[i][entity[translatedProperties[0]]]) {
                        entity[translatedProperties[i + 1]] = maps[i][entity[translatedProperties[0]]];
                    }
                }
            } catch (Error) {
                console.error("Entity is marked as language dependent, but no language table present: " + DimensionRepository.DEFINITION.table);
            }
        }
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
        const triggerExtensions = await extensions.loadExtensionModules("codbex-uoms-Settings-Dimension", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-uoms-Settings-Dimension").send(JSON.stringify(data));
    }
}
