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
				equals: {
				},
				notEquals: {
				},
				contains: {
				},
				greaterThan: {
				},
				greaterThanOrEqual: {
				},
				lessThan: {
				},
				lessThanOrEqual: {
				}
			},
		};
		if (entity.Id !== undefined) {
			filter.$filter.equals.Id = entity.Id;
		}
		if (entity.Name) {
			filter.$filter.contains.Name = entity.Name;
		}
		if (entity.ISO) {
			filter.$filter.contains.ISO = entity.ISO;
		}
		if (entity.Dimension !== undefined) {
			filter.$filter.equals.Dimension = entity.Dimension;
		}
		if (entity.SAP) {
			filter.$filter.contains.SAP = entity.SAP;
		}
		if (entity.Numerator !== undefined) {
			filter.$filter.equals.Numerator = entity.Numerator;
		}
		if (entity.Denominator !== undefined) {
			filter.$filter.equals.Denominator = entity.Denominator;
		}
		if (entity.Rounding !== undefined) {
			filter.$filter.equals.Rounding = entity.Rounding;
		}
		if (entity.Base !== undefined && entity.isBaseIndeterminate === false) {
			filter.$filter.equals.Base = entity.Base;
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