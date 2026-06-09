package gen.codbex_uoms.data.settings;

import org.eclipse.dirigible.engine.java.annotations.Column;
import org.eclipse.dirigible.engine.java.annotations.CreatedAt;
import org.eclipse.dirigible.engine.java.annotations.CreatedBy;
import org.eclipse.dirigible.engine.java.annotations.Documentation;
import org.eclipse.dirigible.engine.java.annotations.Entity;
import org.eclipse.dirigible.engine.java.annotations.GeneratedValue;
import org.eclipse.dirigible.engine.java.annotations.GenerationType;
import org.eclipse.dirigible.engine.java.annotations.Id;
import org.eclipse.dirigible.engine.java.annotations.Table;
import org.eclipse.dirigible.engine.java.annotations.UpdatedAt;
import org.eclipse.dirigible.engine.java.annotations.UpdatedBy;

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
