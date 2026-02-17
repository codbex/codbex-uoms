import { Entity, Table, Id, Generated, Column, Documentation } from '@aerokit/sdk/db'

@Entity('UoMEntity')
@Table('CODBEX_UOM')
@Documentation('UoM entity mapping')
export class UoMEntity {

    @Id()
    @Generated('sequence')
    @Documentation('Id')
    @Column({
        name: 'UOM_ID',
        type: 'integer',
    })
    public Id?: number;

    @Documentation('Name')
    @Column({
        name: 'UOM_NAME',
        type: 'string',
        length: 100,
        nullable: true,
    })
    public Name?: string;

    @Documentation('ISO')
    @Column({
        name: 'UOM_ISO',
        type: 'string',
        length: 20,
        nullable: true,
    })
    public ISO?: string;

    @Documentation('Dimension')
    @Column({
        name: 'UOM_DIMENSION',
        type: 'integer',
        nullable: true,
    })
    public Dimension?: number;

    @Documentation('SAP')
    @Column({
        name: 'UOM_SAP',
        type: 'string',
        length: 20,
        nullable: true,
    })
    public SAP?: string;

    @Documentation('Numerator')
    @Column({
        name: 'UOM_NUMERATOR',
        type: 'long',
        nullable: true,
    })
    public Numerator?: number;

    @Documentation('Denominator')
    @Column({
        name: 'UOM_DENOMINATOR',
        type: 'long',
        nullable: true,
    })
    public Denominator?: number;

    @Documentation('Rounding')
    @Column({
        name: 'UOM_ROUNDING',
        type: 'integer',
        nullable: true,
    })
    public Rounding?: number;

    @Documentation('Base')
    @Column({
        name: 'UOM_BASE',
        type: 'boolean',
        nullable: true,
    })
    public Base?: boolean;

}

(new UoMEntity());
