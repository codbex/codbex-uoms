import { Repository, EntityEvent, EntityConstructor, Options } from '@aerokit/sdk/db'
import { Component } from '@aerokit/sdk/component'
import { Producer } from '@aerokit/sdk/messaging'
import { Extensions } from '@aerokit/sdk/extensions'
import { UoMEntity } from './UoMEntity'

@Component('UoMRepository')
export class UoMRepository extends Repository<UoMEntity> {

    constructor() {
        super((UoMEntity as EntityConstructor));
    }

    protected override async triggerEvent(data: EntityEvent<UoMEntity>): Promise<void> {
        const triggerExtensions = await Extensions.loadExtensionModules('codbex-uoms-Settings-UoM', ['trigger']);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }
        });
        Producer.topic('codbex-uoms-Settings-UoM').send(JSON.stringify(data));
    }
}
