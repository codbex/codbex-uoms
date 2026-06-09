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
