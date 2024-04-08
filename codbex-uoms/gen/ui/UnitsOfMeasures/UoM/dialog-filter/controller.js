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
			if (entity.Id) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Name) {
				filter.$filter.contains.Name = entity.Name;
			}
			if (entity.ISO) {
				filter.$filter.contains.ISO = entity.ISO;
			}
			if (entity.SAP) {
				filter.$filter.contains.SAP = entity.SAP;
			}
			if (entity.Dimension) {
				filter.$filter.contains.Dimension = entity.Dimension;
			}
			if (entity.Numerator) {
				filter.$filter.equals.Numerator = entity.Numerator;
			}
			if (entity.Denominator) {
				filter.$filter.equals.Denominator = entity.Denominator;
			}
			if (entity.Rounding) {
				filter.$filter.equals.Rounding = entity.Rounding;
			}
			if (entity.Base) {
				filter.$filter.equals.Base = entity.Base;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
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