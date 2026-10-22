const calendarId = import.meta.env.VITE_GOOGLE_CALENDAR_ID;
const browserKey = import.meta.env.VITE_GOOGLE_API_KEY;
export const connectedCalendar = Boolean(calendarId && browserKey);
export const calendarPublicUrl = import.meta.env.VITE_CALENDAR_PUBLIC_URL || '';
const TZ = 'America/New_York';
const dateParts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
export function nyDateKey(date) {
  const p = Object.fromEntries(dateParts.formatToParts(date).map(({type,value})=>[type,value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function eventStart(event) { return event.start?.dateTime ? new Date(event.start.dateTime) : new Date(`${event.start?.date}T12:00:00Z`); }
export function eventEnd(event) { return event.end?.dateTime ? new Date(event.end.dateTime) : new Date(`${event.end?.date}T12:00:00Z`); }
export function eventDateKey(event) { return event.start?.date || nyDateKey(eventStart(event)); }
export function prettyDate(date, options={}) { return new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', ...options }).format(date); }
export function prettyTime(date) { return new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour:'numeric', minute:'2-digit', timeZoneName:'short' }).format(date); }
export function displayEventDate(event) { return `${prettyDate(eventStart(event),{weekday:'short'})}${event.start?.date ? ' · All day' : ` · ${prettyTime(eventStart(event))}`}`; }
export function dateForKey(key) { const [y,m,d]=key.split('-').map(Number); return new Date(y,m-1,d,12); }
export function shiftDateKey(key,days) { const d=dateForKey(key); d.setDate(d.getDate()+days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function mondayKey(key) { const d=dateForKey(key); const offset=(d.getDay()+6)%7; return shiftDateKey(key,-offset); }
export function initialSemester(key=nyDateKey(new Date())) { const [year,month]=key.split('-').map(Number); return {year,term:month<=5?'Spring':month<=7?'Summer':'Fall'}; }
export function semesterBounds(sem) { const starts={Spring:1,Summer:6,Fall:8}; const ends={Spring:5,Summer:7,Fall:12}; return {start:`${sem.year}-${String(starts[sem.term]).padStart(2,'0')}-01`,end:`${sem.year}-${String(ends[sem.term]).padStart(2,'0')}-${ends[sem.term]===12?'31':ends[sem.term]===7?'31':'31'}`}; }
export function moveSemester(sem,direction) { const terms=['Spring','Summer','Fall']; let i=terms.indexOf(sem.term)+direction; return {year:sem.year+(i<0?-1:i>2?1:0),term:terms[(i+3)%3]}; }
export async function loadCalendarEvents(signal) {
  if (!connectedCalendar) return [];
  const cacheKey=`ieee-eps-events:${calendarId}`;
  try { const existing=JSON.parse(sessionStorage.getItem(cacheKey)||'null'); if(existing && Date.now()-existing.at < 5*60*1000) return existing.items; } catch { /* blocked storage */ }
  // Use a bounded window covering archives and near-future events, expanding recurring instances.
  const now=new Date(), beginning=new Date(Date.UTC(now.getUTCFullYear()-2,0,1));
  const ending=new Date(Date.UTC(now.getUTCFullYear()+2,0,1));
  const events=[];
  let pageToken='';
  do {
    const url=new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
    const params={key:browserKey,singleEvents:'true',orderBy:'startTime',showDeleted:'false',maxResults:'2500',timeMin:beginning.toISOString(),timeMax:ending.toISOString()};
    Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
    if(pageToken) url.searchParams.set('pageToken',pageToken);
    const response=await fetch(url.toString(),{signal});
    if(!response.ok) throw new Error(`Google Calendar returned HTTP ${response.status}`);
    const body=await response.json();
    events.push(...(body.items||[]).filter(e=>e.status!=='cancelled' && (e.start?.dateTime || e.start?.date)));
    pageToken=body.nextPageToken||'';
  } while(pageToken && events.length<10000);
  events.sort((a,b)=>eventStart(a)-eventStart(b));
  try { sessionStorage.setItem(cacheKey,JSON.stringify({at:Date.now(),items:events})); } catch { /* blocked storage */ }
  return events;
}
