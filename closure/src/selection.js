
goog.module('selection');

goog.require('goog.dom.selection');


exports.setCursorAtEnd = function($element) {
	goog.dom.selection.setCursorPosition($element, $element.value ? $element.value.length : 0);
}

exports.getStart = goog.dom.selection.getStart;
exports.getEnd = goog.dom.selection.getEnd;
exports.setStart = goog.dom.selection.setStart;
exports.setEnd = goog.dom.selection.setEnd;
