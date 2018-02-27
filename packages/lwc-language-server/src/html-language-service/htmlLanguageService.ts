/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { createScanner } from './parser/htmlScanner';
import { parse } from './parser/htmlParser';
import { doComplete } from './services/htmlCompletion';
import { doHover } from './services/htmlHover';
import { findDefinition } from './services/htmlDefinition';
import { TextDocument, Position, CompletionItem, CompletionList, Hover, Range, SymbolInformation, Diagnostic, TextEdit, DocumentHighlight, FormattingOptions, MarkedString, DocumentLink, Location } from 'vscode-languageserver-types';

export { TextDocument, Position, CompletionItem, CompletionList, Hover, Range, SymbolInformation, Diagnostic, TextEdit, DocumentHighlight, FormattingOptions, MarkedString, DocumentLink, Location };

export interface HTMLFormatConfiguration {
	tabSize?: number;
	insertSpaces?: boolean;
	wrapLineLength?: number;
	unformatted?: string;
	contentUnformatted?: string;
	indentInnerHtml?: boolean;
	wrapAttributes?: 'auto' | 'force' | 'force-aligned' | 'force-expand-multiline';
	preserveNewLines?: boolean;
	maxPreserveNewLines?: number;
	indentHandlebars?: boolean;
	endWithNewline?: boolean;
	extraLiners?: string;
}

export interface CompletionConfiguration {
	[provider: string]: boolean | undefined;
	hideAutoCompleteProposals?: boolean;
}

export interface Node {
	tag: string;
	start: number;
	end: number;
	endTagStart: number;
	children: Node[];
	parent?: Node;
	attributes?: { [name: string]: string | null };
}


export enum TokenType {
	StartCommentTag,
	Comment,
	EndCommentTag,
	StartTagOpen,
	StartTagClose,
	StartTagSelfClose,
	StartTag,
	EndTagOpen,
	EndTagClose,
	EndTag,
	DelimiterAssign,
	AttributeName,
	AttributeValue,
	StartDoctypeTag,
	Doctype,
	EndDoctypeTag,
	Content,
	Whitespace,
	Unknown,
	Script,
	Styles,
	EOS
}

export enum ScannerState {
	WithinContent,
	AfterOpeningStartTag,
	AfterOpeningEndTag,
	WithinDoctype,
	WithinTag,
	WithinEndTag,
	WithinComment,
	WithinScriptContent,
	WithinStyleContent,
	AfterAttributeName,
	BeforeAttributeValue
}

export interface Scanner {
	scan(): TokenType;
	getTokenType(): TokenType;
	getTokenOffset(): number;
	getTokenLength(): number;
	getTokenEnd(): number;
	getTokenText(): string;
	getTokenError(): string | undefined;
	getScannerState(): ScannerState;
}

export declare type HTMLDocument = {
	roots: Node[];
	findNodeBefore(offset: number): Node;
	findNodeAt(offset: number): Node;
};

export interface DocumentContext {
	resolveReference(ref: string, base?: string): string;
}

export interface LanguageService {
	createScanner(input: string): Scanner;
	parseHTMLDocument(document: TextDocument): HTMLDocument;
	doComplete(document: TextDocument, position: Position, htmlDocument: HTMLDocument, sfdxWorkspace: boolean, options?: CompletionConfiguration): CompletionList;
	doHover(document: TextDocument, position: Position, htmlDocument: HTMLDocument): Hover | null;
	findDefinition(document: TextDocument, position: Position, htmlDocument: HTMLDocument): Location | null;
}

export function getLanguageService(): LanguageService {
	return {
		createScanner,
		parseHTMLDocument: document => parse(document.getText()),
		doComplete,
		doHover,
		findDefinition
	};
}