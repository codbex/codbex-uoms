angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, ViewParameters, LocaleService) => {
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
		$scope.optionsDimension = params.optionsDimension;
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
});