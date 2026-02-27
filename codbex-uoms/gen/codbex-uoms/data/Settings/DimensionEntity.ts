import { Entity, Table, Id, Generated, Column, Documentation, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy} from '@aerokit/sdk/db'

@Entity('DimensionEntity')
@Table('CODBEX_DIMENSION')
@Documentation('Dimension entity mapping')
export class DimensionEntity {

    @Id()
    @Generated('sequence')
    @Documentation('Id')
    @Column({
        name: 'DIMENSION_ID',
        type: 'integer',
    })
    public Id?: number;

    @Documentation('Name')
    @Column({
        name: 'DIMENSION_NAME',
        type: 'string',
        length: 100,
    })
    public Name!: string;

    @Documentation('SAP')
    @Column({
        name: 'DIMENSION_SAP',
        type: 'string',
        length: 20,
        nullable: true,
    })
    public SAP?: string;

}

(new DimensionEntity());
