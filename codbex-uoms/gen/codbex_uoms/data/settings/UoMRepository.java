package gen.codbex_uoms.data.settings;

import org.eclipse.dirigible.components.data.store.java.repository.JavaRepository;
import org.eclipse.dirigible.sdk.component.Repository;
import org.eclipse.dirigible.sdk.messaging.Producer;
import org.eclipse.dirigible.sdk.utils.Json;

@Repository
public class UoMRepository extends JavaRepository<UoMEntity> {

    public UoMRepository() {
        super(UoMEntity.class);
    }

    @Override
    public UoMEntity save(UoMEntity entity) {
        UoMEntity saved = super.save(entity);
        // Publish the create event so listeners (e.g. intent process triggers / reactions under gen/events) can react.
        Producer.sendToTopic("codbex-uoms-Settings-UoM", Json.stringify(saved));
        return saved;
    }

    @Override
    public UoMEntity update(UoMEntity entity) {
        UoMEntity updated = super.update(entity);
        // Publish the update event (suffixed topic) so intent reactions under gen/events can react.
        Producer.sendToTopic("codbex-uoms-Settings-UoM-updated", Json.stringify(updated));
        return updated;
    }

    /**
     * Persists changes WITHOUT publishing the "-updated" event. Intended for system-managed
     * back-references — e.g. an intent process trigger writing ProcessId back onto the entity that
     * started it. Going through {@link #update} would re-publish "UoM-updated" and spuriously
     * re-fire onUpdate reactions (notifications, roll-ups, integrations) for a change the user never made.
     */
    public UoMEntity updateWithoutEvent(UoMEntity entity) {
        return super.update(entity);
    }

    @Override
    public void delete(UoMEntity entity) {
        super.delete(entity);
        // Publish the delete event (suffixed topic) so intent reactions under gen/events can react.
        Producer.sendToTopic("codbex-uoms-Settings-UoM-deleted", Json.stringify(entity));
    }

    @Override
    public void deleteById(Object id) {
        UoMEntity entity = findById(id);
        super.deleteById(id);
        if (entity != null) {
            Producer.sendToTopic("codbex-uoms-Settings-UoM-deleted", Json.stringify(entity));
        }
    }
}
