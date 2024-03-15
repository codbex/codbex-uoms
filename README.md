# codbex-uoms
UoMs Management Application

### Model

![model](images/uoms-model.png)

### Application

#### Launchpad

![launchpad](images/uoms-launchpad.png)

#### Management

![management](images/uoms-uom-management.png)


![management](images/uoms-dimension-management.png)

#### Converter

	http://host:port/services/ts/codbex-uoms/api/converter.ts/CMT/DMT/50

### Infrastructure

#### Build

	docker build -t codbex-uoms:1.0.0 .

#### Run

	docker run --name codbex-uoms -d -p 8080:8080 codbex-uoms:1.0.0

#### Clean

	docker rm codbex-uoms
