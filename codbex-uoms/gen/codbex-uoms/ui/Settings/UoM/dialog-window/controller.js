angular.module('page', ['blimpKit', 'platformView', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, EntityService) => {
		const Dialogs = new DialogHub();
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'UoM Details',
			create: 'Create UoM',
			update: 'Update UoM'
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsDimension = params.optionsDimension;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-uoms.Settings.UoM.entityCreated', data: response.data });
				Dialogs.showAlert({
					title: 'UoM',
					message: 'UoM successfully created',
					type: AlertTypes.Success
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = `Unable to create UoM: '${message}'`;
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-uoms.Settings.UoM.entityUpdated', data: response.data });
				Dialogs.showAlert({
					title: 'UoM',
					message: 'UoM successfully updated',
					type: AlertTypes.Success
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = `Unable to update UoM: '${message}'`;
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceDimension = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/DimensionService.ts';
		
		$scope.optionsDimension = [];
		
		$http.get('/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/DimensionService.ts').then((response) => {
			$scope.optionsDimension = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Dimension',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});

		$scope.$watch('entity.Dimension', (newValue, oldValue) => {
			if (newValue !== undefined && newValue !== null) {
				$http.get($scope.serviceDimension + '/' + newValue).then((response) => {
					let valueFrom = response.data.SAP;
					$scope.entity.SAP = valueFrom;
				}, (error) => {
					console.error(error);
				});
			}
		});

		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: 'Description',
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'UoM-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});