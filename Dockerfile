# Docker descriptor for codbex-uoms     
# License - http://www.eclipse.org/legal/epl-v20.html

FROM ghcr.io/codbex/codbex-gaia:0.17.0

COPY codbex-uoms target/dirigible/repository/root/registry/public/codbex-uoms

ENV DIRIGIBLE_HOME_URL=/services/web/codbex-uoms/gen/index.html
