package gen.codbex_uoms.data.settings;

import org.eclipse.dirigible.components.data.store.java.repository.JavaRepository;
import org.eclipse.dirigible.engine.java.annotations.Repository;

@Repository
public class DimensionRepository extends JavaRepository<DimensionEntity> {

    public DimensionRepository() {
        super(DimensionEntity.class);
    }
}
