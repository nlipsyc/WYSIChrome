/*!
* CSSViewer, A Google Chrome Extension for fellow web developers, web designers, and hobbyists.
*
* https://github.com/miled/cssviewer
* https://chrome.google.com/webstore/detail/cssviewer/ggfgijbpiheegefliciemofobhmofgce
*
* Copyright (c) 2006, 2008 Nicolas Huon 
*
* This source code is licensed under the GNU General Public License,
* Version 2. See the file COPYING for more details.
*/

// Roadmap/ToDos
//    1. Make the initial code more readable 
//    2. Comment the initial code
//    3. Fix issues if any
//    4. Add new features (feasible and useful ones)
//    5. Make a new branch and start re-factoring the entire code

/*
** Globals
*/

var CSSViewer_element

var CSSViewer_element_cssDefinition

var CSSViewer_container

var CSSViewer_current_element

// CSS Properties
var CSSViewer_pFont = new Array(
	'font-family', 
	'font-size', 
	'font-style', 
	'font-variant', 
	'font-weight', 
	'letter-spacing', 
	'line-height', 
	'text-decoration', 
	'text-align', 
	'text-indent', 
	'text-transform', 
	'vertical-align', 
	'white-space', 
	'word-spacing'
	);

var CSSViewer_pColorBg = new Array(
	'background-attachment', 
	'background-color', 
	'background-image',
	'background-position',
	'background-repeat',
	'color'
	);

var CSSViewer_pBox = new Array(
	'height',
	'width',
	'border',
	'border-top',
	'border-right',
	'border-bottom', 
	'border-left',
	'margin',
	'padding',
	'max-height',
	'min-height',
	'max-width',
	'min-width'
	);

var CSSViewer_pPositioning = new Array(
	'position', 
	'top', 
	'bottom', 
	'right', 
	'left', 
	'float', 
	'display', 
	'clear', 
	'z-index'
	);

var CSSViewer_pList = new Array(
	'list-style-image', 
	'list-style-type', 
	'list-style-position'
	);

var CSSViewer_pTable = new Array(
	'border-collapse',
	'border-spacing',
	'caption-side',
	'empty-cells',
	'table-layout'
	);

var CSSViewer_pMisc = new Array(
	'overflow', 
	'cursor', 
	'visibility'
	);

var CSSViewer_pEffect = new Array(
	'transform',
	'transition',
	'outline',
	'outline-offset',
	'box-sizing',
	'resize',
	'text-shadow',
	'text-overflow',
	'word-wrap',
	'box-shadow',
	'border-top-left-radius',
	'border-top-right-radius',
	'border-bottom-left-radius',
	'border-bottom-right-radius'
	);

// CSS Property categories
var CSSViewer_categories = { 
	'pFontText'    : CSSViewer_pFont, 
	'pColorBg'     : CSSViewer_pColorBg, 
	'pBox'         : CSSViewer_pBox, 
	'pPositioning' : CSSViewer_pPositioning, 
	'pList'        : CSSViewer_pList, 
	'pTable'       : CSSViewer_pTable, 
	'pMisc'        : CSSViewer_pMisc, 
	'pEffect'      : CSSViewer_pEffect 
};

var CSSViewer_categoriesTitle = { 
	'pFontText'    : 'Font & Text', 
	'pColorBg'     : 'Color & Background', 
	'pBox'         : 'Box', 
	'pPositioning' : 'Positioning', 
	'pList'        : 'List', 
	'pTable'       : 'Table', 
	'pMisc'        : 'Miscellaneous', 
	'pEffect'      : 'Effects' 
};

// Table tagnames
var CSSViewer_tableTagNames = new Array(
	'TABLE',
	'CAPTION',
	'THEAD',
	'TBODY',
	'TFOOT',
	'COLGROUP',
	'COL',
	'TR',
	'TH',
	'TD'
	);

var CSSViewer_listTagNames = new Array(
	'UL',
	'LI',
	'DD',
	'DT',
	'OL'
	);

// Hexadecimal
var CSSViewer_hexa = new Array(
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F'
	);

/*
** Utils
*/

function GetCurrentDocument()
{
	return window.document;
}

function IsInArray(array, name)
{
	for (var i = 0; i < array.length; i++) {
		if (name == array[i])
			return true;
	}

	return false;
}

function DecToHex(nb)
{
	var nbHexa = '';

	nbHexa += CSSViewer_hexa[Math.floor(nb / 16)];
	nb = nb % 16;
	nbHexa += CSSViewer_hexa[nb];
	
	return nbHexa;
}

function RGBToHex(str)
{
	var start = str.search(/\(/) + 1;
	var end = str.search(/\)/);

	str = str.slice(start, end);

	var hexValues = str.split(', ');
	var hexStr = '#'; 

	for (var i = 0; i < hexValues.length; i++) {
		hexStr += DecToHex(hexValues[i]);
	}

	if( hexStr == "#00000000" ){
		hexStr = "#FFFFFF";
	}

	hexStr = '<span style="border: 1px solid #000000 !important;width: 8px !important;height: 8px !important;display: inline-block !important;background-color:'+ hexStr +' !important;"></span> ' + hexStr;

	return hexStr;
}

function GetFileName(str)
{
	var start = str.search(/\(/) + 1;
	var end = str.search(/\)/);

	str = str.slice(start, end);

	var path = str.split('/');

	return path[path.length - 1];
}

function RemoveExtraFloat(nb)
{
	nb = nb.substr(0, nb.length - 2);

	return Math.round(nb) + 'px';
}

/*
* CSSFunc
*/

function GetCSSProperty(element, property)
{
	return element.getPropertyValue(property);
}

function SetCSSProperty(element, property)
{
	var document = GetCurrentDocument();
	var li = document.getElementById('CSSViewer_' + property);

	li.lastChild.innerHTML = " : " + element.getPropertyValue(property);
}

function SetCSSPropertyIf(element, property, condition)
{
	var document = GetCurrentDocument();
	var li = document.getElementById('CSSViewer_' + property);

	if (condition) {
		li.lastChild.innerHTML = " : " + element.getPropertyValue(property);
		li.style.display = 'block';

		return 1;
	}
	else {
		li.style.display = 'none';

		return 0;
	}
}

function SetCSSPropertyValue(element, property, value)
{
	var document = GetCurrentDocument();
	var li = document.getElementById('CSSViewer_' + property);

	li.lastChild.innerHTML = " : " + value;
	li.style.display = 'block';
}

function SetCSSPropertyValueIf(element, property, value, condition)
{
	var document = GetCurrentDocument();
	var li = document.getElementById('CSSViewer_' + property);

	if (condition) {
		li.lastChild.innerHTML = " : " + value;
		li.style.display = 'block';

		return 1;
	}
	else {
		li.style.display = 'none';

		return 0;
	}
}

function HideCSSProperty(property)
{
	var document = GetCurrentDocument();
	var li = document.getElementById('CSSViewer_' + property);

	li.style.display = 'none';
}

function HideCSSCategory(category)
{
	var document = GetCurrentDocument();
	var div = document.getElementById('CSSViewer_' + category);

	div.style.display = 'none';
}

function ShowCSSCategory(category)
{
	var document = GetCurrentDocument();
	var div = document.getElementById('CSSViewer_' + category);

	div.style.display = 'block';
}

function UpdatefontText(element)
{
	// Font
	SetCSSProperty(element, 'font-family');
	SetCSSProperty(element, 'font-size');

	SetCSSPropertyIf(element, 'font-weight'    , GetCSSProperty(element, 'font-weight') != '400');
	SetCSSPropertyIf(element, 'font-variant'   , GetCSSProperty(element, 'font-variant') != 'normal');
	SetCSSPropertyIf(element, 'font-style'     , GetCSSProperty(element, 'font-style') != 'normal');
	
	// Text
	SetCSSPropertyIf(element, 'letter-spacing' , GetCSSProperty(element, 'letter-spacing') != 'normal');
	SetCSSPropertyIf(element, 'line-height'    , GetCSSProperty(element, 'line-height') != 'normal');
	SetCSSPropertyIf(element, 'text-decoration', GetCSSProperty(element, 'text-decoration') != 'none');
	SetCSSPropertyIf(element, 'text-align'     , GetCSSProperty(element, 'text-align') != 'start');
	SetCSSPropertyIf(element, 'text-indent'    , GetCSSProperty(element, 'text-indent') != '0px');
	SetCSSPropertyIf(element, 'text-transform' , GetCSSProperty(element, 'text-transform') != 'none');
	SetCSSPropertyIf(element, 'vertical-align' , GetCSSProperty(element, 'vertical-align') != 'baseline');
	SetCSSPropertyIf(element, 'white-space'    , GetCSSProperty(element, 'white-space') != 'normal');
	SetCSSPropertyIf(element, 'word-spacing'   , GetCSSProperty(element, 'word-spacing') != 'normal');
}

function UpdateColorBg(element)
{
	// Color
	SetCSSPropertyValue(element, 'color', RGBToHex(GetCSSProperty(element, 'color')));

	// Background
	SetCSSPropertyValueIf(element, 'background-color', RGBToHex(GetCSSProperty(element, 'background-color')), GetCSSProperty(element, 'background-color') != 'transparent');
	SetCSSPropertyIf(element, 'background-attachment', GetCSSProperty(element, 'background-attachment') != 'scroll');
	SetCSSPropertyValueIf(element, 'background-image', GetFileName(GetCSSProperty(element, 'background-image')), GetCSSProperty(element, 'background-image') != 'none');
	SetCSSPropertyIf(element, 'background-position'  , GetCSSProperty(element, 'background-position') != '');
	SetCSSPropertyIf(element, 'background-repeat'    , GetCSSProperty(element, 'background-repeat') != 'repeat');
}

function UpdateBox(element)
{
	// Width/Height
	SetCSSPropertyIf(element, 'height', RemoveExtraFloat(GetCSSProperty(element, 'height')) != 'auto');
	SetCSSPropertyIf(element, 'width', RemoveExtraFloat(GetCSSProperty(element, 'width')) != 'auto');

	// Border
	var borderTop    = RemoveExtraFloat(GetCSSProperty(element, 'border-top-width')) + ' ' + GetCSSProperty(element, 'border-top-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-top-color'));
	var borderBottom = RemoveExtraFloat(GetCSSProperty(element, 'border-bottom-width')) + ' ' + GetCSSProperty(element, 'border-bottom-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-bottom-color'));
	var borderRight  = RemoveExtraFloat(GetCSSProperty(element, 'border-right-width')) + ' ' + GetCSSProperty(element, 'border-right-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-right-color'));
	var borderLeft   = RemoveExtraFloat(GetCSSProperty(element, 'border-left-width')) + ' ' + GetCSSProperty(element, 'border-left-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-left-color'));

	if (borderTop == borderBottom && borderBottom == borderRight && borderRight == borderLeft && GetCSSProperty(element, 'border-top-style') != 'none') {
		SetCSSPropertyValue(element, 'border', borderTop);

		HideCSSProperty('border-top');
		HideCSSProperty('border-bottom');
		HideCSSProperty('border-right');
		HideCSSProperty('border-left');
	}
	else {
		SetCSSPropertyValueIf(element, 'border-top'   , borderTop   , GetCSSProperty(element, 'border-top-style') != 'none');
		SetCSSPropertyValueIf(element, 'border-bottom', borderBottom, GetCSSProperty(element, 'border-bottom-style') != 'none');
		SetCSSPropertyValueIf(element, 'border-right' , borderRight , GetCSSProperty(element, 'border-right-style') != 'none');
		SetCSSPropertyValueIf(element, 'border-left'  , borderLeft  , GetCSSProperty(element, 'border-left-style') != 'none');

		HideCSSProperty('border');
	}
	
	// Margin
	var marginTop    = RemoveExtraFloat(GetCSSProperty(element, 'margin-top'));
	var marginBottom = RemoveExtraFloat(GetCSSProperty(element, 'margin-bottom'));
	var marginRight  = RemoveExtraFloat(GetCSSProperty(element, 'margin-right'));
	var marginLeft   = RemoveExtraFloat(GetCSSProperty(element, 'margin-left'));
	var margin       = (marginTop == '0px' ? '0' : marginTop) + ' ' + (marginRight == '0px' ? '0' : marginRight) + ' '  + (marginBottom == '0px' ? '0' : marginBottom) + ' '  + (marginLeft == '0px' ? '0' : marginLeft);

	SetCSSPropertyValueIf(element, 'margin', margin, margin != '0 0 0 0');

	// padding
	var paddingTop    = RemoveExtraFloat(GetCSSProperty(element, 'padding-top'));
	var paddingBottom = RemoveExtraFloat(GetCSSProperty(element, 'padding-bottom'));
	var paddingRight  = RemoveExtraFloat(GetCSSProperty(element, 'padding-right'));
	var paddingLeft   = RemoveExtraFloat(GetCSSProperty(element, 'padding-left'));
	var padding       = (paddingTop == '0px' ? '0' : paddingTop) + ' ' + (paddingRight == '0px' ? '0' : paddingRight) + ' '  + (paddingBottom == '0px' ? '0' : paddingBottom) + ' '  + (paddingLeft == '0px' ? '0' : paddingLeft);

	SetCSSPropertyValueIf(element, 'padding', padding, padding != '0 0 0 0');

	// Max/Min Width/Height
	SetCSSPropertyIf(element, 'min-height', GetCSSProperty(element, 'min-height') != '0px');
	SetCSSPropertyIf(element, 'max-height', GetCSSProperty(element, 'max-height') != 'none');
	SetCSSPropertyIf(element, 'min-width' , GetCSSProperty(element, 'min-width') != '0px');
	SetCSSPropertyIf(element, 'max-width' , GetCSSProperty(element, 'max-width') != 'none');
}

function UpdatePositioning(element)
{
	SetCSSPropertyIf(element, 'position', GetCSSProperty(element, 'position') != 'static');
	SetCSSPropertyIf(element, 'top'     , GetCSSProperty(element, 'top') != 'auto');
	SetCSSPropertyIf(element, 'bottom'  , GetCSSProperty(element, 'bottom') != 'auto');
	SetCSSPropertyIf(element, 'right'   , GetCSSProperty(element, 'right') != 'auto');
	SetCSSPropertyIf(element, 'left'    , GetCSSProperty(element, 'left') != 'auto');
	SetCSSPropertyIf(element, 'float'   , GetCSSProperty(element, 'float') != 'none');

	SetCSSProperty(element, 'display');

	SetCSSPropertyIf(element, 'clear'   , GetCSSProperty(element, 'clear') != 'none');
	SetCSSPropertyIf(element, 'z-index' , GetCSSProperty(element, 'z-index') != 'auto');
}

function UpdateTable(element, tagName)
{
	if (IsInArray(CSSViewer_tableTagNames, tagName)) {
		var nbProperties = 0;

		nbProperties += SetCSSPropertyIf(element, 'border-collapse', GetCSSProperty(element, 'border-collapse') != 'separate');
		nbProperties += SetCSSPropertyIf(element, 'border-spacing' , GetCSSProperty(element, 'border-spacing') != '0px 0px');
		nbProperties += SetCSSPropertyIf(element, 'caption-side'   , GetCSSProperty(element, 'caption-side') != 'top');
		nbProperties += SetCSSPropertyIf(element, 'empty-cells'    , GetCSSProperty(element, 'empty-cells') != 'show');
		nbProperties += SetCSSPropertyIf(element, 'table-layout'   , GetCSSProperty(element, 'table-layout') != 'auto');

		if (nbProperties > 0)
			ShowCSSCategory('pTable');
		else
			HideCSSCategory('pTable');
	}
	else {
		HideCSSCategory('pTable');
	}
}

function UpdateList(element, tagName)
{
	if (IsInArray(CSSViewer_listTagNames, tagName)) {
		ShowCSSCategory('pList');

		var listStyleImage = GetCSSProperty(element, 'list-style-image');

		if (listStyleImage == 'none') {
			SetCSSProperty(element, 'list-style-type');
			HideCSSProperty('list-style-image');
		}
		else {
			SetCSSPropertyValue(element, 'list-style-image', listStyleImage);
			HideCSSProperty('list-style-type');
		}

		SetCSSProperty(element, 'list-style-position');
	}
	else {
		HideCSSCategory('pList');
	}
}

function UpdateMisc(element)
{
	var nbProperties = 0;

	nbProperties += SetCSSPropertyIf(element, 'overflow'  , GetCSSProperty(element, 'overflow') != 'visible');
	nbProperties += SetCSSPropertyIf(element, 'cursor'    , GetCSSProperty(element, 'cursor') != 'auto');
	nbProperties += SetCSSPropertyIf(element, 'visibility', GetCSSProperty(element, 'visibility') != 'visible'); 

	if (nbProperties > 0)
		ShowCSSCategory('pMisc');
	else
		HideCSSCategory('pMisc');
}

function UpdateEffects(element)
{
	var nbProperties = 0;

	nbProperties += SetCSSPropertyIf(element, 'transform'                 , GetCSSProperty(element, 'transform') ); 
	nbProperties += SetCSSPropertyIf(element, 'transition'                , GetCSSProperty(element, 'transition') ); 
	nbProperties += SetCSSPropertyIf(element, 'outline'                   , GetCSSProperty(element, 'outline') ); 
	nbProperties += SetCSSPropertyIf(element, 'outline-offset'            , GetCSSProperty(element, 'outline-offset') != '0px'); 
	nbProperties += SetCSSPropertyIf(element, 'box-sizing'                , GetCSSProperty(element, 'box-sizing') != 'content-box'); 
	nbProperties += SetCSSPropertyIf(element, 'resize'                    , GetCSSProperty(element, 'resize') != 'none'); 

	nbProperties += SetCSSPropertyIf(element, 'text-shadow'               , GetCSSProperty(element, 'text-shadow') != 'none'); 
	nbProperties += SetCSSPropertyIf(element, 'text-overflow'             , GetCSSProperty(element, 'text-overflow') != 'clip'); 
	nbProperties += SetCSSPropertyIf(element, 'word-wrap'                 , GetCSSProperty(element, 'word-wrap') != 'normal'); 
	nbProperties += SetCSSPropertyIf(element, 'box-shadow'                , GetCSSProperty(element, 'box-shadow') != 'none');  

	nbProperties += SetCSSPropertyIf(element, 'border-top-left-radius'    , GetCSSProperty(element, 'border-top-left-radius') != '0px'); 
	nbProperties += SetCSSPropertyIf(element, 'border-top-right-radius'   , GetCSSProperty(element, 'border-top-right-radius') != '0px'); 
	nbProperties += SetCSSPropertyIf(element, 'border-bottom-left-radius' , GetCSSProperty(element, 'border-bottom-left-radius') != '0px'); 
	nbProperties += SetCSSPropertyIf(element, 'border-bottom-right-radius', GetCSSProperty(element, 'border-bottom-right-radius') != '0px'); 

	if (nbProperties > 0)
		ShowCSSCategory('pEffect');
	else
		HideCSSCategory('pEffect');
}

// @WYSIChrome @todo muck about with this to allow for mouse selection in context menu
/*
** Event Handlers
*/

function CSSViewerMouseOver(e)
{
	// Block
	var document = GetCurrentDocument();
	var block = document.getElementById('CSSViewer_block');

	if( ! block ){
		return;
	}

	block.firstChild.innerHTML = '&lt;' + this.tagName + '&gt;' + (this.id == '' ? '' : ' #' + this.id) + (this.className == '' ? '' : ' .' + this.className);

	// Outline element
	if (this.tagName != 'body') {
		this.style.outline = '1px dashed #f00';
		CSSViewer_current_element = this;
	}
	
	// Updating CSS properties
	var element = document.defaultView.getComputedStyle(this, null);

	UpdatefontText(element);
	UpdateColorBg(element);
	UpdateBox(element);
	UpdatePositioning(element);
	UpdateTable(element, this.tagName);
	UpdateList(element, this.tagName);
	UpdateMisc(element);
	UpdateEffects(element);

	CSSViewer_element = this;

	cssViewerRemoveElement("cssViewerInsertMessage");

	e.stopPropagation();

	// generate simple css definition
	CSSViewer_element_cssDefinition = this.tagName.toLowerCase() + (this.id == '' ? '' : ' #' + this.id) + (this.className == '' ? '' : ' .' + this.className) + " {\n";

	CSSViewer_element_cssDefinition += "\t/* Font & Text */\n"; 
	for (var i = 0; i < CSSViewer_pFont.length; i++)
		CSSViewer_element_cssDefinition += "\t" + CSSViewer_pFont[i] + ': ' + element.getPropertyValue( CSSViewer_pFont[i] ) + ";\n";

	CSSViewer_element_cssDefinition += "\n\t/* Color & Background */\n";
	for (var i = 0; i < CSSViewer_pColorBg.length; i++)
		CSSViewer_element_cssDefinition += "\t" + CSSViewer_pColorBg[i] + ': ' + element.getPropertyValue( CSSViewer_pColorBg[i] ) + ";\n";

	CSSViewer_element_cssDefinition += "\n\t/* Box */\n";
	for (var i = 0; i < CSSViewer_pBox.length; i++)
		CSSViewer_element_cssDefinition += "\t" + CSSViewer_pBox[i] + ': ' + element.getPropertyValue( CSSViewer_pBox[i] ) + ";\n";

	CSSViewer_element_cssDefinition += "\n\t/* Positioning */\n";
	for (var i = 0; i < CSSViewer_pPositioning.length; i++)
		CSSViewer_element_cssDefinition += "\t" + CSSViewer_pPositioning[i] + ': ' + element.getPropertyValue( CSSViewer_pPositioning[i] ) + ";\n";

	CSSViewer_element_cssDefinition += "\n\t/* List */\n";
	for (var i = 0; i < CSSViewer_pList.length; i++)
		CSSViewer_element_cssDefinition += "\t" + CSSViewer_pList[i] + ': ' + element.getPropertyValue( CSSViewer_pList[i] ) + ";\n";

	CSSViewer_element_cssDefinition += "\n\t/* Table */\n";
	for (var i = 0; i < CSSViewer_pTable.length; i++)
		CSSViewer_element_cssDefinition += "\t" + CSSViewer_pTable[i] + ': ' + element.getPropertyValue( CSSViewer_pTable[i] ) + ";\n";

	CSSViewer_element_cssDefinition += "\n\t/* Miscellaneous */\n";
	for (var i = 0; i < CSSViewer_pMisc.length; i++)
		CSSViewer_element_cssDefinition += "\t" + CSSViewer_pMisc[i] + ': ' + element.getPropertyValue( CSSViewer_pMisc[i] ) + ";\n";

	CSSViewer_element_cssDefinition += "\n\t/* Effects */\n"; 
	for (var i = 0; i < CSSViewer_pEffect.length; i++)
		CSSViewer_element_cssDefinition += "\t" + CSSViewer_pEffect[i] + ': ' + element.getPropertyValue( CSSViewer_pEffect[i] ) + ";\n";

	CSSViewer_element_cssDefinition += "}";

	// console.log( element.cssText ); //< debug the hovered el css
}

function CSSViewerMouseOut(e)
{
	this.style.outline = '';

	e.stopPropagation();
}

function CSSViewerMouseMove(e)
{
	var document = GetCurrentDocument();
	var block = document.getElementById('CSSViewer_block');

	if( ! block ){
		return;
	}

	block.style.display = 'block';
	
	var pageWidth = window.innerWidth;
	var pageHeight = window.innerHeight;
	var blockWidth = 332;
	var blockHeight = document.defaultView.getComputedStyle(block, null).getPropertyValue('height');

	blockHeight = blockHeight.substr(0, blockHeight.length - 2) * 1;

	if ((e.pageX + blockWidth) > pageWidth) {
		if ((e.pageX - blockWidth - 10) > 0)
			block.style.left = e.pageX - blockWidth - 40 + 'px';
		else
			block.style.left = 0 + 'px';
	}
	else
		block.style.left = (e.pageX + 20) + 'px';

	if ((e.pageY + blockHeight) > pageHeight) {
		if ((e.pageY - blockHeight - 10) > 0)
			block.style.top = e.pageY - blockHeight - 20 + 'px';
		else
			block.style.top = 0 + 'px';
	}
	else
		block.style.top = (e.pageY + 20) + 'px';

	// adapt block top to screen offset
	inView = CSSViewerIsElementInViewport(block);

	if( ! inView )
		block.style.top = ( window.pageYOffset  + 20 ) + 'px';

	e.stopPropagation();
}

// http://stackoverflow.com/a/7557433
function CSSViewerIsElementInViewport(el) {
	var rect = el.getBoundingClientRect();

	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
}

/*
* CSSViewer Class
*/
function CSSViewer()
{
	// Create a block to display informations
	this.CreateBlock = function() {
		var document = GetCurrentDocument();
		var block;
		
		if (document) {
			// Create a div block
			block = document.createElement('div');
			block.id = 'CSSViewer_block';
			
			// Insert a title for CSS selector
			var header = document.createElement('h1');

			header.appendChild(document.createTextNode(''));
			block.appendChild(header);
			
			// Insert all properties
			var center = document.createElement('div');

			center.id = 'CSSViewer_center';

			for (var cat in CSSViewer_categories) {
				var div = document.createElement('div');

				div.id = 'CSSViewer_' + cat;
				div.className = 'CSSViewer_category';

				var h2 = document.createElement('h2');

				h2.appendChild(document.createTextNode(CSSViewer_categoriesTitle[cat]));

				var ul = document.createElement('ul');
				var properties = CSSViewer_categories[cat];

				for (var i = 0; i < properties.length; i++) {
					var li = document.createElement('li');

					li.id = 'CSSViewer_' + properties[i];

					var spanName = document.createElement('span');

					spanName.className = 'CSSViewer_property';

					var spanValue = document.createElement('span');

					spanName.appendChild(document.createTextNode(properties[i]));
					li.appendChild(spanName);
					li.appendChild(spanValue);
					ul.appendChild(li);
				}

				div.appendChild(h2);
				div.appendChild(ul);
				center.appendChild(div);
			}

			block.appendChild(center);

			// Insert a footer
			var footer = document.createElement('div');

			footer.id = 'CSSViewer_footer';

			//< 
			footer.appendChild( document.createTextNode('CSSViewer 1.6') ); 
			block.appendChild(footer);
		}
		
		cssViewerInsertMessage( "CSSViewer loaded! Hover any element you want to inspect in the page." );

		return block;
	}
	
	// Get all elements within the given element
	this.GetAllElements = function(element)
	{
		var elements = new Array();

		if (element && element.hasChildNodes()) {
			elements.push(element);

			var childs = element.childNodes;

			for (var i = 0; i < childs.length; i++) {
				if (childs[i].hasChildNodes()) {
					elements = elements.concat(this.GetAllElements(childs[i]));
				}
				else if (childs[i].nodeType == 1) {
					elements.push(childs[i]);
				}
			}
		}

		return elements;
	}
	
	// Add event listeners for all elements in the current document
	this.AddEventListeners = function()
	{
		var document = GetCurrentDocument();
		var elements = this.GetAllElements(document.body);

		for (var i = 0; i < elements.length; i++)	{
			elements[i].addEventListener("mouseover", CSSViewerMouseOver, false);
			elements[i].addEventListener("mouseout", CSSViewerMouseOut, false);
			elements[i].addEventListener("mousemove", CSSViewerMouseMove, false);
		}	
	}
	
	// Remove event listeners for all elements in the current document
	this.RemoveEventListeners = function()
	{
		var document = GetCurrentDocument();
		var elements = this.GetAllElements(document.body);

		for (var i = 0; i < elements.length; i++){
			elements[i].removeEventListener("mouseover", CSSViewerMouseOver, false);
			elements[i].removeEventListener("mouseout", CSSViewerMouseOut, false);
			elements[i].removeEventListener("mousemove", CSSViewerMouseMove, false);
		}	
	}

	// Set the title of the block
	this.SetTitle = function()
	{}
	
	// Add a stylesheet to the current document
	this.AddCSS = function(cssFile)
	{
		var document = GetCurrentDocument();
		var link = document.createElement("link");

		link.setAttribute("href", cssFile);
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");

		var heads = document.getElementsByTagName("head");

		if(heads.length > 0)
			heads[0].appendChild(link);
		else
			document.documentElement.appendChild(link);
	}
	
	this.RemoveCSS = function(cssFile)
	{
		var document = GetCurrentDocument();
		var links = document.getElementsByTagName('link');

		for (var i = 0; i < links.length; i++) {
			if (links[i].rel == "stylesheet" && links[i].href == cssFile) {
				var heads = document.getElementsByTagName("head");

				if(heads.length > 0) {
					heads[0].removeChild(links[i]);
				}

				return;
			}
		}
	}
}

/*
* Check if CSSViewer is enabled
*/
CSSViewer.prototype.IsEnabled = function()
{
	var document = GetCurrentDocument();

	if (document.getElementById('CSSViewer_block')) {
		return true;
	}

	return false;
}

/*
* Enable CSSViewer
*/
CSSViewer.prototype.Enable = function()
{
	var document = GetCurrentDocument();
	var block = document.getElementById('CSSViewer_block');

	if (!block){
		block = this.CreateBlock();
		document.body.appendChild(block);
		this.AddEventListeners();

		return true;
	}

	return false;
}

/*
* Disable CSSViewer
*/
CSSViewer.prototype.Disable = function()
{
	var document = GetCurrentDocument();
	var block = document.getElementById('CSSViewer_block');

	if (block) {
		document.body.removeChild(block); 
		this.RemoveEventListeners();

		return true;
	}

	return false;
}

/*
* Display the notification message
*/
function cssViewerInsertMessage( msg )
{
	var oNewP = document.createElement("p");
	var oText = document.createTextNode( msg );

	oNewP.appendChild(oText);
	oNewP.id                    = 'cssViewerInsertMessage';
	oNewP.style.backgroundColor = '#b40000';
	oNewP.style.color           = '#ffffff';
	oNewP.style.position        = "absolute";
	oNewP.style.top             = '10px';
	oNewP.style.left            = '10px';
	oNewP.style.zIndex          = '100';
	oNewP.style.padding         = '3px';

	// https://github.com/miled/cssviewer/issues/5
	// https://github.com/miled/cssviewer/issues/6
	// var beforeMe = document.getElementsByTagName("body");
	// document.body.insertBefore( oNewP, beforeMe[0] );

	// https://github.com/zchee/cssviewer/commit/dad107d27e94aabeb6e11b935ad28c4ff251f895
	document.body.appendChild(oNewP);
}

/*
* Removes and element from the dom, used to remove the notification message
*/
function cssViewerRemoveElement(divid)
{   
	var n = document.getElementById(divid);

	if(n){
		document.body.removeChild(n); 
	}
}


// @WISYChrome output CSS selectors here
/*
* Copy current element css to chrome console
*/
function cssViewerCopyCssToConsole(type)
{   
	function deepSelector(child){
		var target = child;
		var els = [];
		var cssPath = [];
		while (target) {
			els.unshift(target);
			cssPath.unshift(getSelectors(target));
			target = target.parentNode;
		}

		cssPath = cssPath.join(' > ');
		return child ? cssPath : "Invalid element selected";

		function getSelectors(el){ 
			var selector = el.nodeName.toLowerCase();
			if (el.id) {
				selector += ' #' + el.id;
			} 
			if (el.className){
					//@WHYSIChrome filtering out the hover classes, check what the output is, filter for '.'? ' '? just the straight word?
					selector += ' .' + el.className.replace(/\s+hover|hover/g,"").replace(/\s+/g, " .");
				}

				return selector;

			}

		}

	//@WISYChrome use this regesx to get rid of weird stuff   :not\(\.[^)]*\) 
	// also replace ", ." with " ."  NON REGEX

	function cSInfo(el){
	
		// console.log('EL', el);
		var tpl = {},
		cursorClasses,
		alertText = ['--Hit shift+ctrl+i to view this in the console--'],
		matches = {};
		for (template in cSTemplates){
			tpl[template] = CSSJSON.toJSON(cSTemplates[template]);
		}
		cursorClasses = el.match(/\.\w\S*/g);

		function scanTpl(template){
            var currentTpl = tpl[template].children;
            for(var key in currentTpl){										//For each option in the template
                if (currentTpl.hasOwnProperty(key) && key.match(/\.\w+/g)){	//That has classes

                	var tplClasses = key.match(/\.\w+/g);					//Pull out the classes
                	// console.log('****Tpl Classes***', tplClasses)
                		// match = match.filter(							//Clean out the nulls
                		// 			function(n){ 
                		// 			return n != null 
                		// 		}); 
                	for (var i = tplClasses.length - 1; i >= 0; i--) {		//Itterate through each


                		for (var j=cursorClasses.length - 1; j >=0 ; j--){	//Itterate through each classes on page
                			if (tplClasses[i] == cursorClasses[j]){
                				// console.log('MATCH ON ', tplClasses, tplClasses[i]);
                				break;
                			}
                			else if (j == 0){
                				// console.log('Apararent lack of match on', tplClasses[i], cursorClasses[j])
                				i = -1; 								//Abandon this tpl
                			}
                		}           		             	
                		if (i==0){
                			alertText.push('***** Selector(s) found *****\n' + key + '\n***** Options bellow *****');
                			for (atr in currentTpl[key].attributes){
 	                			
                				//This bit was for implementing an alert box that delivered the info.  Now deprecated
 	                			alertText.push('To change ' + atr + ':\ngo to ' + currentTpl[key].attributes[atr]);
 	                			//End deprecated

 	                			//For logging results to console as objects
        						matches[template] = {};

 	                			matches[template][atr] = currentTpl[key]["attributes"][atr];

                			}

                		}
                	}
					  // console.log('key', key, 'match', key.match(/\.\w+/g), 'atributes ', JSON.stringify(tpl[key].attributes));

					}
				}
			}
			
			for (template in tpl){
		//	console.log('template', tpl, 'template.children new', cSTemplates[template].children);
			alertText.push('      -/|\\-/|\\-/|\\-/|\\- ' + template + ' -/|\\-/|\\-/|\\-/|\\-')

			scanTpl(template);

		}

		console.log('-/|\\-/|\\-/|\\-/|\\- Colours and Smiles -/|\\-/|\\-/|\\-/|\\-', matches);	

		// console.log(alertText); 								
		//	window.alert(alertText.join('\n'));							Alert text was too long to fit.  Comment back in if you decide to go with "select a theme -> alert" flow

}

if( 'coloursAndSmiles' == type) return  cSInfo(deepSelector(CSSViewer_element));

if( 'parents' == type ) return console.log( "This is the C&S info" , cSInfo(deepSelector(CSSViewer_element)) );
if( 'el' == type ) return console.log( CSSViewer_element );
if( 'id' == type ) return console.log( CSSViewer_element.id );
if( 'tagName' == type ) return console.log( CSSViewer_element.tagName );
if( 'className' == type ) return console.log( CSSViewer_element.className );
if( 'style' == type ) return console.log( CSSViewer_element.style ); 
if( 'cssText' == type ) return console.log( document.defaultView.getComputedStyle(CSSViewer_element, null).cssText );
if( 'getComputedStyle' == type ) return console.log( document.defaultView.getComputedStyle(CSSViewer_element, null) );
if( 'simpleCssDefinition' == type ) return console.log( CSSViewer_element_cssDefinition );
}

/*
 *  Close css viewer on clicking 'esc' key
 */
 function closeCssViewer(e) {
	// Close the css viewer if the cssViewer is enabled.
	if ( e.keyCode === 27 && cssViewer.IsEnabled() ){
		// Remove the red outline
		CSSViewer_current_element.style.outline = '';
		cssViewer.Disable();
	}	
}


/*
* CSSViewer entry-point
*/
cssViewer = new CSSViewer();

if ( cssViewer.IsEnabled() ){
	cssViewer.Disable();  
}
else{
	cssViewer.Enable(); 
}

// Set event handler for esc key - To close the CssViewer popup
document.onkeydown = closeCssViewer;

////////
// @WYSIChrome Horible mess until figure out how to link files into here
////////

// var terra = "body{    background: General_formatting-Backgrounds-Site-Background_image;}body{    background-color: General_formatting-Backgrounds-Site-Background_color;    background-position: General_formatting-Backgrounds-Site-Background_position;    background-repeat: General_formatting-Backgrounds-Site-Background_repeat;}.zoneHeaderOuter{    background-color: General_formatting-Backgrounds-Outer_header-Background_color;    background-image: General_formatting-Backgrounds-Outer_header-Background_image;    background-position: General_formatting-Backgrounds-Outer_header-Background_position;    background-repeat: General_formatting-Backgrounds-Outer_header-Background_repeat;}.zoneHeaderOuter .container_12 > DIV{    background-color: General_formatting-Backgrounds-Header-Background_color;    background-image: General_formatting-Backgrounds-Header-Background_image;    background-position: General_formatting-Backgrounds-Header-Background_position;    background-repeat: General_formatting-Backgrounds-Header-Background_repeat;}.zoneHeader1Outer{    background-color: General_formatting-Backgrounds-Outer_header_1-Background_color;    background-image: General_formatting-Backgrounds-Outer_header_1-Background_image;    background-position: General_formatting-Backgrounds-Outer_header_1-Background_position;    background-repeat: General_formatting-Backgrounds-Outer_header_1-Background_repeat;}.zoneHeader1Outer .container_12 > DIV{    background-color: General_formatting-Backgrounds-Header_1-Background_color;    background-image: General_formatting-Backgrounds-Header_1-Background_image;    background-position: General_formatting-Backgrounds-Header_1-Background_position;    background-repeat: General_formatting-Backgrounds-Header_1-Background_repeat;}.zoneHeader2Outer{    background-color: General_formatting-Backgrounds-Outer_header_2-Background_color;    background-image: General_formatting-Backgrounds-Outer_header_2-Background_image;    background-position: General_formatting-Backgrounds-Outer_header_2-Background_position;    background-repeat: General_formatting-Backgrounds-Outer_header_2-Background_repeat;}.zoneHeader2Outer .container_12 > DIV{    background-color: General_formatting-Backgrounds-Header_2-Background_color;    background-image: General_formatting-Backgrounds-Header_2-Background_image;    background-position: General_formatting-Backgrounds-Header_2-Background_position;    background-repeat: General_formatting-Backgrounds-Header_2-Background_repeat;}.zoneContentOuter{    background-color: General_formatting-Backgrounds-Outer_content-Background_color;    background-image: General_formatting-Backgrounds-Outer_content-Background_image;    background-position: General_formatting-Backgrounds-Outer_content-Background_position;    background-repeat: General_formatting-Backgrounds-Outer_content-Background_repeat;}.zoneContentOuter .container_12 > DIV{    background-color: General_formatting-Backgrounds-Content-Background_color;    background-image: General_formatting-Backgrounds-Content-Background_image;    background-position: General_formatting-Backgrounds-Content-Background_position;    background-repeat: General_formatting-Backgrounds-Content-Background_repeat;}.zoneFooterOuter{    background-color: General_formatting-Backgrounds-Outer_footer-Background_color;    background-image: General_formatting-Backgrounds-Outer_footer-Background_image;    background-position: General_formatting-Backgrounds-Outer_footer-Background_position;    background-repeat: General_formatting-Backgrounds-Outer_footer-Background_repeat;}.zoneFooterOuter .container_12 > DIV{    background-color: General_formatting-Backgrounds-Footer-Background_color;    background-image: General_formatting-Backgrounds-Footer-Background_image;    background-position: General_formatting-Backgrounds-Footer-Background_position;    background-repeat: General_formatting-Backgrounds-Footer-Background_repeat;}.zoneFooter1Outer{    background-color: General_formatting-Backgrounds-Outer_footer_1-Background_color;    background-image: General_formatting-Backgrounds-Outer_footer_1-Background_image;    background-position: General_formatting-Backgrounds-Outer_footer_1-Background_position;    background-repeat: General_formatting-Backgrounds-Outer_footer_1-Background_repeat;}.zoneFooter1Outer .container_12 > DIV{    background-color: General_formatting-Backgrounds-Footer_1-Background_color;    background-image: General_formatting-Backgrounds-Footer_1-Background_image;    background-position: General_formatting-Backgrounds-Footer_1-Background_position;    background-repeat: General_formatting-Backgrounds-Footer_1-Background_repeat;}BODY{    font-size: General_formatting-Typography-Text-Font_size;    font-weight: General_formatting-Typography-Text-Font_weight;    font-style: General_formatting-Typography-Text-Font_style;    font-family: General_formatting-Typography-Text-Font_family;    color: General_formatting-Typography-Text-Font_color;}#idFooterPoweredByWA{    font-size: General_formatting-Typography-Text-Font_size;}.alternativeText{    font-family: General_formatting-Typography-Alternative_Text-Font_family;    font-size: General_formatting-Typography-Alternative_Text-Font_size;    font-weight: General_formatting-Typography-Alternative_Text-Font_weight;    font-style: General_formatting-Typography-Alternative_Text-Font_style;    color: General_formatting-Typography-Alternative_Text-Font_color;}.promoText{background-color: General_formatting-Typography-Promo-Background_color;font-family: General_formatting-Typography-Promo-Font_family;font-size: General_formatting-Typography-Promo-Font_size;font-weight: General_formatting-Typography-Promo-Font_weight;font-style: General_formatting-Typography-Promo-Font_style;text-decoration: General_formatting-Typography-Promo-Text_decoration;color: General_formatting-Typography-Promo-Font_color;}H1.titlePage{background-color: General_formatting-Typography-Page_title-Background_color;font-family: General_formatting-Typography-Page_title-Font_family;font-size: General_formatting-Typography-Page_title-Font_size;font-weight: General_formatting-Typography-Page_title-Font_weight;font-style: General_formatting-Typography-Page_title-Font_style;text-decoration: General_formatting-Typography-Page_title-Text_decoration;color: General_formatting-Typography-Page_title-Font_color;}H1:not(.titlePage){background-color: General_formatting-Typography-Heading_1-Background_color;font-family: General_formatting-Typography-Heading_1-Font_family;font-size: General_formatting-Typography-Heading_1-Font_size;font-weight: General_formatting-Typography-Heading_1-Font_weight;font-style: General_formatting-Typography-Heading_1-Font_style;text-decoration: General_formatting-Typography-Heading_1-Text_decoration;color: General_formatting-Typography-Heading_1-Font_color;}H2{background-color: General_formatting-Typography-Heading_2-Background_color;font-family: General_formatting-Typography-Heading_2-Font_family;font-size: General_formatting-Typography-Heading_2-Font_size;font-weight: General_formatting-Typography-Heading_2-Font_weight;font-style: General_formatting-Typography-Heading_2-Font_style;text-decoration: General_formatting-Typography-Heading_2-Text_decoration;color: General_formatting-Typography-Heading_2-Font_color;}H3{background-color: General_formatting-Typography-Heading_3-Background_color;font-family: General_formatting-Typography-Heading_3-Font_family;font-size: General_formatting-Typography-Heading_3-Font_size;font-weight: General_formatting-Typography-Heading_3-Font_weight;font-style: General_formatting-Typography-Heading_3-Font_style;text-decoration: General_formatting-Typography-Heading_3-Text_decoration;color: General_formatting-Typography-Heading_3-Font_color;}H4{background-color: General_formatting-Typography-Heading_4-Background_color;font-family: General_formatting-Typography-Heading_4-Font_family;font-size: General_formatting-Typography-Heading_4-Font_size;font-weight: General_formatting-Typography-Heading_4-Font_weight;font-style: General_formatting-Typography-Heading_4-Font_style;text-decoration: General_formatting-Typography-Heading_4-Text_decoration;color: General_formatting-Typography-Heading_4-Font_color;}.contStyleCaption,.WaGadgetBlog .blogEntryOuterContainer .boxBodyOuterContainer .boxBodyInfoOuterContainer h5 .postedByLink:before,.WaGadgetBlog .blogEntryOuterContainer .boxBodyOuterContainer .boxBodyInfoOuterContainer h5 .postedByLink:after{background-color: General_formatting-Typography-Caption-Background_color;font-family: General_formatting-Typography-Caption-Font_family;font-size: General_formatting-Typography-Caption-Font_size;font-weight: General_formatting-Typography-Caption-Font_weight;font-style: General_formatting-Typography-Caption-Font_style;text-decoration: General_formatting-Typography-Caption-Text_decoration;color: General_formatting-Typography-Caption-Font_color;}.quotedText{background-color: General_formatting-Typography-Quoted-Background_color;font-family: General_formatting-Typography-Quoted-Font_family;font-size: General_formatting-Typography-Quoted-Font_size;font-weight: General_formatting-Typography-Quoted-Font_weight;font-style: General_formatting-Typography-Quoted-Font_style;text-decoration: General_formatting-Typography-Quoted-Text_decoration;color: General_formatting-Typography-Quoted-Font_color;}.WaGadgetEvents.WaGadgetEventsStateList h3.sectionTitle{  background-color: General_formatting-Typography-Event_calendar_title-Background_color;    font-family: General_formatting-Typography-Event_calendar_title-Font_family;  font-size: General_formatting-Typography-Event_calendar_title-Font_size;  font-weight: General_formatting-Typography-Event_calendar_title-Font_weight;  font-style: General_formatting-Typography-Event_calendar_title-Font_style;    text-decoration: General_formatting-Typography-Event_calendar_title-Text_decoration;  color: General_formatting-Typography-Event_calendar_title-Font_color;}/* SMALL GADGETS */.gadgetStyleNone:not(.WaGadgetDonationGoal):not(.WaGadgetPhotoAlbum):not(.WaGadgetGoogleMap):not(.WaGadgetSlideshow) .gadgetStyleTitle h4{    color: Gadgets-Style_basic-Title-Font_color;    background-color: Gadgets-Style_basic-Title-Background_color;    font-family: Gadgets-Style_basic-Title-Font_family;    font-size: Gadgets-Style_basic-Title-Font_size;    font-weight: Gadgets-Style_basic-Title-Font_weight;    font-style: Gadgets-Style_basic-Title-Font_style;    text-decoration: Gadgets-Style_basic-Title-Text_decoration;}.gadgetStyleNone:not(.WaGadgetDonationGoal):not(.WaGadgetPhotoAlbum):not(.WaGadgetGoogleMap):not(.WaGadgetSlideshow) .gadgetStyleBody ul li .title a{    font-family: Gadgets-Style_basic-Link-Font_family;    font-size: Gadgets-Style_basic-Link-Font_size;    font-weight: Gadgets-Style_basic-Link-Font_weight;    font-style: Gadgets-Style_basic-Link-Font_style;    text-decoration: Gadgets-Style_basic-Link-Text_decoration;    color: Gadgets-Style_basic-Link-Font_color;}.WaGadgetRecentBlogPosts.gadgetStyleNone ul li .date span,.WaGadgetForumUpdates.gadgetStyleNone ul li .date span,.WaGadgetUpcomingEvents.gadgetStyleNone ul li .date span{    font-family: Gadgets-Style_basic-Date_and_time-Font_family;    font-size: Gadgets-Style_basic-Date_and_time-Font_size;    font-weight: Gadgets-Style_basic-Date_and_time-Font_weight;    font-style: Gadgets-Style_basic-Date_and_time-Font_style;    text-decoration: Gadgets-Style_basic-Date_and_time-Text_decoration;    color: Gadgets-Style_basic-Date_and_time-Font_color;}.WaGadgetUpcomingEvents.gadgetStyleNone ul li .location span{    font-family: Gadgets-Style_basic-Location-Font_family;    font-size: Gadgets-Style_basic-Location-Font_size;    font-weight: Gadgets-Style_basic-Location-Font_weight;    font-style: Gadgets-Style_basic-Location-Font_style;    text-decoration: Gadgets-Style_basic-Location-Text_decoration;    color: Gadgets-Style_basic-Location-Font_color;}.WaGadgetRecentBlogPosts.gadgetStyleNone ul li .author a,.WaGadgetRecentBlogPosts.gadgetStyleNone ul li .author span,.WaGadgetForumUpdates.gadgetStyleNone ul li .author span,.WaGadgetForumUpdates.gadgetStyleNone ul li .author a{    font-family: Gadgets-Style_basic-Author-Font_family;    font-size: Gadgets-Style_basic-Author-Font_size;    font-weight: Gadgets-Style_basic-Author-Font_weight;    font-style: Gadgets-Style_basic-Author-Font_style;    text-decoration: Gadgets-Style_basic-Author-Text_decoration;    color: Gadgets-Style_basic-Author-Font_color;}/* ---------- */.gadgetStyle001:not(.WaGadgetDonationGoal):not(.WaGadgetPhotoAlbum):not(.WaGadgetGoogleMap):not(.WaGadgetSlideshow):not(.WaGadgetFeaturedMember) .gadgetStyleTitle h4{    color: Gadgets-Style_large-T   itle-Font_color;    background-color: Gadgets-Style_large-Title-Background_color;    font-family: Gadgets-Style_large-Title-Font_family;    font-size: Gadgets-Style_large-Title-Font_size;    font-weight: Gadgets-Style_large-Title-Font_weight;    font-style: Gadgets-Style_large-Title-Font_style;    text-decoration: Gadgets-Style_large-Title-Text_decoration;}.gadgetStyle001:not(.WaGadgetDonationGoal):not(.WaGadgetPhotoAlbum):not(.WaGadgetGoogleMap):not(.WaGadgetSlideshow):not(.WaGadgetFeaturedMember) .gadgetStyleBody ul li .title a{    font-family: Gadgets-Style_large-Link-Font_family;    font-size: Gadgets-Style_large-Link-Font_size;    font-weight: Gadgets-Style_large-Link-Font_weight;    font-style: Gadgets-Style_large-Link-Font_style;    text-decoration: Gadgets-Style_large-Link-Text_decoration;    color: Gadgets-Style_large-Link-Font_color;}.WaGadgetRecentBlogPosts.gadgetStyle001 ul li .date span,.WaGadgetForumUpdates.gadgetStyle001 ul li .date span,.WaGadgetUpcomingEvents.gadgetStyle001 ul li .date span{    font-family: Gadgets-Style_large-Date_and_time-Font_family;    font-size: Gadgets-Style_large-Date_and_time-Font_size;    font-weight: Gadgets-Style_large-Date_and_time-Font_weight;    font-style: Gadgets-Style_large-Date_and_time-Font_style;    text-decoration: Gadgets-Style_large-Date_and_time-Text_decoration;    color: Gadgets-Style_large-Date_and_time-Font_color;}.WaGadgetUpcomingEvents.gadgetStyle001 ul li .location span{    font-family: Gadgets-Style_large-Location-Font_family;    font-size: Gadgets-Style_large-Location-Font_size;    font-weight: Gadgets-Style_large-Location-Font_weight;    font-style: Gadgets-Style_large-Location-Font_style;    text-decoration: Gadgets-Style_large-Location-Text_decoration;    color: Gadgets-Style_large-Location-Font_color;}.WaGadgetRecentBlogPosts.gadgetStyle001 ul li .author a,.WaGadgetRecentBlogPosts.gadgetStyle001 ul li .author span,.WaGadgetForumUpdates.gadgetStyle001 ul li .author span,.WaGadgetForumUpdates.gadgetStyle001 ul li .author a{    font-family: Gadgets-Style_large-Author-Font_family;    font-size: Gadgets-Style_large-Author-Font_size;    font-weight: Gadgets-Style_large-Author-Font_weight;    font-style: Gadgets-Style_large-Author-Font_style;    text-decoration: Gadgets-Style_large-Author-Text_decoration;    color: Gadgets-Style_large-Author-Font_color;}/* ---------- */.gadgetStyle002:not(.WaGadgetDonationGoal):not(.WaGadgetPhotoAlbum):not(.WaGadgetGoogleMap):not(.WaGadgetSlideshow) .gadgetStyleTitle h4{    color: Gadgets-Style_opacity-Title-Font_color;    background-color: Gadgets-Style_opacity-Title-Background_color;    font-family: Gadgets-Style_opacity-Title-Font_family;    font-size: Gadgets-Style_opacity-Title-Font_size;    font-weight: Gadgets-Style_opacity-Title-Font_weight;    font-style: Gadgets-Style_opacity-Title-Font_style;    text-decoration: Gadgets-Style_opacity-Title-Text_decoration;}.gadgetStyle002:not(.WaGadgetDonationGoal):not(.WaGadgetPhotoAlbum):not(.WaGadgetGoogleMap):not(.WaGadgetSlideshow) .gadgetStyleBody ul li .title a{    font-family: Gadgets-Style_opacity-Link-Font_family;    font-size: Gadgets-Style_opacity-Link-Font_size;    font-weight: Gadgets-Style_opacity-Link-Font_weight;    font-style: Gadgets-Style_opacity-Link-Font_style;    text-decoration: Gadgets-Style_opacity-Link-Text_decoration;    color: Gadgets-Style_opacity-Link-Font_color;}.WaGadgetRecentBlogPosts.gadgetStyle002 ul li .date span,.WaGadgetForumUpdates.gadgetStyle002 ul li .date span,.WaGadgetUpcomingEvents.gadgetStyle002 ul li .date span{    font-family: Gadgets-Style_opacity-Date_and_time-Font_family;    font-size: Gadgets-Style_opacity-Date_and_time-Font_size;    font-weight: Gadgets-Style_opacity-Date_and_time-Font_weight;    font-style: Gadgets-Style_opacity-Date_and_time-Font_style;    text-decoration: Gadgets-Style_opacity-Date_and_time-Text_decoration;    color: Gadgets-Style_opacity-Date_and_time-Font_color;}.WaGadgetUpcomingEvents.gadgetStyle002 ul li .location span{    font-family: Gadgets-Style_opacity-Location-Font_family;    font-size: Gadgets-Style_opacity-Location-Font_size;    font-weight: Gadgets-Style_opacity-Location-Font_weight;    font-style: Gadgets-Style_opacity-Location-Font_style;    text-decoration: Gadgets-Style_opacity-Location-Text_decoration;    color: Gadgets-Style_opacity-Location-Font_color;}.WaGadgetRecentBlogPosts.gadgetStyle002 ul li .author a,.WaGadgetRecentBlogPosts.gadgetStyle002 ul li .author span,.WaGadgetForumUpdates.gadgetStyle002 ul li .author span,.WaGadgetForumUpdates.gadgetStyle002 ul li .author a{font-family: Gadgets-Style_opacity-Author-Font_family;font-size: Gadgets-Style_opacity-Author-Font_size;font-weight: Gadgets-Style_opacity-Author-Font_weight;font-style: Gadgets-Style_opacity-Author-Font_style;text-decoration: Gadgets-Style_opacity-Author-Text_decoration;color: Gadgets-Style_opacity-Author-Font_color;}/* DONATION GOAL */.WaGadgetDonationGoal.gadgetStyleNone .gadgetStyleTitle h4{    font-family: Donation_goal-Style_basic-Title-Font_family;    color: Donation_goal-Style_basic-Title-Font_color;}.WaGadgetDonationGoal.gadgetStyleNone .gadgetStyleBody .donationGoalNotesContainer{    font-family: Donation_goal-Style_basic-Donation_description-Font_family;    font-size: Donation_goal-Style_basic-Donation_description-Font_size;    font-weight: Donation_goal-Style_basic-Donation_description-Font_weight;    font-style: Donation_goal-Style_basic-Donation_description-Font_style;    text-decoration: Donation_goal-Style_basic-Donation_description-Text_decoration;    color: Donation_goal-Style_basic-Donation_description-Font_color;}.WaGadgetDonationGoal.gadgetStyleNone .gadgetStyleBody .progressBarOuterContainer .progressBar table{    border-color: Donation_goal-Style_basic-Donation_bar_border_color-Border_color;}.WaGadgetDonationGoal.gadgetStyleNone .gadgetStyleBody .progressBarOuterContainer .progressBar table td.donationGoalProgressBarLeftPart span{    background-color: Donation_goal-Style_basic-Donation_bar-Background_color;}.WaGadgetDonationGoal.gadgetStyleNone .gadgetStyleBody .progressBarOuterContainer .progressBar table td.donationGoalProgressBarRightPart{    background-color: Donation_goal-Style_basic-Donation_bar_background-Background_color;}.WaGadgetDonationGoal.gadgetStyleNone .gadgetStyleBody .progressBarOuterContainer .progressBar .collectedPercents{    color: Donation_goal-Style_basic-Donation_bar_percentage-Font_color;}.WaGadgetDonationGoal.gadgetStyleNone .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalProgressLabels{    font-family: Donation_goal-Style_basic-Donation_labels-Font_family;    font-size: Donation_goal-Style_basic-Donation_labels-Font_size;    font-weight: Donation_goal-Style_basic-Donation_labels-Font_weight;    font-style: Donation_goal-Style_basic-Donation_labels-Font_style;    text-decoration: Donation_goal-Style_basic-Donation_labels-Text_decoration;    color: Donation_goal-Style_basic-Donation_labels-Font_color;}.WaGadgetDonationGoal.gadgetStyleNone .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalProgressLabels span{    text-decoration: Donation_goal-Style_basic-Donation_labels-Text_decoration;}.WaGadgetDonationGoal.gadgetStyleNone .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalButton input.typeButton{    background-color: Donation_goal-Style_basic-Donation_button-Background_color;    color: Donation_goal-Style_basic-Donation_button-Font_color;}.WaGadgetDonationGoal.gadgetStyleNone .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalButton input.typeButton:hover{    background-color: Donation_goal-Style_basic-Donation_button_hover-Background_color;    color: Donation_goal-Style_basic-Donation_button_hover-Font_color;}.WaGadgetDonationGoal.gadgetStyle001 .gadgetStyleTitle h4{    font-family: Donation_goal-Style_1-Title-Font_family;    color: Donation_goal-Style_1-Title-Font_color;}.WaGadgetDonationGoal.gadgetStyle001 .gadgetStyleBody .donationGoalNotesContainer{    font-family: Donation_goal-Style_1-Donation_description-Font_family;    font-size: Donation_goal-Style_1-Donation_description-Font_size;    font-weight: Donation_goal-Style_1-Donation_description-Font_weight;    font-style: Donation_goal-Style_1-Donation_description-Font_style;    text-decoration: Donation_goal-Style_1-Donation_description-Text_decoration;    color: Donation_goal-Style_1-Donation_description-Font_color;}.WaGadgetDonationGoal.gadgetStyle001 .gadgetStyleBody .progressBarOuterContainer .progressBar table{    border-color: Donation_goal-Style_1-Donation_bar_border_color-Border_color;}.WaGadgetDonationGoal.gadgetStyle001 .gadgetStyleBody .progressBarOuterContainer .progressBar table td.donationGoalProgressBarLeftPart span{    background-color: Donation_goal-Style_1-Donation_bar-Background_color;}.WaGadgetDonationGoal.gadgetStyle001 .gadgetStyleBody .progressBarOuterContainer .progressBar table td.donationGoalProgressBarRightPart{    background-color: Donation_goal-Style_1-Donation_bar_background-Background_color;}.WaGadgetDonationGoal.gadgetStyle001 .gadgetStyleBody .progressBarOuterContainer .progressBar .collectedPercents{    color: Donation_goal-Style_1-Donation_bar_percentage-Font_color;}.WaGadgetDonationGoal.gadgetStyle001 .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalProgressLabels{    font-family: Donation_goal-Style_1-Donation_labels-Font_family;    font-size: Donation_goal-Style_1-Donation_labels-Font_size;    font-weight: Donation_goal-Style_1-Donation_labels-Font_weight;    font-style: Donation_goal-Style_1-Donation_labels-Font_style;    text-decoration: Donation_goal-Style_1-Donation_labels-Text_decoration;    color: Donation_goal-Style_1-Donation_labels-Font_color;}.WaGadgetDonationGoal.gadgetStyle001 .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalProgressLabels span{    text-decoration: Donation_goal-Style_1-Donation_labels-Text_decoration;}.WaGadgetDonationGoal.gadgetStyle001 .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalButton input.typeButton{    background-color: Donation_goal-Style_1-Donation_button-Background_color;    color: Donation_goal-Style_1-Donation_button-Font_color;}.WaGadgetDonationGoal.gadgetStyle001 .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalButton input.typeButton:hover{    background-color: Donation_goal-Style_1-Donation_button_hover-Background_color;    color: Donation_goal-Style_1-Donation_button_hover-Font_color;}.WaGadgetDonationGoal.gadgetStyle002 .gadgetStyleTitle h4{    font-family: Donation_goal-Style_2-Title-Font_family;    color: Donation_goal-Style_2-Title-Font_color;}.WaGadgetDonationGoal.gadgetStyle002 .gadgetStyleBody .donationGoalNotesContainer{    font-family: Donation_goal-Style_2-Donation_description-Font_family;    font-size: Donation_goal-Style_2-Donation_description-Font_size;    font-weight: Donation_goal-Style_2-Donation_description-Font_weight;    font-style: Donation_goal-Style_2-Donation_description-Font_style;    text-decoration: Donation_goal-Style_2-Donation_description-Text_decoration;    color: Donation_goal-Style_2-Donation_description-Font_color;}.WaGadgetDonationGoal.gadgetStyle002 .gadgetStyleBody .progressBarOuterContainer .progressBar table{    border-color: Donation_goal-Style_2-Donation_bar_border_color-Border_color;}.WaGadgetDonationGoal.gadgetStyle002 .gadgetStyleBody .progressBarOuterContainer .progressBar table td.donationGoalProgressBarLeftPart span{    background-color: Donation_goal-Style_2-Donation_bar-Background_color;}.WaGadgetDonationGoal.gadgetStyle002 .gadgetStyleBody .progressBarOuterContainer .progressBar table td.donationGoalProgressBarRightPart{    background-color: Donation_goal-Style_2-Donation_bar_background-Background_color;}.WaGadgetDonationGoal.gadgetStyle002 .gadgetStyleBody .progressBarOuterContainer .progressBar .collectedPercents{    color: Donation_goal-Style_2-Donation_bar_percentage-Font_color;}.WaGadgetDonationGoal.gadgetStyle002 .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalProgressLabels{    font-family: Donation_goal-Style_2-Donation_labels-Font_family;    font-size: Donation_goal-Style_2-Donation_labels-Font_size;    font-weight: Donation_goal-Style_2-Donation_labels-Font_weight;    font-style: Donation_goal-Style_2-Donation_labels-Font_style;    text-decoration: Donation_goal-Style_2-Donation_labels-Text_decoration;    color: Donation_goal-Style_2-Donation_labels-Font_color;}.WaGadgetDonationGoal.gadgetStyle002 .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalProgressLabels span{    text-decoration: Donation_goal-Style_2-Donation_labels-Text_decoration;}.WaGadgetDonationGoal.gadgetStyle002 .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalButton input.typeButton{    background-color: Donation_goal-Style_2-Donation_button-Background_color;    color: Donation_goal-Style_2-Donation_button-Font_color;}.WaGadgetDonationGoal.gadgetStyle002 .gadgetStyleBody .progressBarOuterContainer .buttonAndLabels .donationGoalButton input.typeButton:hover{    background-color: Donation_goal-Style_2-Donation_button_hover-Background_color;    color: Donation_goal-Style_2-Donation_button_hover-Font_color;}/* FEATURED MEMBER */.WaGadgetFeaturedMember.gadgetStyle001 .gadgetStyleTitle h4{    color: Featured_member-Title-Font_color;    background-color: Featured_member-Title-Background_color;    font-family: Featured_member-Title-Font_family;    font-size: Featured_member-Title-Font_size;    font-weight: Featured_member-Title-Font_weight;    font-style: Featured_member-Title-Font_style;    text-decoration: Featured_member-Title-Text_decoration;}.WaGadgetFeaturedMember.gadgetStyle001 ul.layoutVertical li .rightPart h4 a, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutHorizontal li .rightPart h4 a, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutList li .rightPart h4 a{    background-color: Featured_member-Member_label-Background_color;    font-family: Featured_member-Member_label-Font_family;    font-size: Featured_member-Member_label-Font_size;    font-weight: Featured_member-Member_label-Font_weight;    font-style: Featured_member-Member_label-Font_style;    text-decoration: Featured_member-Member_label-Text_decoration;    color: Featured_member-Member_label-Font_color;}.WaGadgetFeaturedMember.gadgetStyle001 ul.layoutVertical li .rightPart h4 a:hover, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutHorizontal li .rightPart h4 a:hover, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutList li .rightPart h4 a:hover{    background-color: Featured_member-Member_label_on_hover-Background_color;    text-decoration: Featured_member-Member_label_on_hover-Text_decoration;    color: Featured_member-Member_label_on_hover-Font_color;}.WaGadgetFeaturedMember.gadgetStyle001 ul.layoutVertical li .rightPart .subtitle strong, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutHorizontal li .rightPart .subtitle strong, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutList li .rightPart .subtitle strong{    color: Featured_member-Label_2-Font_color;    background-color: Featured_member-Label_2-Background_color;    font-family: Featured_member-Label_2-Font_family;    font-size: Featured_member-Label_2-Font_size;    font-weight: Featured_member-Label_2-Font_weight;    font-style: Featured_member-Label_2-Font_style;    text-decoration: Featured_member-Label_2-Text_decoration;}.WaGadgetFeaturedMember.gadgetStyle001 ul.layoutVertical li .rightPart .subtitle strong a, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutHorizontal li .rightPart .subtitle strong a, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutList li .rightPart .subtitle strong a{    background-color: Featured_member-Label_2-Background_color;    font-family: Featured_member-Label_2-Font_family;    font-size: Featured_member-Label_2-Font_size;    font-weight: Featured_member-Label_2-Font_weight;    font-style: Featured_member-Label_2-Font_style;    text-decoration: Featured_member-Label_2-Text_decoration;}.WaGadgetFeaturedMember.gadgetStyle001 ul.layoutVertical li .rightPart .description, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutHorizontal li .rightPart .description, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutList li .rightPart .description{    color: Featured_member-Label_3-Font_color;    background-color: Featured_member-Label_3-Background_color;    font-family: Featured_member-Label_3-Font_family;    font-size: Featured_member-Label_3-Font_size;    font-weight: Featured_member-Label_3-Font_weight;    font-style: Featured_member-Label_3-Font_style;    text-decoration: Featured_member-Label_3-Text_decoration;}.WaGadgetFeaturedMember.gadgetStyle001 ul.layoutVertical li .rightPart .description a, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutHorizontal li .rightPart .description a, .WaGadgetFeaturedMember.gadgetStyle001 ul.layoutList li .rightPart .description a{    background-color: Featured_member-Label_3-Background_color;    font-family: Featured_member-Label_3-Font_family;    font-size: Featured_member-Label_3-Font_size;    font-weight: Featured_member-Label_3-Font_weight;    font-style: Featured_member-Label_3-Font_style;    text-decoration: Featured_member-Label_3-Text_decoration;}.WaGadgetFeaturedMember.gadgetStyle001 .action a{    background-color: Featured_member-Link_to_member_directory-Background_color;    font-family: Featured_member-Link_to_member_directory-Font_family;    font-size: Featured_member-Link_to_member_directory-Font_size;    font-weight: Featured_member-Link_to_member_directory-Font_weight;    font-style: Featured_member-Link_to_member_directory-Font_style;    text-decoration: Featured_member-Link_to_member_directory-Text_decoration;    color: Featured_member-Link_to_member_directory-Font_color;}.WaGadgetFeaturedMember.gadgetStyle001 .action a:hover{    background-color: Featured_member-Link_to_member_directory_on_hover-Background_color;    text-decoration: Featured_member-Link_to_member_directory_on_hover-Text_decoration;    color: Featured_member-Link_to_member_directory_on_hover-Font_color;}.generalFieldsContainer .fieldSubContainer .fieldLabel,.generalFieldsContainer .fieldSubContainer .fieldLabel .mandatoryLabel,.generalFieldsContainer .fieldSubContainer .fieldLabel .mandatorySymbol{    font-family: General_formatting-Form-Field_labels-Font_family;    font-size: General_formatting-Form-Field_labels-Font_size;    font-weight: General_formatting-Form-Field_labels-Font_weight;    font-style: General_formatting-Form-Field_labels-Font_style;    text-decoration: General_formatting-Form-Field_labels-Text_decoration;    color: General_formatting-Form-Field_labels-Font_color;}.fieldSubContainer .fieldBody .fieldItem span.label .textLine strong{    font-weight: General_formatting-Form-Option_labels-Font_weight;}.captionOuterContainer{    background-color: General_formatting-Form-Caption-Background_color;}.captionOuterContainer .captionContainer .fieldBody h4{    font-family: General_formatting-Form-Caption-Font_family;    font-size: General_formatting-Form-Caption-Font_size;    font-weight: General_formatting-Form-Caption-Font_weight;    font-style: General_formatting-Form-Caption-Font_style;    text-decoration: General_formatting-Form-Caption-Text_decoration;    color: General_formatting-Form-Caption-Font_color;}.fieldSubContainer .fieldBody > .typeInstruction,.fieldSubContainer .fieldBody .fieldItem span.label .typeInstruction{    font-family: General_formatting-Form-Field_instructions-Font_family;    font-size: General_formatting-Form-Field_instructions-Font_size;    font-weight: General_formatting-Form-Field_instructions-Font_weight;    font-style: General_formatting-Form-Field_instructions-Font_style;    text-decoration: General_formatting-Form-Field_instructions-Text_decoration;    color: General_formatting-Form-Field_instructions-Font_color;}.WaGadgetBlogStateEditPost .boxHeaderOuterContainer .boxHeaderContainer h4.boxHeaderTitle,.WaGadgetBlogStateAddPost .boxHeaderOuterContainer .boxHeaderContainer h4.boxHeaderTitle,.WaGadgetBlogStateEditPost .boxBodyOuterContainer .generalFieldsContainer .mandatoryFieldsTitle,.WaGadgetBlogStateAddPost .boxBodyOuterContainer .generalFieldsContainer .mandatoryFieldsTitle,.WaGadgetForum .forumEditEntryBoxContainer .boxHeaderOuterContainer h4.boxHeaderTitle,.WaGadgetForum .forumEditEntryBoxContainer .boxBodyOuterContainer .mandatoryFieldsTitle,.formTitleOuterContainer .formTitleContainer .inner h3.formTitle,.formTitleOuterContainer .formTitleContainer .inner .mandatoryFieldsTitle strong,.WaGadgetEmailMember .mandatoryFieldsTitle{    font-family: General_formatting-Form-Form_instructions-Font_family;    font-size: General_formatting-Form-Form_instructions-Font_size;    font-weight: General_formatting-Form-Form_instructions-Font_weight;    font-style: General_formatting-Form-Form_instructions-Font_style;    text-decoration: General_formatting-Form-Form_instructions-Text_decoration;    color: General_formatting-Form-Form_instructions-Font_color;}.WaGadgetBlog.WaGadgetBlogStateEditPost .boxHeaderOuterContainer,.WaGadgetBlog.WaGadgetBlogStateAddPost .boxHeaderOuterContainer,.WaGadgetForum .forumEditEntryBoxContainer .boxHeaderOuterContainer,.formTitleOuterContainer,.WaGadgetEmailMember #idSendMailMainContainer .generalFormContainer .formOuterContainer .captionOuterContainer{    border-bottom-color: General_formatting-Form-Divider-Border_color;}.genericListTable thead th,.membersTable thead th{    font-family: Table-Column_headings-Font_family;    font-size: Table-Column_headings-Font_size;    font-weight: Table-Column_headings-Font_weight;    font-style: Table-Column_headings-Font_style;    text-decoration: Table-Column_headings-Text_decoration;    color: Table-Column_headings-Font_color;    background-color: Table-Column_headings-Background_color;}.genericListTable tbody tr td,.genericListTable tbody tr td .memberValue,.genericListTable tbody tr td .memberValue h5 a,.membersTable tbody tr td,.membersTable tbody tr td .memberValue,.membersTable tbody tr td .memberValue h5 a{    font-family: Table-Table_row-Font_family;    font-size: Table-Table_row-Font_size;    font-weight: Table-Table_row-Font_weight;    font-style: Table-Table_row-Font_style;    text-decoration: Table-Table_row-Text_decoration;    color: Table-Table_row-Font_color;}.genericListTable tbody td,.membersTable tbody td{    background-color: Table-Table_row-Background_color;}.genericListTable tr.hover td,.genericListTable tr:hover td,.membersTable tr.hover td,.membersTable tr:hover td,.WaGadgetContactProfileStateFinances .genericList .genericListTable tr.noLine:hover{    background-color: Table-Table_row_on_hover-Background_color;}.genericListTable tbody tr td a,.genericListTable tbody tr td .memberValue h5 a,.membersTable tbody tr td a,.membersTable tbody tr td .memberValue h5 a{    color: Table-Table_links-Font_color;}.genericListTable tbody td a:hover,.genericListTable tbody td .memberValue h5 a:hover,.membersTable tbody td a:hover,.membersTable tbody td .memberValue h5 a:hover{    color: Table-Table_links_on_hover-Font_color;}/* BLOG */.WaGadgetBlog .boxBodyInfoOuterContainer h5 .postedByLabel,.WaGadgetBlog .boxBodyInfoOuterContainer h5 .postedByLink a,.WaGadgetBlog .boxBodyInfoOuterContainer h5 .postedByLink a:hover,.WaGadgetBlog .boxBodyInfoOuterContainer h5 .postedByLink .postedByComment,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxHeaderOuterContainer h5,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxHeaderOuterContainer h5 span.postedByComment,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxHeaderOuterContainer h5 span.postedByComment,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxHeaderOuterContainer h5 a.blogEntryPostedBy{    font-family: Blog-Author-Font_family;    font-size: Blog-Author-Font_size;    font-weight: Blog-Author-Font_weight;    font-style: Blog-Author-Font_style;    text-decoration: Blog-Author-Text_decoration;    color: Blog-Author-Font_color;}.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxHeaderOuterContainer h5 a,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxHeaderOuterContainer h5 a,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxHeaderOuterContainer h5 a,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxHeaderOuterContainer h5 a.blogEntryPostedBy{    font-style: Blog-Author-Font_style;    color: Blog-Author-Font_color;    text-decoration: Blog-Author-Text_decoration;}.WaGadgetBlog .boxBodyInfoOuterContainer h5 .postedOn,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxHeaderOuterContainer h5 span:first-child,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxHeaderOuterContainer h5 span:first-child,.WaGadgetBlog .blogEntryOuterContainer .boxBodyOuterContainer .boxBodyInfoOuterContainer h5 .postedOn{    font-family: Blog-Date_and_time-Font_family;    font-size: Blog-Date_and_time-Font_size;    font-weight: Blog-Date_and_time-Font_weight;    font-style: Blog-Date_and_time-Font_style;    text-decoration: Blog-Date_and_time-Text_decoration;    color: Blog-Date_and_time-Font_color;}.WaGadgetBlog .boxFooterOuterContainer .postBottom .boxFooterPrimaryOuterContainer .boxFooterPrimaryContainer a,.WaGadgetBlog .boxFooterOuterContainer .postBottom .boxFooterSecondaryOuterContainer .boxFooterSecondaryContainer a.editPost,.WaGadgetBlog .boxFooterOuterContainer .postBottom .boxFooterSecondaryOuterContainer .boxFooterSecondaryContainer a.deletePost,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.blogCommentAnchor,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.blogCommentAnchor,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.reply,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.reply,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterSecondaryOuterContainer .commentBottomRight a.delete,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterSecondaryOuterContainer .commentBottomRight a.delete,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterSecondaryOuterContainer .commentBottomRight a.delete{    color: Blog-Links-Font_color;}.WaGadgetBlog .boxFooterOuterContainer .postBottom .boxFooterPrimaryOuterContainer .boxFooterPrimaryContainer a:hover,.WaGadgetBlog .boxFooterOuterContainer .postBottom .boxFooterSecondaryOuterContainer .boxFooterSecondaryContainer a.editPost:hover,.WaGadgetBlog .boxFooterOuterContainer .postBottom .boxFooterSecondaryOuterContainer .boxFooterSecondaryContainer a.deletePost:hover,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.blogCommentAnchor:hover,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.blogCommentAnchor:hover,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.reply:hover,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.reply:hover,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterSecondaryOuterContainer .commentBottomRight a.delete:hover,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterSecondaryOuterContainer .commentBottomRight a.delete:hover,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterSecondaryOuterContainer .commentBottomRight a.delete:hover{    color: Blog-Links_on_hover-Font_color;}.WaGadgetBlog .boxFooterOuterContainer .postBottom .boxFooterSecondaryOuterContainer .boxFooterSecondaryContainer a.editPost:before,.WaGadgetBlog .boxFooterOuterContainer .postBottom .boxFooterSecondaryOuterContainer .boxFooterSecondaryContainer a.deletePost:before,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.blogCommentAnchor:before,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.blogCommentAnchor:before,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterSecondaryOuterContainer .commentBottomRight a.delete:before,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterSecondaryOuterContainer .commentBottomRight a.delete:before,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.blogCommentAnchor::before,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.blogCommentAnchor::before,.WaGadgetBlog.WaGadgetBlogStateDetails .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.reply::before,.WaGadgetBlog.WaGadgetBlogStateReply .blogCommentsOuterContainer .blogCommentsListOuterContainer ul.blogCommentsList li.blogCommentItem .blogComment .commentViewContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .commentBottomLeft a.reply::before,.WaGadgetBlog .blogEntryOuterContainer .boxFooterOuterContainer .boxFooterContainer .boxFooterPrimaryOuterContainer .boxFooterPrimaryContainer a:first-child::before,.WaGadgetBlog .boxFooterOuterContainer .postBottom .boxFooterPrimaryOuterContainer .boxFooterPrimaryContainer a::before{    color: Blog-Icons-Font_color;}.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer h5{    font-family: Forum-Forum_category-Font_family;    font-size: Forum-Forum_category-Font_size;    font-weight: Forum-Forum_category-Font_weight;    font-style: Forum-Forum_category-Font_style;    text-decoration: Forum-Forum_category-Text_decoration;    color: Forum-Forum_category-Font_color;    background-color: Forum-Forum_category-Background_color;}.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxHeaderOuterContainer table td h4,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxHeaderOuterContainer table td.threadTD div.thread h4.boxHeaderTitle,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxHeaderOuterContainer table td.lastReplyTD .lastReply h4.boxHeaderTitle,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxHeaderOuterContainer table td.repliesCountTD .repliesCount h4.boxHeaderTitle{    font-family: Forum-Column_headings-Font_family;    font-size: Forum-Column_headings-Font_size;    font-weight: Forum-Column_headings-Font_weight;    font-style: Forum-Column_headings-Font_style;    text-decoration: Forum-Column_headings-Text_decoration;    color: Forum-Column_headings-Font_color;}.WaGadgetForumStateList .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td:not(.topicsCountTD):not(.repliesCountTD),.WaGadgetForum #idTopicListContainer .boxBodyOuterContainer table td:not(.repliesCountTD),.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.threadTD .thread a.forumTitle,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.lastReplyTD .lastReply a,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.lastReplyTD .lastReply span,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.threadTD div.thread a,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.lastReplyTD .lastReply a,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.lastReplyTD .lastReply span,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow.highlight td:not(.topicsCountTD):not(.repliesCountTD),.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow.highlight td.threadTD .thread a.forumTitle,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow.highlight td.lastReplyTD .lastReply a,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow.highlight td.lastReplyTD .lastReply span{    font-family: Forum-Table_row-Font_family;    font-size: Forum-Table_row-Font_size;    font-weight: Forum-Table_row-Font_weight;    font-style: Forum-Table_row-Font_style;    text-decoration: Forum-Table_row-Text_decoration;    color: Forum-Table_row-Font_color;    background-color: Forum-Table_row-Background_color;}.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.topicsCountTD .topicsCount,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.repliesCountTD .repliesCount,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow.highlight td.topicsCountTD .topicsCount,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow.highlight td.repliesCountTD .repliesCount,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.repliesCountTD .repliesCount span,.WaGadgetForumStateList .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td,.WaGadgetForum #idTopicListContainer .boxBodyOuterContainer table td,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow.highlight td.repliesCountTD,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow.highlight td.topicsCountTD{    font-family: Forum-Table_row-Font_family;    font-size: Forum-Table_row-Font_size;    font-weight: Forum-Table_row-Font_weight;    font-style: Forum-Table_row-Font_style;    color: Forum-Table_row-Font_color;    background-color: Forum-Table_row-Background_color;}.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.lastReplyTD .lastReply a,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.threadTD div.thread a,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.lastReplyTD .lastReply a{    color: Forum-Table_links-Font_color;}.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.threadTD .thread a.forumTitle:hover,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.lastReplyTD .lastReply a:hover,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.threadTD div.thread a:hover,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.lastReplyTD .lastReply a:hover{    color: Forum-Table_links_on_hover-Font_color;}.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.lastReplyTD .lastReply span,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.lastReplyTD .lastReply span,.WaGadgetForum.WaGadgetForumStateMessageList .messageListOuterContainer .messageListContainer ul.boxesList li.boxesListItem .boxBodyOuterContainer table.forumMessageTable td.left .boxBodyInfoOuterContainer .boxBodyInfoContainer a,.WaGadgetForum.WaGadgetForumStateMessageList .messageListOuterContainer .messageListContainer ul.boxesList li.boxesListItem .boxBodyOuterContainer table.forumMessageTable td.left .boxBodyInfoOuterContainer .boxBodyInfoContainer span.postedByComment{    font-family: Forum-Author-Font_family;    font-size: Forum-Author-Font_size;    font-weight: Forum-Author-Font_weight;    font-style: Forum-Author-Font_style;    text-decoration: Forum-Author-Text_decoration;    color: Forum-Author-Font_color;}.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.lastReplyTD .lastReply a,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.lastReplyTD .lastReply a,.WaGadgetForum.WaGadgetForumStateMessageList .messageListOuterContainer .messageListContainer ul.boxesList li.boxesListItem .boxHeaderOuterContainer table.forumMessageHeaderTable td.forumMessageHeaderInfoContainer .forumMessageHeaderInfo span{    font-family: Forum-Date_and_time-Font_family;    font-size: Forum-Date_and_time-Font_size;    font-weight: Forum-Date_and_time-Font_weight;    font-style: Forum-Date_and_time-Font_style;    text-decoration: Forum-Date_and_time-Text_decoration;    color: Forum-Date_and_time-Font_color;}.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.pageStateIconTD .pageStateIcon .anybodyIconDiv,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.pageStateIconTD .pageStateIcon .memberIconDiv,.WaGadgetForumStateList .forumCategoryListOuterContainer .forumCategoryOuterContainer .forumCategoryContainer .forumListContainer .boxBodyOuterContainer table.forumListTable tr.forumListRow td.pageStateIconTD .pageStateIcon .adminIconDiv,.WaGadgetForum.WaGadgetForumStateTopicList #idTopicListContainer .topicListContainer .boxBodyOuterContainer table tr.topicListRow td.threadImageTD div.threadImage,.WaGadgetForum.WaGadgetForumStateMessageList .messageListOuterContainer .messageListContainer ul.boxesList li.boxesListItem .boxHeaderOuterContainer table.forumMessageHeaderTable td.forumMessageHeaderBodyContainer .messageActionsContainer a:before{    color: Forum-Icons-Font_color;}.WaGadgetLoginForm .loginContainerWrapper .loginContainerInnerWrapper .loginLink,.WaGadgetLoginButton .loginBoxLinkContainer .loginBoxLinkButton{    color: Log_in_gadgets-Text-Font_color;}.WaGadgetLoginForm .loginContainerWrapper .loginContainerInnerWrapper .loginContainer .loginContainerForm.orientationHorizontal form [class$='TextBox'] input[class$='TextBoxControl'],.WaGadgetLoginForm .loginContainerWrapper .loginContainerInnerWrapper .loginContainer .loginContainerForm.orientationVertical form [class$='TextBox'] input[class$='TextBoxControl']{    color: Log_in_gadgets-Input_fields-Font_color;    background-color: Log_in_gadgets-Input_fields-Background_color;}.WaGadgetLoginForm .loginContainerWrapper .loginContainerInnerWrapper .loginContainer .loginContainerForm form [class$='Label'] label,.WaGadgetLoginForm .loginContainerWrapper .loginContainerInnerWrapper .loginContainer .loginContainerForm form .loginActionRememberMe label{    color: Log_in_gadgets-Labels-Font_color;}.WaGadgetLoginForm .loginContainerWrapper .loginContainerInnerWrapper .loginContainer .loginContainerForm form .loginPasswordForgot a,.WaGadgetLoginForm .loginContainerWrapper.authenticated .loginContainer .profileBox a,.WaGadgetLoginForm .loginContainerWrapper.authenticated .loginContainer .loggedAction .loginBoxLogout,.WaGadgetLoginButton .loginBoxLapsedMembership,.WaGadgetLoginButton .loginBoxProfileLink a,.WaGadgetLoginButton a.loginBoxChangePassword,.WaGadgetLoginButton a.loginBoxLogout,.WaGadgetLoginButton.gadgetStyle001 .loginButtonWrapper .loginBoxProfileLink a,.WaGadgetLoginButton.gadgetStyle001 .loginButtonWrapper a.loginBoxChangePassword,.WaGadgetLoginButton.gadgetStyle001 .loginButtonWrapper a.loginBoxLogout,.WaGadgetLoginButton.gadgetStyle001 .loginButtonWrapper .loginBoxLinkContainer .loginBoxLinkButton{    color: Log_in_gadgets-Links-Font_color;}.WaGadgetLoginForm .loginContainerWrapper .loginContainerInnerWrapper .loginContainer .loginContainerForm form .loginPasswordForgot a:hover,.WaGadgetLoginForm .loginContainerWrapper.authenticated .loginContainer .profileBox a:hover,.WaGadgetLoginForm .loginContainerWrapper.authenticated .loginContainer .loggedAction .loginBoxLogout:hover,.WaGadgetLoginButton .loginBoxLapsedMembership:hover,.WaGadgetLoginButton .loginBoxProfileLink a:hover,.WaGadgetLoginButton a.loginBoxChangePassword:hover,.WaGadgetLoginButton a.loginBoxLogout:hover,.WaGadgetLoginButton.gadgetStyle001 .loginButtonWrapper .loginBoxProfileLink a:hover,.WaGadgetLoginButton.gadgetStyle001 .loginButtonWrapper a.loginBoxChangePassword:hover,.WaGadgetLoginButton.gadgetStyle001 .loginButtonWrapper a.loginBoxLogout:hover,.WaGadgetLoginButton.gadgetStyle001 .loginButtonWrapper .loginBoxLinkContainer .loginBoxLinkButton:hover{    color: Log_in_gadgets-Links_on_hover-Font_color;}.WaGadgetLoginForm .loginContainerWrapper .loginContainerInnerWrapper .loginContainer .loginContainerForm form .loginAction input.loginButton{    color: Log_in_gadgets-Button-Font_color;    background: Log_in_gadgets-Button-Background_color;}.WaGadgetLoginForm .loginContainerWrapper .loginContainerInnerWrapper .loginContainer .loginContainerForm form .loginAction input.loginButton:hover{    color: Log_in_gadgets-Button_on_hover-Font_color;    background: Log_in_gadgets-Button_on_hover-Background_color;}a.stylizedButton.buttonStyle001{    background-color: Button_styles-Style_1-Normal-Background_color;    font-family: Button_styles-Style_1-Normal-Font_family;    font-size: Button_styles-Style_1-Normal-Font_size;    font-weight: Button_styles-Style_1-Normal-Font_weight;    font-style: Button_styles-Style_1-Normal-Font_style;    text-decoration: Button_styles-Style_1-Normal-Text_decoration;    color: Button_styles-Style_1-Normal-Font_color;}a.stylizedButton.buttonStyle001:hover{    background-color: Button_styles-Style_1-Hover-Background_color;    font-family: Button_styles-Style_1-Hover-Font_family;    font-size: Button_styles-Style_1-Hover-Font_size;    font-weight: Button_styles-Style_1-Hover-Font_weight;    font-style: Button_styles-Style_1-Hover-Font_style;    text-decoration: Button_styles-Style_1-Hover-Text_decoration;    color: Button_styles-Style_1-Hover-Font_color;}a.stylizedButton.buttonStyle002{    background-color: Button_styles-Style_2-Normal-Background_color;    font-family: Button_styles-Style_2-Normal-Font_family;    font-size: Button_styles-Style_2-Normal-Font_size;    font-weight: Button_styles-Style_2-Normal-Font_weight;    font-style: Button_styles-Style_2-Normal-Font_style;    text-decoration: Button_styles-Style_2-Normal-Text_decoration;    color: Button_styles-Style_2-Normal-Font_color;}a.stylizedButton.buttonStyle002:hover{    background-color: Button_styles-Style_2-Hover-Background_color;    font-family: Button_styles-Style_2-Hover-Font_family;    font-size: Button_styles-Style_2-Hover-Font_size;    font-weight: Button_styles-Style_2-Hover-Font_weight;    font-style: Button_styles-Style_2-Hover-Font_style;    text-decoration: Button_styles-Style_2-Hover-Text_decoration;    color: Button_styles-Style_2-Hover-Font_color;}a.stylizedButton.buttonStyle003{    background-color: Button_styles-Style_3-Normal-Background_color;    font-family: Button_styles-Style_3-Normal-Font_family;    font-size: Button_styles-Style_3-Normal-Font_size;    font-weight: Button_styles-Style_3-Normal-Font_weight;    font-style: Button_styles-Style_3-Normal-Font_style;    text-decoration: Button_styles-Style_3-Normal-Text_decoration;    color: Button_styles-Style_3-Normal-Font_color;}a.stylizedButton.buttonStyle003:hover{    background-color: Button_styles-Style_3-Hover-Background_color;    font-family: Button_styles-Style_3-Hover-Font_family;    font-size: Button_styles-Style_3-Hover-Font_size;    font-weight: Button_styles-Style_3-Hover-Font_weight;    font-style: Button_styles-Style_3-Hover-Font_style;    text-decoration: Button_styles-Style_3-Hover-Text_decoration;    color: Button_styles-Style_3-Hover-Font_color;}a.stylizedButton.buttonStyle004{    background-color: Button_styles-Style_4-Normal-Background_color;    font-family: Button_styles-Style_4-Normal-Font_family;    font-size: Button_styles-Style_4-Normal-Font_size;    font-weight: Button_styles-Style_4-Normal-Font_weight;    font-style: Button_styles-Style_4-Normal-Font_style;    text-decoration: Button_styles-Style_4-Normal-Text_decoration;    color: Button_styles-Style_4-Normal-Font_color;}a.stylizedButton.buttonStyle004:hover{    background-color: Button_styles-Style_4-Hover-Background_color;    font-family: Button_styles-Style_4-Hover-Font_family;    font-size: Button_styles-Style_4-Hover-Font_size;    font-weight: Button_styles-Style_4-Hover-Font_weight;    font-style: Button_styles-Style_4-Hover-Font_style;    text-decoration: Button_styles-Style_4-Hover-Text_decoration;    color: Button_styles-Style_4-Hover-Font_color;}/*     BREADCRUMBS     */ /* Style None */.WaGadgetBreadcrumbs.gadgetStyleNone ul li a,.WaGadgetBreadcrumbs.gadgetStyleNone ul li:before,.WaGadgetBreadcrumbs.gadgetStyleNone ul li.last span{    font-family: Navigation_gadgets-Breadcrumbs-Style_Basic-General-Font_family;    font-size: Navigation_gadgets-Breadcrumbs-Style_Basic-General-Font_size;    font-weight: Navigation_gadgets-Breadcrumbs-Style_Basic-General-Font_weight;    font-style: Navigation_gadgets-Breadcrumbs-Style_Basic-General-Font_style;}.WaGadgetBreadcrumbs.gadgetStyleNone ul li a,.WaGadgetBreadcrumbs.gadgetStyleNone ul li.last{    text-decoration: Navigation_gadgets-Breadcrumbs-Style_Basic-General-Text_decoration;}.WaGadgetBreadcrumbs.gadgetStyleNone ul li + li:before{    color: Navigation_gadgets-Breadcrumbs-Style_Basic-General-Font_color;}.WaGadgetBreadcrumbs.gadgetStyleNone ul li a,.WaGadgetBreadcrumbs.gadgetStyleNone ul li a:link,.WaGadgetBreadcrumbs.gadgetStyleNone ul li a:visited,.WaGadgetBreadcrumbs.gadgetStyleNone ul li a:active{    color: Navigation_gadgets-Breadcrumbs-Style_Basic-Link-Font_color;}.WaGadgetBreadcrumbs.gadgetStyleNone ul li a:hover{    color: Navigation_gadgets-Breadcrumbs-Style_Basic-Link_on_hover-Font_color;}.WaGadgetBreadcrumbs.gadgetStyleNone ul li.last{    color: Navigation_gadgets-Breadcrumbs-Style_Basic-Current_page-Font_color;}/* Style 001 */.WaGadgetBreadcrumbs.gadgetStyle001 ul li a,.WaGadgetBreadcrumbs.gadgetStyle001 ul li:before,.WaGadgetBreadcrumbs.gadgetStyle001 ul li.last span{    font-family: Navigation_gadgets-Breadcrumbs-Style_1-General-Font_family;    font-size: Navigation_gadgets-Breadcrumbs-Style_1-General-Font_size;    font-weight: Navigation_gadgets-Breadcrumbs-Style_1-General-Font_weight;    font-style: Navigation_gadgets-Breadcrumbs-Style_1-General-Font_style;}.WaGadgetBreadcrumbs.gadgetStyle001 ul li a,.WaGadgetBreadcrumbs.gadgetStyle001 ul li.last{    text-decoration: Navigation_gadgets-Breadcrumbs-Style_1-General-Text_decoration;}.WaGadgetBreadcrumbs.gadgetStyle001 ul li + li:before{color: Navigation_gadgets-Breadcrumbs-Style_1-General-Font_color;}.WaGadgetBreadcrumbs.gadgetStyle001 ul li a,.WaGadgetBreadcrumbs.gadgetStyle001 ul li a:link,.WaGadgetBreadcrumbs.gadgetStyle001 ul li a:visited,.WaGadgetBreadcrumbs.gadgetStyle001 ul li a:active{    color: Navigation_gadgets-Breadcrumbs-Style_1-Link-Font_color;}.WaGadgetBreadcrumbs.gadgetStyle001 ul li a:hover{    color: Navigation_gadgets-Breadcrumbs-Style_1-Link_on_hover-Font_color;}.WaGadgetBreadcrumbs.gadgetStyle001 ul li.last{    color: Navigation_gadgets-Breadcrumbs-Style_1-Current_page-Font_color;}.WaGadgetNavigationLinks.gadgetStyleNone ul li a,.WaGadgetNavigationLinks.gadgetStyleNone ul li a:hover,.WaGadgetNavigationLinks.gadgetStyleNone ul li a:link,.WaGadgetNavigationLinks.gadgetStyleNone ul li a:visited,.WaGadgetNavigationLinks.gadgetStyleNone ul li a:active{    color: Navigation_gadgets-Navigation_links-Style_basic-Link-Font_color;}.WaGadgetNavigationLinks.gadgetStyleNone ul li a:hover{    color: Navigation_gadgets-Navigation_links-Style_basic-Link_on_hover-Font_color;}.WaGadgetNavigationLinks.gadgetStyle001 ul li a,.WaGadgetNavigationLinks.gadgetStyle001 ul li a:hover,.WaGadgetNavigationLinks.gadgetStyle001 ul li a:link,.WaGadgetNavigationLinks.gadgetStyle001 ul li a:visited,.WaGadgetNavigationLinks.gadgetStyle001 ul li a:active{    color: Navigation_gadgets-Navigation_links-Style_1-Link-Font_color;}.WaGadgetNavigationLinks.gadgetStyle001 ul li a:hover{    color: Navigation_gadgets-Navigation_links-Style_1-Link_on_hover-Font_color;}/* HORIZONTAL MENU *//* normal state */.WaGadgetMenuHorizontal.menuStyle001 .stickness, .WaGadgetMenuHorizontal.menuStyle002 .stickness{    border-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Border_color;}.WaGadgetMenuHorizontal.menuStyle001 .menuInner,.WaGadgetMenuHorizontal.menuStyle001 .menuInner .menuButton{    background-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Normal-Background_color;}.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul.firstLevel > li > .item > a,.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul.firstLevel > li.sel > .item > a{    font-family: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Normal-Font_family;    color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul.firstLevel > li.sel > .item > a > span:after{    background-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul.firstLevel > li > .item:hover > a,.WaGadgetMenuHorizontal .menuInner ul.firstLevel > li.sel > .item:hover > a > span,.WaGadgetMenuHorizontal .menuInner ul.firstLevel > li > .item:hover > a > span{    color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul.firstLevel > li.sel > .item:hover > a > span:after{background-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul ul,.WaGadgetMenuHorizontal.menuStyle001 .menuInner.mobileView ul.firstLevel,.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul ul li{    background-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Drop_down-Normal-Background_color;}.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul ul > li > .item > a{    font-family: Navigation_gadgets-Horizontal_Menu-Normal_state-Drop_down-Normal-Font_family;    color: Navigation_gadgets-Horizontal_Menu-Normal_state-Drop_down-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul ul > li > .item > a:hover{    color: Navigation_gadgets-Horizontal_Menu-Normal_state-Drop_down-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul ul > li > .item:hover{    background-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Drop_down-Hover-Background_color;}/* wide state */.WaGadgetMenuHorizontal.menuStyle003 .menuInner,.WaGadgetMenuHorizontal.menuStyle003 .menuInner .menuButton,.WaGadgetMenuHorizontal.menuStyle003 .menuBackground{    background-color: Navigation_gadgets-Horizontal_Menu-Wide_state-Main-Normal-Background_color;}.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul.firstLevel > li > .item > a,.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul.firstLevel > li.sel > .item > a{    font-family: Navigation_gadgets-Horizontal_Menu-Wide_state-Main-Normal-Font_family;    color: Navigation_gadgets-Horizontal_Menu-Wide_state-Main-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul.firstLevel > li.sel > .item > a > span:after{    background-color: Navigation_gadgets-Horizontal_Menu-Wide_state-Main-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul.firstLevel > li > .item:hover > a,.WaGadgetMenuHorizontal .menuInner ul.firstLevel > li.sel > .item:hover > a > span{    color: Navigation_gadgets-Horizontal_Menu-Wide_state-Main-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul.firstLevel > li.sel > .item:hover > a > span:after{background-color: Navigation_gadgets-Horizontal_Menu-Wide_state-Main-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul ul,.WaGadgetMenuHorizontal.menuStyle003 .menuInner.mobileView ul.firstLevel,.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul ul li{    background-color: Navigation_gadgets-Horizontal_Menu-Wide_state-Drop_down-Normal-Background_color;}.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul ul > li > .item > a{    font-family: Navigation_gadgets-Horizontal_Menu-Wide_state-Drop_down-Normal-Font_family;    color: Navigation_gadgets-Horizontal_Menu-Wide_state-Drop_down-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul ul > li > .item > a:hover{    color: Navigation_gadgets-Horizontal_Menu-Wide_state-Drop_down-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul ul > li > .item:hover{    background-color: Navigation_gadgets-Horizontal_Menu-Wide_state-Drop_down-Hover-Background_color;}/* mixed state - sticky *//* normal substate - taking setting from 'normal' */.WaGadgetMenuHorizontal.menuStyle002 .menuInner,.WaGadgetMenuHorizontal.menuStyle002 .menuInner .menuButton,.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuBackground{    background-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Normal-Background_color;}.WaGadgetMenuHorizontal.menuStyle002 .menuInner ul.firstLevel > li > .item > a,.WaGadgetMenuHorizontal.menuStyle002 .menuInner ul.firstLevel > li.sel > .item > a{    font-family: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Normal-Font_family;    color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle002 .menuInner ul.firstLevel > li.sel > .item > a > span:after{    background-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle002 .menuInner ul.firstLevel > li > .item:hover > a,.WaGadgetMenuHorizontal .menuInner ul.firstLevel > li.sel > .item:hover > a > span,.WaGadgetMenuHorizontal .menuInner ul.firstLevel > li > .item:hover > a > span{    color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle001 .menuInner ul.firstLevel > li.sel > .item:hover > a > span:after,.WaGadgetMenuHorizontal.menuStyle002 .menuInner ul.firstLevel > li.sel > .item:hover > a > span:after,.WaGadgetMenuHorizontal.menuStyle003 .menuInner ul.firstLevel > li.sel > .item:hover > a > span:after{    background-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Main-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle002 .menuInner ul ul,.WaGadgetMenuHorizontal.menuStyle002 .menuInner.mobileView ul.firstLevel,.WaGadgetMenuHorizontal.menuStyle002 .menuInner ul ul li{    background-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Drop_down-Normal-Background_color;}.WaGadgetMenuHorizontal.menuStyle002 .menuInner ul ul > li > .item > a{    font-family: Navigation_gadgets-Horizontal_Menu-Normal_state-Drop_down-Normal-Font_family;    color: Navigation_gadgets-Horizontal_Menu-Normal_state-Drop_down-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle002 .menuInner ul ul > li > .item > a:hover{    color: Navigation_gadgets-Horizontal_Menu-Normal_state-Drop_down-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle002 .menuInner ul ul > li > .item:hover{    background-color: Navigation_gadgets-Horizontal_Menu-Normal_state-Drop_down-Hover-Background_color;}/* wide (sticked) substate - taking setting from 'wide' */.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner,.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner .menuButton,.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuBackground{    background-color: Navigation_gadgets-Horizontal_Menu-Wide_state-Main-Normal-Background_color;}.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner ul.firstLevel > li > .item > a,.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner ul.firstLevel > li.sel > .item > a{    font-family: Navigation_gadgets-Horizontal_Menu-Wide_state-Main-Normal-Font_family;    color: Navigation_gadgets-Horizontal_Menu-Wide_state-Main-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner ul.firstLevel > li > .item:hover > a,.WaGadgetMenuHorizontal .stickness.stick .menuInner ul.firstLevel > li.sel > .item:hover > a > span{    color: Navigation_gadgets-Horizontal_Menu-Wide_state-Main-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner ul ul,.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner.mobileView ul.firstLevel,.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner ul ul li{    background-color: Navigation_gadgets-Horizontal_Menu-Wide_state-Drop_down-Normal-Background_color;}.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner ul ul > li > .item > a{    font-family: Navigation_gadgets-Horizontal_Menu-Wide_state-Drop_down-Normal-Font_family;    color: Navigation_gadgets-Horizontal_Menu-Wide_state-Drop_down-Normal-Font_color;}.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner ul ul > li > .item > a:hover{    color: Navigation_gadgets-Horizontal_Menu-Wide_state-Drop_down-Hover-Font_color;}.WaGadgetMenuHorizontal.menuStyle002 .stickness.stick .menuInner ul ul > li > .item:hover{    background-color: Navigation_gadgets-Horizontal_Menu-Wide_state-Drop_down-Hover-Background_color;}/* VERTICAL MENU */.WaGadgetMenuVertical.menuStyleNone .menuInner{    background-color: Navigation_gadgets-Vertical_Menu-Style_basic-Main-Normal-Background_color;}.WaGadgetMenuVertical.menuStyleNone .menuInner ul.firstLevel > li > .item > a{    font-family: Navigation_gadgets-Vertical_Menu-Style_basic-Main-Normal-Font_family;    color: Navigation_gadgets-Vertical_Menu-Style_basic-Main-Normal-Font_color;}.WaGadgetMenuVertical.menuStyleNone .menuInner ul.firstLevel > li:hover > .item > a{    color: Navigation_gadgets-Vertical_Menu-Style_basic-Main-Hover-Font_color;}.WaGadgetMenuVertical.menuStyleNone .menuInner ul ul li{    background-color: Navigation_gadgets-Vertical_Menu-Style_basic-Drop_down-Normal-Background_color;}.WaGadgetMenuVertical.menuStyleNone .menuInner ul ul > li > .item > a{    font-family: Navigation_gadgets-Vertical_Menu-Style_basic-Drop_down-Normal-Font_family;    color: Navigation_gadgets-Vertical_Menu-Style_basic-Drop_down-Normal-Font_color;}.WaGadgetMenuVertical.menuStyleNone .menuInner ul ul > li:hover > .item{    background-color: Navigation_gadgets-Vertical_Menu-Style_basic-Drop_down-Hover-Background_color;}.WaGadgetMenuVertical.menuStyleNone .menuInner ul ul > li:hover > .item a{    color: Navigation_gadgets-Vertical_Menu-Style_basic-Drop_down-Hover-Font_color;}.WaGadgetMenuVertical.menuStyle001 .menuInner{    background-color: Navigation_gadgets-Vertical_Menu-Style_1-Main-Normal-Background_color;}.WaGadgetMenuVertical.menuStyle001 .menuInner ul.firstLevel > li > .item > a{    font-family: Navigation_gadgets-Vertical_Menu-Style_1-Main-Normal-Font_family;    color: Navigation_gadgets-Vertical_Menu-Style_1-Main-Normal-Font_color;}.WaGadgetMenuVertical.menuStyle001 .menuInner ul.firstLevel > li:hover > .item > a{    color: Navigation_gadgets-Vertical_Menu-Style_1-Main-Hover-Font_color;}.WaGadgetMenuVertical.menuStyle001 .menuInner ul ul li{    background-color: Navigation_gadgets-Vertical_Menu-Style_1-Drop_down-Normal-Background_color;}.WaGadgetMenuVertical.menuStyle001 .menuInner ul ul > li > .item > a{    font-family: Navigation_gadgets-Vertical_Menu-Style_1-Drop_down-Normal-Font_family;    color: Navigation_gadgets-Vertical_Menu-Style_1-Drop_down-Normal-Font_color;}.WaGadgetMenuVertical.menuStyle001 .menuInner ul ul > li:hover > .item{    background-color: Navigation_gadgets-Vertical_Menu-Style_1-Drop_down-Hover-Background_color;}.WaGadgetMenuVertical.menuStyle001 .menuInner ul ul > li:hover > .item a{    color: Navigation_gadgets-Vertical_Menu-Style_1-Drop_down-Hover-Font_color;}/* SECONDARY MENU */.WaGadgetCustomMenu.gadgetStyleNone ul li a,.WaGadgetCustomMenu.gadgetStyleNone ul.orientationHorizontal li:after{    font-family: Navigation_gadgets-Secondary_menu-Style_basic-Font_family;    font-size: Navigation_gadgets-Secondary_menu-Style_basic-Font_size;    font-weight: Navigation_gadgets-Secondary_menu-Style_basic-Font_weight;    font-style: Navigation_gadgets-Secondary_menu-Style_basic-Font_style;    color: Navigation_gadgets-Secondary_menu-Style_basic-Link-Font_color;}.WaGadgetCustomMenu.gadgetStyleNone ul li a:hover{    color: Navigation_gadgets-Secondary_menu-Style_basic-Link_on_hover-Font_color;}.WaGadgetCustomMenu.gadgetStyle001 ul li a,.WaGadgetCustomMenu.gadgetStyle001 ul.orientationHorizontal li:after{    font-family: Navigation_gadgets-Secondary_menu-Style_1-Font_family;    font-size: Navigation_gadgets-Secondary_menu-Style_1-Font_size;    font-weight: Navigation_gadgets-Secondary_menu-Style_1-Font_weight;    font-style: Navigation_gadgets-Secondary_menu-Style_1-Font_style;    color: Navigation_gadgets-Secondary_menu-Style_1-Link-Font_color;}.WaGadgetCustomMenu.gadgetStyle001 ul li a:hover{    color: Navigation_gadgets-Secondary_menu-Style_1-Link_on_hover-Font_color;}.WaGadgetCustomMenu.gadgetStyle002 ul li a,.WaGadgetCustomMenu.gadgetStyle002 ul.orientationHorizontal li:after{    font-family: Navigation_gadgets-Secondary_menu-Style_2-Font_family;    font-size: Navigation_gadgets-Secondary_menu-Style_2-Font_size;    font-weight: Navigation_gadgets-Secondary_menu-Style_2-Font_weight;    font-style: Navigation_gadgets-Secondary_menu-Style_2-Font_style;    color: Navigation_gadgets-Secondary_menu-Style_2-Link-Font_color;}.WaGadgetCustomMenu.gadgetStyle002 ul li a:hover{    color: Navigation_gadgets-Secondary_menu-Style_2-Link_on_hover-Font_color;}/* SITEMAP */.WaGadgetSiteMap.gadgetStyleNone ul,.WaGadgetSiteMap.gadgetStyleNone ul li a{    font-family: Navigation_gadgets-Sitemap-Style_basic-General-Font_family;    font-size: Navigation_gadgets-Sitemap-Style_basic-General-Font_size;    font-weight: Navigation_gadgets-Sitemap-Style_basic-General-Font_weight;    font-style: Navigation_gadgets-Sitemap-Style_basic-General-Font_style;    text-decoration: Navigation_gadgets-Sitemap-Style_basic-General-Text_decoration;    color: Navigation_gadgets-Sitemap-Style_basic-Link-Font_color;}.WaGadgetSiteMap.gadgetStyleNone ul li a:hover{    color: Navigation_gadgets-Sitemap-Style_basic-Link_on_hover-Font_color;}.WaGadgetSiteMap.gadgetStyle001 ul,.WaGadgetSiteMap.gadgetStyle001 ul li a{    font-family: Navigation_gadgets-Sitemap-Style_1-General-Font_family;    font-size: Navigation_gadgets-Sitemap-Style_1-General-Font_size;    font-weight: Navigation_gadgets-Sitemap-Style_1-General-Font_weight;    font-style: Navigation_gadgets-Sitemap-Style_1-General-Font_style;    text-decoration: Navigation_gadgets-Sitemap-Style_1-General-Text_decoration;    color: Navigation_gadgets-Sitemap-Style_1-Link-Font_color;}.WaGadgetSiteMap.gadgetStyle001 ul li a:hover{    color: Navigation_gadgets-Sitemap-Style_1-Link_on_hover-Font_color;}/* WA BRANDING ZONE */.zoneBrandingOuter{    background-color: WA_Branding-Backgrounds-Outer_branding-Background_color;    background-image: WA_Branding-Backgrounds-Outer_branding-Background_image;    background-position: WA_Branding-Backgrounds-Outer_branding-Background_position;    background-repeat: WA_Branding-Backgrounds-Outer_branding-Background_repeat;}.zoneBrandingOuter .container_12 > DIV{    background-color: WA_Branding-Backgrounds-Branding-Background_color;    background-image: WA_Branding-Backgrounds-Branding-Background_image;    background-position: WA_Branding-Backgrounds-Branding-Background_position;    background-repeat: WA_Branding-Backgrounds-Branding-Background_repeat;}#idFooterPoweredByWA{    font-size: WA_Branding-Text-Font_size;    font-weight: WA_Branding-Text-Font_weight;    font-style: WA_Branding-Text-Font_style;    font-family: WA_Branding-Text-Font_family;    color: WA_Branding-Text-Font_color;}#idFooterPoweredByWA a{    background-color: WA_Branding-Link-Background_color;    font-family: WA_Branding-Link-Font_family;    font-size: WA_Branding-Link-Font_size;    font-weight: WA_Branding-Link-Font_weight;    font-style: WA_Branding-Link-Font_style;    text-decoration: WA_Branding-Link-Text_decoration;    color: WA_Branding-Link-Font_color;}#idFooterPoweredByWA a:hover{    background-color: WA_Branding-Link_on_hover-Background_color;    text-decoration: WA_Branding-Link_on_hover-Text_decoration;    color: WA_Branding-Link_on_hover-Font_color;}";
