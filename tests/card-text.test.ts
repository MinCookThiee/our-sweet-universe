import {test} from "node:test";
import assert from "node:assert/strict";
import {cardTextInput,defaultCardText} from "../src/lib/card-text";
test("card defaults fit limits and whitespace-only text is refused",()=>{
 assert.equal(cardTextInput.safeParse(defaultCardText).success,true);
 for (const key of ['ribbon','heading','message']) assert.equal(cardTextInput.safeParse({...defaultCardText,[key]:'   '}).success,false);
});
test("card text rejects oversized fields and discards ownership fields",()=>{
 for (const [key,length] of [['ribbon',33],['heading',71],['message',161]] as const) assert.equal(cardTextInput.safeParse({...defaultCardText,[key]:'x'.repeat(length)}).success,false);
 assert.equal('coupleId' in cardTextInput.parse({...defaultCardText,coupleId:'untrusted'}),false);
});
