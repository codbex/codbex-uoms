package gen.codbex_uoms.data.settings;

import org.eclipse.dirigible.components.data.store.java.repository.JavaRepository;
import org.eclipse.dirigible.sdk.component.Repository;

@Repository
public class UoMRepository extends JavaRepository<UoMEntity> {

    public UoMRepository() {
        super(UoMEntity.class);
    }
}
