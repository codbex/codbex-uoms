angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'UoM successfully created';
		let propertySuccessfullyUpdated = 'UoM successfully updated';

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

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.formHeadSelect', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)' });
			$scope.formHeaders.create = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.formHeadCreate', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)' });
			$scope.formHeaders.update = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.formHeadUpdate', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-uoms:codbex-uoms-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-uoms:codbex-uoms-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)' });
		});

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
				Notifications.show({
					title: LocaleService.t('codbex-uoms:codbex-uoms-model.t.UOM'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-uoms:codbex-uoms-model.messages.error.unableToCreate', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)', message: message });
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
				Notifications.show({
					title: LocaleService.t('codbex-uoms:codbex-uoms-model.t.UOM'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-uoms:codbex-uoms-model.messages.error.unableToUpdate', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceDimension = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/DimensionService.ts';
		
		$scope.optionsDimension = [];
		
		$http.get('/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/DimensionService.ts').then((response) => {
			$scope.optionsDimension = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Dimension',
				message: LocaleService.t('codbex-uoms:codbex-uoms-model.messages.error.unableToLoad', { message: message }),
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
				title: description,
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