angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete UoM? This action cannot be undone.',
			deleteTitle: 'Delete UoM?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.yes');
			translated.no = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.deleteTitle', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)' });
			translated.deleteConfirm = LocaleService.t('codbex-uoms:codbex-uoms-model.messages.deleteConfirm', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)' });
		});

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-uoms-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Settings' && e.view === 'UoM' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'Settings' && e.view === 'UoM' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-uoms.Settings.UoM.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-uoms.Settings.UoM.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-uoms.Settings.UoM.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			$scope.dataPage = pageNumber;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = EntityService.search(filter);
				} else {
					request = EntityService.list(offset, limit);
				}
				request.then((response) => {
					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-uoms:codbex-uoms-model.t.UOM'),
						message: LocaleService.t('codbex-uoms:codbex-uoms-model.messages.error.unableToLF', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-uoms:codbex-uoms-model.t.UOM'),
					message: LocaleService.t('codbex-uoms:codbex-uoms-model.messages.error.unableToCount', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'UoM-details',
				params: {
					action: 'select',
					entity: entity,
					optionsDimension: $scope.optionsDimension,
				},
				closeButton: true,
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'UoM-filter',
				params: {
					entity: $scope.filterEntity,
					optionsDimension: $scope.optionsDimension,
				},
				closeButton: true,
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'UoM-details',
				params: {
					action: 'create',
					entity: {},
					optionsDimension: $scope.optionsDimension,
				},
				closeButton: false,
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'UoM-details',
				params: {
					action: 'update',
					entity: entity,
					optionsDimension: $scope.optionsDimension,
				},
				closeButton: false,
			});
		};

		$scope.deleteEntity = (entity) => {
			let id = entity.Id;
			Dialogs.showDialog({
				title: translated.deleteTitle,
				message: translated.deleteConfirm,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: translated.yes,
				}, {
					id: 'delete-btn-no',
					label: translated.no,
				}]
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then((response) => {
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-uoms.Settings.UoM.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-uoms:codbex-uoms-model.t.UOM'),
							message: LocaleService.t('codbex-uoms:codbex-uoms-model.messages.error.unableToDelete', { name: '$t(codbex-uoms:codbex-uoms-model.t.UOM)', message: message }),
							type: AlertTypes.Error
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
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

		$scope.optionsDimensionValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsDimension.length; i++) {
				if ($scope.optionsDimension[i].value === optionKey) {
					return $scope.optionsDimension[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	});