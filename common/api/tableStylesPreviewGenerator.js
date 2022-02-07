/*
 * (c) Copyright Ascensio System SIA 2010-2019
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

(function (window)
{
	const MAX_GENERATE_TIME = 20;
	const TIMEOUT_TIME      = 20;

	/**
	 * @param oApi
	 * @param oDrawingDocument
	 * @constructor
	 */
	function CTableStylesPreviewGenerator(oApi, oDrawingDocument)
	{
		this.Api             = oApi;
		this.DrawingDocument = oDrawingDocument;
		this.TableStyles     = [];
		this.Index           = -1;
		this.TimerId         = null;
		this.TableLook       = null;
		this.Start           = false;
	}
	CTableStylesPreviewGenerator.prototype.Begin = function(isDefaultTableLook)
	{
		if (this.Start)
			this.End();

		this.TableStyles = this.DrawingDocument.GetTableStyles();
		this.Index       = -1;
		this.TableLook   = this.DrawingDocument.GetTableLook(isDefaultTableLook);
		this.Start       = true;

		this.Api.sendEvent("asc_onBeginTableStylesPreview", this.TableStyles.length);

		return this.Continue();
	};
	CTableStylesPreviewGenerator.prototype.Continue = function()
	{
		let nTime  = performance.now();
		let nCount = this.TableStyles.length;

		let arrPreviews = [];
		while (this.Index < nCount)
		{
			if (performance.now() - nTime > MAX_GENERATE_TIME)
				break;

			let oPreview = this.DrawingDocument.DrawTableStylePreview(this.TableStyles[this.Index], this.TableLook);
			if (oPreview)
				arrPreviews.push(oPreview);

			this.Index++;
		}

		this.Api.sendEvent("asc_onAddTableStylesPreview", arrPreviews);

		let oThis = this;
		if (this.Index >= nCount)
			this.End();
		else
			this.TimerId = setTimeout(function(){oThis.Continue();}, TIMEOUT_TIME);

		return arrPreviews;
	};
	CTableStylesPreviewGenerator.prototype.End = function()
	{
		this.Reset();

		if (this.Start)
		{
			this.Start = false;
			this.Api.sendEvent("asc_onEndTableStylesPreview");
		}
	};
	CTableStylesPreviewGenerator.prototype.Reset = function()
	{
		if (this.TimerId)
			clearTimeout(this.TimerId);

		this.TimerId     = null;
		this.Index       = -1;
		this.TableStyles = [];
	};
	//--------------------------------------------------------export----------------------------------------------------
	window['AscCommon'] = window['AscCommon'] || {};
	window['AscCommon'].CTableStylesPreviewGenerator = CTableStylesPreviewGenerator;

})(window);
