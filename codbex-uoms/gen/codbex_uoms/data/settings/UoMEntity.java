package gen.codbex_uoms.data.settings;

import org.eclipse.dirigible.sdk.db.Column;
import org.eclipse.dirigible.sdk.db.CreatedAt;
import org.eclipse.dirigible.sdk.db.CreatedBy;
import org.eclipse.dirigible.sdk.platform.Documentation;
import org.eclipse.dirigible.sdk.db.Entity;
import org.eclipse.dirigible.sdk.db.GeneratedValue;
import org.eclipse.dirigible.sdk.db.GenerationType;
import org.eclipse.dirigible.sdk.db.Id;
import org.eclipse.dirigible.sdk.db.Table;
import org.eclipse.dirigible.sdk.db.UpdatedAt;
import org.eclipse.dirigible.sdk.db.UpdatedBy;

@Entity
@Table(name = "CODBEX_UOM")
@Documentation("UoM entity mapping")
public class UoMEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UOM_ID")
    @Documentation("Id")
    public Integer Id;

    @Column(name = "UOM_NAME", length = 100, nullable = false, unique = true)
    @Documentation("Name")
    public String Name;

    @Column(name = "UOM_ISO", length = 20, nullable = false, unique = true)
    @Documentation("ISO")
    public String ISO;

    @Column(name = "UOM_DIMENSION", nullable = false)
    @Documentation("Dimension")
    public Integer Dimension;

    @Column(name = "UOM_SAP", length = 20, nullable = true, unique = true)
    @Documentation("SAP")
    public String SAP;

    @Column(name = "UOM_NUMERATOR", nullable = false)
    @Documentation("Numerator")
    public Long Numerator;

    @Column(name = "UOM_DENOMINATOR", nullable = false)
    @Documentation("Denominator")
    public Long Denominator;

    @Column(name = "UOM_ROUNDING", nullable = false)
    @Documentation("Rounding")
    public Integer Rounding;

    @Column(name = "UOM_BASE", nullable = false)
    @Documentation("Base")
    public Boolean Base;

}
