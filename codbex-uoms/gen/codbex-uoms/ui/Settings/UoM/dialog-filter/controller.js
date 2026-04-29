angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, $http, ViewParameters, LocaleService) => {
	const Dialogs = new DialogHub();
	let description = 'Description';
	$scope.entity = {};
	$scope.forms = {
		details: {},
	};

	LocaleService.onInit(() => {
		description = LocaleService.t('codbex-uoms:codbex-uoms-model.defaults.description');
	});

	let params = ViewParameters.get();
	if (Object.keys(params).length) {
		$scope.entity = params.entity ?? {};
		$scope.selectedMainEntityKey = params.selectedMainEntityKey;
		$scope.selectedMainEntityId = params.selectedMainEntityId;
		const optionsDimensionMap = new Map();
		params.optionsDimension.forEach(e => optionsDimensionMap.set(e.value, e));
		$scope.optionsDimension = Array.from(optionsDimensionMap.values());
	}

	$scope.filter = () => {
		let entity = $scope.entity;
		const filter = {
			$filter: {
				conditions: [],
				sorts: [],
				limit: 20,
				offset: 0
			}
		};
		if (entity.Id !== undefined) {
			const condition = { propertyName: 'Id', operator: 'EQ', value: entity.Id };
			filter.$filter.conditions.push(condition);
		}
		if (entity.Name) {
			const condition = { propertyName: 'Name', operator: 'LIKE', value: `%${entity.Name}%` };
			filter.$filter.conditions.push(condition);
		}
		if (entity.ISO) {
			const condition = { propertyName: 'ISO', operator: 'LIKE', value: `%${entity.ISO}%` };
			filter.$filter.conditions.push(condition);
		}
		if (entity.Dimension !== undefined) {
			const condition = { propertyName: 'Dimension', operator: 'EQ', value: entity.Dimension };
			filter.$filter.conditions.push(condition);
		}
		if (entity.SAP) {
			const condition = { propertyName: 'SAP', operator: 'LIKE', value: `%${entity.SAP}%` };
			filter.$filter.conditions.push(condition);
		}
		if (entity.Numerator !== undefined) {
			const condition = { propertyName: 'Numerator', operator: 'EQ', value: entity.Numerator };
			filter.$filter.conditions.push(condition);
		}
		if (entity.Denominator !== undefined) {
			const condition = { propertyName: 'Denominator', operator: 'EQ', value: entity.Denominator };
			filter.$filter.conditions.push(condition);
		}
		if (entity.Rounding !== undefined) {
			const condition = { propertyName: 'Rounding', operator: 'EQ', value: entity.Rounding };
			filter.$filter.conditions.push(condition);
		}
		if (entity.Base !== undefined && entity.isBaseIndeterminate === false) {
			const condition = { propertyName: 'Base', operator: 'EQ', value: entity.Base };
			filter.$filter.conditions.push(condition);
		}
		Dialogs.postMessage({ topic: 'codbex-uoms.Settings.UoM.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
		lastSearchValuesDimension.clear()
		allValuesDimension.length = 0;
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
		Dialogs.closeWindow({ id: 'UoM-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};

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

});