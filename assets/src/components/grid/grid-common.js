import { orCharacter as orFilterCharacter, equalCharacter as equalFilterCharacter } from '../filter';

export function getFilterTextDependOnKeyPressed(key, text) {
    return key === 'Enter' ? `${text}${orFilterCharacter}` : text;
}

export function handleFilterPastedText(input) {
    const result = input.trim().replace(/\n/g, `${orFilterCharacter}${equalFilterCharacter}`);
    return result ? `${equalFilterCharacter}${result}` : result;
}
