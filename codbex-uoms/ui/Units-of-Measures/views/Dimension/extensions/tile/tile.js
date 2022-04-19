/*
 * Copyright (c) 2010-2021 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 * Contributors:
 * SAP - initial API and implementation
 */

var dao = require("codbex-uoms/data/dao/Units-of-Measures/Dimension.js")

exports.getTile = function(relativePath) {
	let count = "n/a";
	try {
		count = dao.customDataCount();	
	} catch (e) {
		console.error("Error occured while involking 'codbex-uoms/data/dao/Units-of-Measures/Dimension.customDataCount()': " + e);
	}
	return {
		name: "Dimension",
		group: "Units-of-Measures",
		icon: "cube",
		location: relativePath + "services/v4/web/codbex-uoms/ui/Units-of-Measures/index.html",
		count: count,
		order: "890"
	};
};
