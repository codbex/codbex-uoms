# Docker descriptor for codbex-uoms     
# License - http://www.eclipse.org/legal/epl-v20.html

FROM ghcr.io/codbex/codbex-gaia:latest

COPY codbex-uoms target/dirigible/repository/root/registry/public/codbex-uoms

COPY codbex-uoms-data target/dirigible/repository/root/registry/public/codbex-uoms-data

ENV DIRIGIBLE_HOME_URL=/services/web/codbex-uoms/gen/index.html