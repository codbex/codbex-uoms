# codbex-uoms
UoMs Management Module

- Data module: [codbex-uoms-data](https://github.com/codbex/codbex-uoms-data)

### Model

![model](images/uoms-model.png)

### Application

#### Launchpad

![launchpad](images/uoms-launchpad.png)

#### Management

![management](images/uom-management.png)


![management](images/dimension-management.png)

#### Converter

	http://host:port/services/ts/codbex-uoms/api/ConverterController.ts/<UOM_ISO>/<UOM_ISO>/50

	http://host:port/services/ts/codbex-uoms/api/ConverterController.ts/CMT/DMT/50
	
## Local Development with Docker

When running this project inside the codbex Atlas Docker image, you must provide authentication for installing dependencies from GitHub Packages.
1. Create a GitHub Personal Access Token (PAT) with `read:packages` scope.
2. Pass `NPM_TOKEN` to the Docker container:

    ```
    docker run \
    -e NPM_TOKEN=<your_github_token> \
    --rm -p 80:80 \
    ghcr.io/codbex/codbex-atlas:latest
    ```

⚠️ **Notes**
- The `NPM_TOKEN` must be available at container runtime.
- This is required even for public packages hosted on GitHub Packages.
- Never bake the token into the Docker image or commit it to source control.
