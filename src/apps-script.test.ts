import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, it, expect, vi } from 'vitest';
import { buildSubmissionRecord } from './submission-record';
import { fresh, finalise } from './model';
import { projects } from './data';
const code = readFileSync(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8');
function receiver() {
  const rows: (string | number)[][] = [];
  const formats: string[][][] = [];
  let locked = false;
  const lock = { waitLock: vi.fn(()=>{locked=true;}), hasLock:()=>locked, releaseLock:vi.fn(()=>{locked=false;}) };
  const sheet = {
    getMaxColumns:()=>100, insertColumnsAfter:vi.fn(), getLastRow:()=>rows.length,
    setFrozenRows:vi.fn(),setColumnWidths:vi.fn(),
    getRange:(r:number,c:number,n=1,_m=1)=>{
      const range = {
        setValues:(values:(string|number)[][])=>{values.forEach((row,i)=>{rows[r+i-1] ||= [];row.forEach((v,j)=>{rows[r+i-1][c+j-1]=typeof v==='string'&&v.startsWith("'")?v.slice(1):v;});});return range;},
        getValues:()=>Array.from({length:n},(_,i)=>rows[r+i-1]||[]),
        getValue:()=>rows[r-1]?.[c-1]||'',
        setFontWeight:()=>range,setBackground:()=>range,setFontColor:()=>range,
        setNumberFormats:(v:string[][])=>{formats.push(v);return range;},
        createTextFinder:(text:string)=>({matchEntireCell:()=>({findNext:()=>{
          const index=rows.findIndex((row,i)=>i>=r-1&&row[c-1]===text);
          return index===-1?null:{getRow:()=>index+1};
        }})}),
      };return range;
    },
  };
  const context = {
    PropertiesService:{getScriptProperties:()=>({getProperty:(key:string)=>key==='SPREADSHEET_ID'?'sheet-id':'private-token'})},
    LockService:{getScriptLock:()=>lock},
    SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:vi.fn()},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:(s:string)=>({setMimeType:()=>JSON.parse(s)})},
  };
  const api = runInNewContext(`${code}; ({doPost})`,context) as {doPost:(e:unknown)=>{ok:boolean;receivedAt?:string;submissionId?:string}};
  const receive=(record:unknown,token='private-token')=>api.doPost({postData:{contents:JSON.stringify({token,record})}});
  return {rows,formats,lock,receive};
}
const record=()=>buildSubmissionRecord(finalise({...fresh(),company:'=HYPERLINK("https://example.org")',members:['Alex Smith'],strategy:'efficiency',selected:projects.slice(0,10).map(p=>p.id),price:'45000',rationale:'A fair price.',justification:Array(100).fill('strategy').join(' '),approved:true}));
describe('Google Apps Script receiver',()=>{
  it('appends one complete row, keeps numeric values and formats, and locks writing',()=>{const r=receiver(),data=record();const result=r.receive(data);expect(result.ok).toBe(true);expect(r.rows).toHaveLength(2);expect(r.rows[0]).toHaveLength(79);expect(r.rows[1]).toHaveLength(79);expect(r.rows[1][r.rows[0].indexOf('Project_Budget_GBP')]).toBe(75000000);expect(r.rows[1][r.rows[0].indexOf('Company_Name')]).toBe(data.Company_Name);expect(r.formats[0][0][r.rows[0].indexOf('Company_Name')]).toBe('@');expect(r.formats[0][0][r.rows[0].indexOf('Fulfilment_Rate')]).toBe('0%');expect(r.lock.waitLock).toHaveBeenCalled();expect(r.lock.releaseLock).toHaveBeenCalled();});
  it('returns original receipt for retry without appending another row',()=>{const r=receiver(),data=record();const first=r.receive(data);const second=r.receive(data);expect(second).toEqual(first);expect(r.rows).toHaveLength(2);expect(r.lock.releaseLock).toHaveBeenCalledTimes(2);});
  it('rejects wrong tokens, invalid UUIDs and header changes without adding data',()=>{const r=receiver(),data=record();expect(r.receive(data,'wrong').ok).toBe(false);expect(r.rows).toHaveLength(0);expect(r.receive({...data,Submission_ID:'bad'}).ok).toBe(false);expect(r.receive(data).ok).toBe(true);r.rows[0][2]='Edited_Header';expect(r.receive(record()).ok).toBe(false);expect(r.rows).toHaveLength(2);expect(r.lock.releaseLock).toHaveBeenCalledTimes(2);});
});
