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

$(function () {

	let logicDocument = AscTest.CreateLogicDocument();
	logicDocument.Start_SilentMode();

	logicDocument.RemoveFromContent(0, logicDocument.GetElementsCount(), false);

	let formsManager = logicDocument.GetFormsManager();

	let p1 = new AscWord.CParagraph(editor.WordControl);
	let p2 = new AscWord.CParagraph(editor.WordControl);

	logicDocument.AddToContent(0, p1);
	logicDocument.AddToContent(1, p2);

	let r1 = new AscWord.CRun();
	p1.AddToContent(0, r1);
	r1.AddText("Hello Word!");

	let r2 = new AscWord.CRun();
	p2.AddToContent(0, r2);
	r2.AddText("Абракадабра");


	QUnit.module("Check complex forms");


	QUnit.test("Positioning, moving cursor and adding/removing text", function (assert)
	{
		let complexForm = logicDocument.AddComplexForm();
		complexForm.SetFormPr(new AscWord.CSdtFormPr());

		assert.strictEqual(formsManager.GetAllForms().length, 1, "Add complex form to document (check forms count)");

		r2.SetThisElementCurrent();
		r2.MoveCursorToStartPos();

		assert.strictEqual(complexForm.IsThisElementCurrent(), false, "Check cursor position in complex field");
		assert.strictEqual(r2.IsThisElementCurrent(), true, "Check cursor position in run");

		complexForm.SetThisElementCurrent();
		complexForm.MoveCursorToStartPos();

		assert.strictEqual(complexForm.IsThisElementCurrent(), true, "Check cursor position in complex field");
		assert.strictEqual(r2.IsThisElementCurrent(), false, "Check cursor position in run");

		assert.strictEqual(complexForm.IsPlaceHolder(), true, "Is placeholder in complexForm");

		// Наполняем нашу форму: 111<textForm>222<textForm>333

		let tempRun1 = new AscWord.CRun();
		tempRun1.AddText("111");
		complexForm.Add(tempRun1);
		assert.strictEqual(complexForm.IsCursorAtEnd(), true, "Check cursor after adding text");
		assert.strictEqual(complexForm.IsPlaceHolder(), false, "Check placeholder in complexForm after adding text run");

		let textForm1 = logicDocument.AddContentControlTextForm();
		textForm1.SetFormPr(new AscWord.CSdtFormPr());

		logicDocument.RemoveSelection();
		complexForm.SetThisElementCurrent();
		complexForm.MoveCursorToEndPos();

		let tempRun2 = new AscWord.CRun();
		tempRun2.AddText("222");
		complexForm.Add(tempRun2);

		let textForm2 = logicDocument.AddContentControlTextForm();
		textForm2.SetFormPr(new AscWord.CSdtFormPr());

		complexForm.SetThisElementCurrent();
		complexForm.MoveCursorToEndPos();

		let tempRun3 = new AscWord.CRun();
		tempRun3.AddText("333");
		complexForm.Add(tempRun3);

		assert.strictEqual(formsManager.GetAllForms().length, 1, "Check forms count after adding 2 subforms");

		logicDocument.RemoveSelection();
		textForm1.SetThisElementCurrent();
		assert.strictEqual(textForm1.IsThisElementCurrent(), true, "Check cursor position in textForm1");
		assert.strictEqual(complexForm.IsThisElementCurrent(), true, "Check cursor position in complex field");
		assert.strictEqual(textForm1.IsPlaceHolder(), true, "Is placeholder in textForm1");

		textForm1.Add(new AscWord.CRunText(0x61));
		textForm1.Add(new AscWord.CRunText(0x62));
		textForm1.Add(new AscWord.CRunText(0x63));
		assert.strictEqual(textForm1.IsPlaceHolder(), false, "Is placeholder in textForm1 after adding text");

		textForm2.Add(new AscWord.CRunText(0x64));
		textForm2.Add(new AscWord.CRunText(0x65));
		textForm2.Add(new AscWord.CRunText(0x66));
		assert.strictEqual(textForm2.IsPlaceHolder(), false, "Is placeholder in textForm2 after adding text");

		AscTest.SetEditingMode();
		assert.strictEqual(logicDocument.IsFillingFormMode(), false, "Check normal editing mode");

		textForm2.SetThisElementCurrent();
		textForm2.MoveCursorToStartPos();
		assert.strictEqual(textForm2.IsThisElementCurrent() && textForm2.IsCursorAtBegin(), true, "Move cursor at the start of textForm2");

		// Делаем два смещения, потому что после одинарного мы могли попасть в пустой ран между tempRun2 и textForm2
		// везде далее проверяем также
		AscTest.MoveCursorLeft();
		AscTest.MoveCursorLeft();
		assert.strictEqual(tempRun2.IsThisElementCurrent(), true, "Cursor must be in run2");

		textForm2.SetThisElementCurrent();
		textForm2.MoveCursorToEndPos();
		assert.strictEqual(textForm2.IsThisElementCurrent() && textForm2.IsCursorAtEnd(), true, "Move cursor at the end of textForm2");

		AscTest.MoveCursorRight();
		AscTest.MoveCursorRight();
		assert.strictEqual(tempRun3.IsThisElementCurrent(), true, "Cursor must be in run3");

		AscTest.SetFillingFormMode();
		assert.strictEqual(logicDocument.IsFillingFormMode(), true, "Check filling form mode");

		textForm2.SetThisElementCurrent();
		textForm2.MoveCursorToStartPos();

		AscTest.MoveCursorLeft();
		assert.strictEqual(textForm1.IsThisElementCurrent() && textForm1.IsCursorAtEnd(), true, "Cursor must be at the end of text form1");

		textForm2.SetThisElementCurrent();
		textForm2.MoveCursorToEndPos();
		assert.strictEqual(textForm2.IsThisElementCurrent() && textForm2.IsCursorAtEnd(), true, "Move cursor at the end of textForm2");

		AscTest.MoveCursorRight();
		AscTest.MoveCursorRight();
		assert.strictEqual(textForm2.IsThisElementCurrent() && textForm2.IsCursorAtEnd(), true, "Cursor must be at the end of text form2");

		// Проверяем перемещение из текстовых форм с плейсхолдером

		textForm1.ClearContentControlExt();
		assert.strictEqual(textForm1.IsPlaceHolder(), true, "Is placeholder in text form 1 after clearing form");

		textForm1.SetThisElementCurrent();
		textForm1.MoveCursorToEndPos();
		assert.strictEqual(textForm1.IsThisElementCurrent() && textForm1.IsCursorAtBegin(), true, "Move cursor to the text form1");

		AscTest.MoveCursorLeft();
		assert.strictEqual(textForm1.IsThisElementCurrent() && textForm1.IsCursorAtBegin(), true, "Check cursor position after moving left");


		textForm1.SetThisElementCurrent();
		textForm1.MoveCursorToEndPos();
		AscTest.MoveCursorRight();
		assert.strictEqual(textForm1.IsThisElementCurrent() && textForm1.IsCursorAtBegin(), false, "Check form1 after moving cursor right");
		assert.strictEqual(textForm2.IsThisElementCurrent() && textForm2.IsCursorAtBegin(), true, "Check form2 after moving cursor right");


		textForm2.ClearContentControlExt();
		assert.strictEqual(textForm2.IsPlaceHolder(), true, "Is placeholder in text form 1 after clearing form");

		textForm2.SetThisElementCurrent();
		textForm2.MoveCursorToEndPos();
		assert.strictEqual(textForm2.IsThisElementCurrent() && textForm2.IsCursorAtBegin(), true, "Move cursor to the text form2");

		AscTest.MoveCursorLeft();
		assert.strictEqual(textForm1.IsThisElementCurrent() && textForm1.IsCursorAtBegin(), true, "Check cursor position after moving left");
		assert.strictEqual(textForm2.IsThisElementCurrent() && textForm2.IsCursorAtBegin(), false, "Check form2 after moving cursor right");

		textForm2.SetThisElementCurrent();
		textForm2.MoveCursorToEndPos();
		AscTest.MoveCursorRight();
		assert.strictEqual(textForm2.IsThisElementCurrent() && textForm2.IsCursorAtEnd(), true, "Check cursor position after moving cursor right");


		// Проверяем набор внутри форм
		textForm1.ClearContentControlExt();
		textForm2.ClearContentControlExt();

		assert.strictEqual(textForm1.IsPlaceHolder() && textForm2.IsPlaceHolder() && !complexForm.IsPlaceHolder(), true, "Check entering text to a form. Check if both subforms are cleared");

		textForm1.SetThisElementCurrent();
		textForm1.MoveCursorToStartPos();

		assert.strictEqual(textForm1.IsTextForm() && !!textForm1.GetTextFormPr(), true, "Check if text form1 is an actual text form");
		assert.strictEqual(textForm1.GetTextFormPr().GetMaxCharacters(), -1, "Check max characters value");

		AscTest.PressKey(AscTest.KeyCode.a);
		AscTest.PressKey(AscTest.KeyCode.b);
		AscTest.PressKey(AscTest.KeyCode.c);
		AscTest.PressKey(AscTest.KeyCode.d);
		AscTest.PressKey(AscTest.KeyCode.e);
		AscTest.PressKey(AscTest.KeyCode.f);

		assert.strictEqual(textForm1.GetInnerText(), "abcdef", "Text of text form1 : abcdef");
		assert.strictEqual(textForm2.IsPlaceHolder(), true, "Text form 2 is filled with placeholder");
		assert.strictEqual(textForm1.IsThisElementCurrent() && textForm1.IsCursorAtEnd(), true, "Check cursor position after entering text");

		AscTest.MoveCursorRight();

		AscTest.PressKey(AscTest.KeyCode.A);
		AscTest.PressKey(AscTest.KeyCode.B);
		AscTest.PressKey(AscTest.KeyCode.C);

		assert.strictEqual(complexForm.GetInnerText(), "111abcdef222ABC333", "Check text of all complex form");

		textForm1.ClearContentControlExt();
		textForm2.ClearContentControlExt();
		textForm1.SetThisElementCurrent();
		textForm1.MoveCursorToStartPos();
		assert.strictEqual(textForm1.IsPlaceHolder() && textForm2.IsPlaceHolder() && !complexForm.IsPlaceHolder(), true, "Check entering text to a form. Check if both subforms are cleared");

		textForm1.GetTextFormPr().SetMaxCharacters(3);
		assert.strictEqual(textForm1.IsTextForm() && !!textForm1.GetTextFormPr(), true, "Check if text form1 is an actual text form");
		assert.strictEqual(textForm1.GetTextFormPr().GetMaxCharacters(), 3, "Check max characters value");

		AscTest.PressKey(AscTest.KeyCode.a);
		AscTest.PressKey(AscTest.KeyCode.b);
		AscTest.PressKey(AscTest.KeyCode.c);
		AscTest.PressKey(AscTest.KeyCode.d);
		AscTest.PressKey(AscTest.KeyCode.e);
		AscTest.PressKey(AscTest.KeyCode.f);

		assert.strictEqual(textForm1.GetInnerText(), "abc", "Text of text form1 : abc");
		assert.strictEqual(textForm2.GetInnerText(), "def", "Text of text form2 : def");
		assert.strictEqual(textForm2.IsThisElementCurrent() && textForm2.IsCursorAtEnd(), true, "Check cursor position after entering text");
		assert.strictEqual(complexForm.GetInnerText(), "111abc222def333", "Check text of all complex form");
	});

	QUnit.test("Check mouse clicks", function (assert)
	{
		// Внутри составной формы тройной клик должен выделять всю составную форму целиком, где бы мы не кликали
		// Двойной клик внутри простой подформы выделяет целиком подформу, а двойно клик вне простой подфоры выделяет
		// слово (по обычному) в рамках составной формы

		logicDocument.RemoveFromContent(0, logicDocument.GetElementsCount(), false);

		let paragraph = new AscWord.CParagraph(editor.WordControl);
		logicDocument.AddToContent(logicDocument.GetElementsCount(), paragraph);
		paragraph.SetParagraphSpacing({Before : 0, After : 0, Line : 1, LineRule : Asc.linerule_Auto});

		paragraph.SetThisElementCurrent();
		assert.strictEqual(paragraph.IsThisElementCurrent(), true, "Check current position");

		let complexForm = logicDocument.AddComplexForm();
		complexForm.SetFormPr(new AscWord.CSdtFormPr());

		assert.strictEqual(formsManager.GetAllForms().length, 1, "Add complex form to document (check forms count)");

		complexForm.SetThisElementCurrent();
		complexForm.MoveCursorToStartPos();

		// Наполняем нашу форму: 111<textForm>222<textForm>333
		let tempRun1 = new AscWord.CRun();
		tempRun1.AddText("111");
		complexForm.Add(tempRun1);

		assert.strictEqual(complexForm.IsCursorAtEnd(), true, "Check cursor after adding text");
		assert.strictEqual(complexForm.IsPlaceHolder(), false, "Check placeholder in complexForm after adding text run");

		logicDocument.RemoveSelection();
		complexForm.SetThisElementCurrent();
		complexForm.MoveCursorToEndPos();

		let textForm1 = logicDocument.AddContentControlTextForm();
		textForm1.SetFormPr(new AscWord.CSdtFormPr());

		logicDocument.RemoveSelection();
		complexForm.SetThisElementCurrent();
		complexForm.MoveCursorToEndPos();

		let tempRun2 = new AscWord.CRun();
		tempRun2.AddText("222");
		complexForm.Add(tempRun2);

		let textForm2 = logicDocument.AddContentControlTextForm();
		textForm2.SetFormPr(new AscWord.CSdtFormPr());

		complexForm.SetThisElementCurrent();
		complexForm.MoveCursorToEndPos();

		let tempRun3 = new AscWord.CRun();
		tempRun3.AddText("333 444");
		complexForm.Add(tempRun3);

		AscTest.AddTextToInlineSdt(textForm1, "abc def");
		AscTest.AddTextToInlineSdt(textForm2, "ABC DEF");

		assert.strictEqual(complexForm.GetInnerText(), "111abc def222ABC DEF333 444", "Check text of all complex form");

		logicDocument.End_SilentMode();
		AscTest.Recalculate();

		assert.strictEqual(paragraph.GetLinesCount(0), 1, "Check lines count");
		assert.deepEqual(paragraph.GetPageBounds(0), new AscWord.CDocumentBounds(30, 20, 195, 20 + AscTest.FontHeight), "Check page bounds of the paragraph");

		const charWidth = AscTest.CharWidth * AscTest.FontSize;

		let y = 20 + AscTest.FontHeight / 2;
		let x = 30 + charWidth * 4.5;

		AscTest.SetFillingFormMode(false);

		AscTest.ClickMouseButton(x, y, 0, false, 2);
		assert.strictEqual(logicDocument.GetSelectedText(), "abc def", "Check double click in first subform");

		AscTest.ClickMouseButton(x, y, 0, false, 3);
		assert.strictEqual(logicDocument.GetSelectedText(), "111abc def222ABC DEF333 444", "Check triple click in first subform");

		x = 30 + charWidth * 22.5;
		AscTest.ClickMouseButton(x, y, 0, false, 2);
		assert.strictEqual(logicDocument.GetSelectedText(), "333 ", "Check double click outside all subforms");

		AscTest.ClickMouseButton(x, y, 0, false, 3);
		assert.strictEqual(logicDocument.GetSelectedText(), "111abc def222ABC DEF333 444", "Check triple click outside all subforms");
	});
});
