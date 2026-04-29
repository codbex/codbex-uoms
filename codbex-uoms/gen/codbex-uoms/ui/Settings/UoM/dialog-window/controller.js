angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMController.ts';
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
			const optionsDimensionMap = new Map();
			params.optionsDimension?.forEach(e => optionsDimensionMap.set(e.value, e));
			$scope.optionsDimension = Array.from(optionsDimensionMap.values());
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

		$scope.serviceDimension = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/DimensionController.ts';
		
		$scope.optionsDimension = [];
		
		$http.get('/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/DimensionController.ts').then((response) => {
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

		const lastSearchValuesDimension = new Set();
		const allValuesDimension = [];
		let loadMoreOptionsDimensionCounter = 0;
		$scope.optionsDimensionLoading = false;
		$scope.optionsDimensionHasMore = true;

		$scope.loadMoreOptionsDimension = () => {
			const limit = 20;
			$scope.optionsDimensionLoading = true;
			$http.get(`/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/DimensionController.ts?$limit=${limit}&$offset=${++loadMoreOptionsDimensionCounter * limit}`)
			.then((response) => {
				const optionValues = allValuesDimension.map(e => e.value);
				const resultValues = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
				const newValues = [];
				resultValues.forEach(e => {
					if (!optionValues.includes(e.value)) {
						allValuesDimension.push(e);
						newValues.push(e);
					}
				});
				newValues.forEach(e => {
					if (!$scope.optionsDimension.find(o => o.value === e.value)) {
						$scope.optionsDimension.push(e);
					}
				})
				$scope.optionsDimensionHasMore = resultValues.length > 0;
				$scope.optionsDimensionLoading = false;
			}, (error) => {
				$scope.optionsDimensionLoading = false;
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Dimension',
					message: LocaleService.t('codbex-uoms:codbex-uoms-model.messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};

		$scope.onOptionsDimensionChange = (event) => {
			if (allValuesDimension.length === 0) {
				allValuesDimension.push(...$scope.optionsDimension);
			}
			if (event.originalEvent.target.value === '') {
				allValuesDimension.sort((a, b) => a.text.localeCompare(b.text));
				$scope.optionsDimension = allValuesDimension;
				$scope.optionsDimensionHasMore = true;
			} else if (isText(event.which)) {
				$scope.optionsDimensionHasMore = false;
				let cacheHit = false;
				Array.from(lastSearchValuesDimension).forEach(e => {
					if (event.originalEvent.target.value.startsWith(e)) {
						cacheHit = true;
					}
				})
				if (!cacheHit) {
					$http.post('/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/DimensionController.ts/search', {
						conditions: [
							{ propertyName: 'Name', operator: 'LIKE', value: `${event.originalEvent.target.value}%` }
						]
					}).then((response) => {
						const optionValues = allValuesDimension.map(e => e.value);
						const searchResult = response.data.map(e => ({
							value: e.Id,
							text: e.Name
						}));
						searchResult.forEach(e => {
							if (!optionValues.includes(e.value)) {
								allValuesDimension.push(e);
							}
						});
						$scope.optionsDimension = allValuesDimension.filter(e => e.text.toLowerCase().startsWith(event.originalEvent.target.value.toLowerCase()));
					}, (error) => {
						console.error(error);
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: 'Dimension',
							message: LocaleService.t('codbex-uoms:codbex-uoms-model.messages.error.unableToLoad', { message: message }),
							type: AlertTypes.Error
						});
					});
					lastSearchValuesDimension.add(event.originalEvent.target.value);
				}
			}
		};
		function isText(keycode) {
			if ((keycode >= 48 && keycode <= 90) || (keycode >= 96 && keycode <= 111) || (keycode >= 186 && keycode <= 222) || [8, 46, 173].includes(keycode)) return true;
			return false;
		}

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