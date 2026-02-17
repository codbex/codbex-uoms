import { Repository, EntityEvent, EntityConstructor } from '@aerokit/sdk/db'
import { Component } from '@aerokit/sdk/component'
import { Producer } from '@aerokit/sdk/messaging'
import { Extensions } from '@aerokit/sdk/extensions'
import { DimensionEntity } from './DimensionEntity'

@Component('DimensionRepository')
export class DimensionRepository extends Repository<DimensionEntity> {

    constructor() {
        super((DimensionEntity as EntityConstructor));
    }

    protected override async triggerEvent(data: EntityEvent<DimensionEntity>): Promise<void> {
        const triggerExtensions = await Extensions.loadExtensionModules('codbex-uoms-Settings-Dimension', ['trigger']);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }
        });
        Producer.topic('codbex-uoms-Settings-Dimension').send(JSON.stringify(data));
    }
}
