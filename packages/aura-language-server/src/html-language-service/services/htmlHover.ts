/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { HTMLDocument } from '../parser/htmlParser';
import { createScanner } from '../parser/htmlScanner';
import { TextDocument, Range, Position, Hover, MarkedString, MarkupKind } from 'vscode-languageserver-types';
import { allTagProviders } from './tagProviders';
import { TokenType } from '../htmlLanguageTypes';

export function doHover(document: TextDocument, position: Position, htmlDocument: HTMLDocument): Hover | null {
    let offset = document.offsetAt(position);
    let node = htmlDocument.findNodeAt(offset);
    if (!node || !node.tag) {
        return null;
    }
    let tagProviders = allTagProviders.filter(p => p.isApplicable(document.languageId));
    function getTagHover(tag: string, range: Range, open: boolean): Hover | null {
        // **** CHANGES TO HTML LANGUAGE SERVICE HERE **** //
        //tag = tag.toLowerCase();
        for (let provider of tagProviders) {
            let hover = null;
            provider.collectTags((t, label, info) => {
                if (t === tag || t === tag.toLowerCase()) {
                    if (info) {
                        const doc = info.getHover();
                        const tagLabel = open ? '<' + tag + '>' : '</' + tag + '>';
                        const markdown = [
                            '```html',
                            tagLabel,
                            '```',
                            doc
                        ];
                        hover = { contents: { kind: MarkupKind.Markdown, value: markdown.join('\n') }, range };
                    }
                }
            });
            if (hover) {
                return hover;
            }
        }
        return null;
    }

    function getTagNameRange(tokenType: TokenType, startOffset: number): Range | null {
        let scanner = createScanner(document.getText(), startOffset);
        let token = scanner.scan();
        while (token !== TokenType.EOS && (scanner.getTokenEnd() < offset || (scanner.getTokenEnd() === offset && token !== tokenType))) {
            token = scanner.scan();
        }
        if (token === tokenType && offset <= scanner.getTokenEnd()) {
            return { start: document.positionAt(scanner.getTokenOffset()), end: document.positionAt(scanner.getTokenEnd()) };
        }
        return null;
    }

    if (node.endTagStart && offset >= node.endTagStart) {
        let tagRange = getTagNameRange(TokenType.EndTag, node.endTagStart);
        if (tagRange) {
            return getTagHover(node.tag, tagRange, false);
        }
        return null;
    }

    let tagRange = getTagNameRange(TokenType.StartTag, node.start);
    if (tagRange) {
        return getTagHover(node.tag, tagRange, true);
    }
    return null;
}
