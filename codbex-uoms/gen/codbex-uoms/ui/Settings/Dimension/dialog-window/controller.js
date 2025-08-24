angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/DimensionService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Dimension successfully created';
		let propertySuccessfullyUpdated = 'Dimension successfully updated';

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Dimension Details',
			create: 'Create Dimension',
			update: 'Update Dimension'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.formHeadSelect', { name: '$t(codbex-uoms:codbex-uoms-model.t.DIMENSION)' });
			$scope.formHeaders.create = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.formHeadCreate', { name: '$t(codbex-uoms:codbex-uoms-model.t.DIMENSION)' });
			$scope.formHeaders.update = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.formHeadUpdate', { name: '$t(codbex-uoms:codbex-uoms-model.t.DIMENSION)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-uoms:codbex-uoms-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-uoms:codbex-uoms-model.t.DIMENSION)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-uoms:codbex-uoms-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-uoms:codbex-uoms-model.t.DIMENSION)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-uoms.Settings.Dimension.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-uoms:codbex-uoms-model.t.DIMENSION'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-uoms:codbex-uoms-model.messages.error.unableToCreate', { name: '$t(codbex-uoms:codbex-uoms-model.t.DIMENSION)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-uoms.Settings.Dimension.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-uoms:codbex-uoms-model.t.DIMENSION'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-uoms:codbex-uoms-model.messages.error.unableToUpdate', { name: '$t(codbex-uoms:codbex-uoms-model.t.DIMENSION)', message: message });
				});
				console.error('EntityService:', error);
			});
		};


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
			Dialogs.closeWindow({ id: 'Dimension-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});