angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-uoms.UnitsOfMeasures.UoM';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsDimension = params.optionsDimension;
		}

		$scope.filter = function () {
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
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("UoM-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);