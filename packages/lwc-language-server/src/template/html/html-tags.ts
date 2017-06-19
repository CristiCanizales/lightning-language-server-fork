/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/* tslint:disable */

import { binarySearch } from './utils';

export const EMPTY_ELEMENTS: string[] = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
];

export function isEmptyElement(e: string): boolean {
    return (
        !!e &&
        binarySearch(
            EMPTY_ELEMENTS,
            e.toLowerCase(),
            (s1: string, s2: string) => s1.localeCompare(s2),
        ) >= 0
    );
}
