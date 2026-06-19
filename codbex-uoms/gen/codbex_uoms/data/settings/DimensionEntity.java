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
@Table(name = "CODBEX_DIMENSION")
@Documentation("Dimension entity mapping")
public class DimensionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DIMENSION_ID")
    @Documentation("Id")
    public Integer Id;

    @Column(name = "DIMENSION_NAME", length = 100, nullable = false, unique = true)
    @Documentation("Name")
    public String Name;

    @Column(name = "DIMENSION_SAP", length = 20, nullable = true, unique = true)
    @Documentation("SAP")
    public String SAP;

}
