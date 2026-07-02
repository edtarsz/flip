const fs = require('fs');
const html = fs.readFileSync('/home/edtarsz/Documents/Repositories/flip/frontend/src/app/features/films/film-details/film-details.html', 'utf8');

let stack = [];
let regex = /<\/?([a-z0-9-]+)[^>]*>/gi;
let match;
let line = 1;

while ((match = regex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const isClosing = match[0].startsWith('</');
    const isSelfClosing = match[0].endsWith('/>') || ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tag);

    // Calculate line number
    line = html.substring(0, match.index).split('\n').length;

    if (!isClosing && !isSelfClosing) {
        stack.push({ tag, line });
    } else if (isClosing) {
        if (stack.length === 0) {
            console.log(`Error: Unexpected closing tag </${tag}> at line ${line}`);
            break;
        }
        const last = stack.pop();
        if (last.tag !== tag) {
            console.log(`Error: Mismatched tag. Expected </${last.tag}> but got </${tag}> at line ${line}. Opening tag was at line ${last.line}`);
            break;
        }
    }
}

if (stack.length > 0) {
    console.log('Error: Unclosed tags remaining:', stack);
} else {
    console.log('All tags matched correctly!');
}
