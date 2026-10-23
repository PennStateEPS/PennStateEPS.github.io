import React, { useEffect, useMemo, useState, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { storyblokInit, apiPlugin, useStoryblokBridge, storyblokEditable } from '@storyblok/react';
import { organization as org, leadership, verifiedHighlights, confirmedPartners, faqs, links } from './content';
import { loadCalendarEvents, connectedCalendar, calendarPublicUrl, eventStart, eventEnd, eventDateKey, nyDateKey, dateForKey, prettyDate, prettyTime, displayEventDate, shiftDateKey, mondayKey, initialSemester, semesterBounds, moveSemester } from './calendar';
import './styles.css';

// This is Storyblok's PUBLIC read-only Delivery API token (never an admin or preview token).
// Until it is configured and the Home story is published, the existing homepage remains intact.
const storyblokToken = (import.meta.env.VITE_STORYBLOK_PUBLIC_TOKEN || '').trim();
const storyblokRegion = (import.meta.env.VITE_STORYBLOK_REGION || 'eu').trim().toLowerCase();
if (storyblokToken) {
  storyblokInit({
    accessToken: storyblokToken,
    use: [apiPlugin],
    apiOptions: { region: storyblokRegion },
  });
}

const SiteContext = createContext({ openForm:()=>{}, openEvent:()=>{} });
const useSite = () => useContext(SiteContext);

function Icon({name,size=18,strokeWidth=1.8,...props}){
  const paths={
    arrow:<><path d="M4 12h15m-6-6 6 6-6 6"/></>, chevron:<path d="m9 18 6-6-6-6"/>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    pin:<><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></>,
    external:<><path d="M14 4h6v6M10 14 20 4M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6"/></>,
    plus:<path d="M12 5v14M5 12h14"/>, minus:<path d="M5 12h14"/>,
    close:<path d="M18 6 6 18M6 6l12 12"/>,
    menu:<path d="M4 7h16M4 12h16M4 17h16"/>,
    linkedin:<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m0-10v.1m4 9.9v-7m0 3a3 3 0 0 1 6 0v4"/></>,
    check:<path d="m5 12 5 5L20 7"/>,
    bolt:<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8"/>,
    people:<><circle cx="9" cy="8" r="3"/><path d="M3 19v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m2 8v-2a5 5 0 0 0-3-4.6"/></>,
    layers:<><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    globe:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-6 5-6 13 0 18m0-18c6 5 6 13 0 18"/></>,
    filter:<><path d="M3 6h18M7 12h10m-7 6h4"/></>,
    checkcircle:<><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]||paths.arrow}</svg>;
}
function Brand({compact=false}){return <a className="brand" href="#home" aria-label="IEEE EPS Penn State, homepage"><span className="brand-emblem"><span className="brand-circuit"/></span><span className="brand-copy"><strong>IEEE <b>EPS</b> <span>PENN STATE</span></strong>{!compact&&<small>STUDENT CHAPTER</small>}</span></a>}
function Header(){const [opened,setOpened]=useState(false);const {openForm}=useSite();return <><div className="topline"><div className="container topline-inner"><span><span className="top-dot"/> IEEE Electronics Packaging Society · Penn State</span><span>Established 2026 <span className="topline-arrow">↗</span></span></div></div><header className="site-header"><div className="container header-inner"><Brand/><nav className={'nav '+(opened?'nav-open':'')} aria-label="Main navigation">{links.map(x=><a key={x.id} href={'#'+x.id} onClick={()=>setOpened(false)}>{x.label}</a>)}<button className="button button-small nav-mobile-join" onClick={()=>{setOpened(false);openForm('join')}}>Join the chapter <Icon name="arrow" size={16}/></button></nav><div className="header-end"><button className="button button-small nav-desktop-join" onClick={()=>openForm('join')}>Join the chapter <Icon name="arrow" size={16}/></button><button className="menu-toggle" aria-label={opened?'Close menu':'Open menu'} aria-expanded={opened} onClick={()=>setOpened(v=>!v)}><Icon name={opened?'close':'menu'} size={23}/></button></div></div></header></>}
function CircuitArt(){return <div className="art-outer" aria-label="Abstract semiconductor packaging and photonic interconnect illustration" role="img"><div className="art-orbit orbit-1"/><div className="art-orbit orbit-2"/><div className="art-panel"><div className="art-panel-top"><span>ADVANCED PACKAGING</span><span>PSU / EPS</span></div><div className="art-grid"><div className="trace trace-1"/><div className="trace trace-2"/><div className="trace trace-3"/><div className="trace trace-4"/><div className="trace trace-5"/><div className="chip-assembly"><div className="chip chip-a"><span>PHOTONICS</span></div><div className="chip chip-b"><span>CHIPLETS</span></div><div className="chip chip-c"><span>INTEGRATION</span></div><div className="chip-core"><div className="core-lines"/><span>EPS</span></div></div><div className="grid-point p1"/><div className="grid-point p2"/><div className="grid-point p3"/><div className="grid-point p4"/></div><div className="art-panel-foot"><span>INTERCONNECT THE FUTURE</span><span className="art-signal">● &nbsp; ACTIVE NETWORK</span></div></div><div className="art-caption top-right"><span>01 / SYSTEMS</span><strong>Packaging innovation</strong></div><div className="art-caption bottom-left"><span>02 / COMMUNITY</span><strong>Ideas into impact</strong></div></div>}
// Only the hero copy and links are controlled by the Storyblok hero block in this first integration.
// The chapter's other sections remain untouched so a single Storyblok block cannot erase them.
function safeHeroHref(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const url = value.trim();
  return /^#[A-Za-z][A-Za-z0-9_-]*$/.test(url) || /^https:\/\/[^\s]+$/.test(url) ? url : fallback;
}
function HeroAction({ label, href, secondary = false }) {
  const { openForm } = useSite();
  const link = safeHeroHref(href, secondary ? '#join' : '#events');
  const className = secondary ? 'button button-outline' : 'button';
  if (link === '#join') {
    return <button className={className} onClick={() => openForm('join')}>
      {label} <Icon name="arrow" />
    </button>;
  }
  const external = link.startsWith('https://');
  return <a className={className} href={link} target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}>{label} <Icon name="arrow" /></a>;
}
export function HeroBlock({
  eyebrow = 'IEEE ELECTRONICS PACKAGING SOCIETY',
  headline = 'Engineering',
  highlight = 'what’s next.',
  description = 'Connecting the next generation of engineers, researchers, and industry leaders to advance semiconductor packaging and microelectronics.',
  primary_button_text = 'Explore events',
  primary_button_url = '#events',
  secondary_button_text = 'Get involved',
  secondary_button_url = '#join',
}) {
  return <>
    <section className="hero" id="home">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />{eyebrow}</div>
          <h1>{headline}{highlight ? <><br /><em>{highlight}</em></> : null}</h1>
          <p>{description}</p>
          <div className="hero-actions">
            <HeroAction label={primary_button_text} href={primary_button_url} />
            <HeroAction label={secondary_button_text} href={secondary_button_url} secondary />
          </div>
          <div className="hero-line"><span className="hero-pill"><span className="live-dot" />OFFICIALLY EST. 09.28.2026</span><span>University Park, Pennsylvania</span></div>
        </div>
        <CircuitArt />
      </div>
    </section>
    <NextEventBanner />
  </>;
}

// Published content is fetched explicitly, with visible diagnostics if something fails.
// The public read-only token may be included in a public site. Never use a preview/admin token here.
const cmsDebugEnabled = new URLSearchParams(window.location.search).get('cmsdebug') === '1';
const storyblokOrigins = {
  eu: 'https://api.storyblok.com',
  us: 'https://api-us.storyblok.com',
  ca: 'https://api-ca.storyblok.com',
  ap: 'https://api-ap.storyblok.com',
  cn: 'https://app.storyblokchina.cn',
};

function CmsDiagnostics({ status, message, components, value }) {
  if (!cmsDebugEnabled) return null;
  return <aside role="status" style={{position:'fixed', right:16, top:112, zIndex:99999,
      width:'min(385px, calc(100vw - 32px))', background:'#fff', color:'#14233b',
      border:'2px solid #0078ac', borderRadius:10, boxShadow:'0 12px 40px #0004',
      padding:16, fontSize:13, lineHeight:1.6, overflowWrap:'anywhere'}}>
    <strong style={{display:'block',fontSize:16}}>Storyblok connection check</strong>
    <div><strong>Public token:</strong> {storyblokToken ? 'Configured' : 'MISSING'}</div>
    <div><strong>Region:</strong> {storyblokRegion}</div>
    <div><strong>Story slug:</strong> home</div>
    <div><strong>Status:</strong> {status}</div>
    {message && <div><strong>Detail:</strong> {message}</div>}
    {components && <div><strong>Body blocks:</strong> {components}</div>}
    {value && <div><strong>Hero description:</strong> {value}</div>}
    <small style={{display:'block',marginTop:7,opacity:.7}}>Visible only with ?cmsdebug=1. No token is displayed.</small>
  </aside>;
}

// Called only after we have a valid published Storyblok story.
// Receives in-editor "input" events via the official React SDK bridge, so unpublished
// changes can update the preview without putting a preview token on the public website.
// Render published Storyblok content with in-editor updates for both hero and About.
// All other sections remain the original working React components.
function EditableHomepage({ initialStory }) {
  const [editingStory, setEditingStory] = useState(initialStory);
  useEffect(() => setEditingStory(initialStory), [initialStory]);
  useStoryblokBridge(initialStory.id, updatedStory => {
    if (updatedStory?.content) setEditingStory(updatedStory);
  });
  const body = editingStory?.content?.body || [];
  const hero = body.find(x => x?.component === 'hero');
  const about = body.find(x => x?.component === 'about_section');
  return <>
    {hero ? <div {...storyblokEditable(hero)}>
      <HeroBlock
        eyebrow={hero.eyebrow || undefined}
        headline={hero.headline || undefined}
        highlight={hero.highlight || undefined}
        description={hero.description || undefined}
        primary_button_text={hero.primary_button_text || undefined}
        primary_button_url={hero.primary_button_url || undefined}
        secondary_button_text={hero.secondary_button_text || undefined}
        secondary_button_url={hero.secondary_button_url || undefined}
      />
    </div> : <HeroBlock />}
    <AboutBlock
      blok={about}
      eyebrow={about?.eyebrow || undefined}
      heading={about?.heading || undefined}
      description={about?.description || undefined}
      pillars={about?.pillars}
    />
  </>;
}

function CmsHomepage() {
  const [result, setResult] = useState({ status:'loading', message:'Checking published Home story', story:null });
  useEffect(() => {
    let active = true;
    let controller = new AbortController();
    async function load() {
      setResult(old => ({...old, status:'loading', message:'Fetching published Home story'}));
      try {
        const origin = storyblokOrigins[storyblokRegion];
        if (!origin) throw new Error('Unsupported region: ' + storyblokRegion);
        const url = new URL(origin + '/v2/cdn/stories/home');
        url.searchParams.set('token', storyblokToken);
        url.searchParams.set('version','published');
        url.searchParams.set('cv', String(Date.now()));
        const response = await fetch(url, {signal: controller.signal, cache:'no-store'});
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const detail = data?.error || data?.message || 'Delivery API request failed';
          throw new Error('HTTP ' + response.status + ': ' + String(detail));
        }
        if (!data.story?.content) throw new Error('API response has no story.content');
        if (!Array.isArray(data.story.content.body)) throw new Error('Home story has no body Blocks field');
        const hero = data.story.content.body.find(b => b?.component === 'hero');
        if (!hero) throw new Error('No block with technical name "hero" in Home body. Found: ' + data.story.content.body.map(b => b.component).join(', '));
        if (active) setResult({status:'CONNECTED', message:'Published content loaded successfully', story:data.story});
      } catch (error) {
        if (active && error.name !== 'AbortError') {
          console.error('[IEEE EPS Storyblok]', error);
          setResult({status:'ERROR', message: String(error.message || error), story:null});
        }
      }
    }
    load();
    const refresh = () => {
      controller.abort(); controller = new AbortController(); load();
    };
    const visibility = () => { if (!document.hidden) refresh(); };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      active = false; controller.abort();
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const body = result.story?.content?.body;
  const hero = body?.find(x => x.component === 'hero');
  return <>
    {result.story ? <EditableHomepage initialStory={result.story}/> : <><HeroBlock/><AboutBlock/></>}
    <CmsDiagnostics status={result.status} message={result.message}
      components={body?.map(b => b.component).join(', ')} value={hero?.description}/>
  </>;
}
function HomepageSections() {
  return storyblokToken ? <CmsHomepage /> : <>
    <HeroBlock />
    <AboutBlock />
    <CmsDiagnostics status="ERROR" message="VITE_STORYBLOK_PUBLIC_TOKEN is not included in this deployed build. Check GitHub Actions variable names, workflow environment, and redeploy." />
  </>;
}

function useEvents(){ const [state,setState]=useState({items:[],loading:connectedCalendar,error:''});useEffect(()=>{if(!connectedCalendar)return;let controller=new AbortController();loadCalendarEvents(controller.signal).then(items=>setState({items,loading:false,error:''})).catch(e=>{if(!controller.signal.aborted)setState({items:[],loading:false,error:e.message})});return()=>controller.abort()},[]);return state;}
const EventContext=createContext({items:[],loading:false,error:''});
function useEventData(){return useContext(EventContext)}
function useClock(){const [now,setNow]=useState(()=>Date.now());useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[]);return now;}
function Countdown({to}){const now=useClock();const delta=Math.max(0,to-now), d=Math.floor(delta/86400000),h=Math.floor(delta/3600000)%24,m=Math.floor(delta/60000)%60,s=Math.floor(delta/1000)%60;return <div className="countdown" aria-label={`${d} days ${h} hours ${m} minutes ${s} seconds until the event`}>{[[d,'DAYS'],[h,'HRS'],[m,'MIN'],[s,'SEC']].map(([n,label],i)=><React.Fragment key={label}>{i>0&&<span className="count-colon">:</span>}<span className="count-cell"><strong>{String(n).padStart(2,'0')}</strong><small>{label}</small></span></React.Fragment>)}</div>}
function NextEventBanner(){const {items,loading,error}=useEventData();const {openEvent}=useSite();const now=useClock();const next=items.find(e=>eventEnd(e).getTime()>now);return <div className="container"><div className="next-banner"><div className="next-icon"><Icon name="calendar" size={24}/></div><div className="next-copy"><span className="mini-label">NEXT ON THE CALENDAR</span>{next?<><h3>{next.summary||'Chapter event'}</h3><p>{displayEventDate(next)}{next.location?` · ${next.location}`:''}</p></>:<><h3>{loading?'Loading chapter events…':error?'Calendar temporarily unavailable':'The next chapter event is on its way.'}</h3><p>{!connectedCalendar?'Our Google Calendar can be connected when the site goes live.':'Follow us for new events and announcements.'}</p></>}</div><div className="next-right">{next&&!next.start?.date && eventStart(next).getTime()>now?<Countdown to={eventStart(next).getTime()}/>:next&&eventStart(next).getTime()<=now?<span className="event-live">EVENT IN PROGRESS</span>:<span className="next-coming">STAY CONNECTED</span>}{next?<button className="text-link" onClick={()=>openEvent(next)}>Event details <Icon name="arrow" size={16}/></button>:<a className="text-link" href={org.linkedin} target="_blank" rel="noreferrer">Follow our updates <Icon name="arrow" size={16}/></a>}</div></div></div>}
function SectionHeading({tag,title,description,right}){return <div className="section-heading"><div><span className="kicker"><span className="tiny-square"/>{tag}</span><h2>{title}</h2>{description&&<p>{description}</p>}</div>{right&&<div className="section-heading-right">{right}</div>}</div>}
const defaultMissionCards = [
  { title: 'Learn & innovate', description: 'Seminars, workshops, and exposure to research at the leading edge of microelectronics.', icon: 'bolt' },
  { title: 'Connect & collaborate', description: 'Build bridges between students, academic research, and the semiconductor industry.', icon: 'people' },
  { title: 'Grow & lead', description: 'Create opportunities for professional development and hands-on chapter leadership.', icon: 'layers' },
];
export function AboutBlock({
  blok,
  eyebrow = '01 / ABOUT THE CHAPTER',
  heading = 'Where curiosity meets innovation.',
  description = org.mission,
  pillars,
}) {
  const cmsCards = Array.isArray(pillars) ? pillars.filter(x => x?.component === 'mission_card') : [];
  const cards = cmsCards.length ? cmsCards : defaultMissionCards;
  return <section className="section about-section" id="about" {...(blok ? storyblokEditable(blok) : {})}>
    <div className="container">
      <SectionHeading tag={eyebrow} title={heading} description={description}/>
      <div className="about-layout">
        <div className="about-statement">
          <span className="quote-mark">“</span>
          <h3>More than a student chapter. <span>A launchpad for technical leadership.</span></h3>
          <div className="about-rule"/>
          <p>Established September 28, 2026 · IEEE EPS · Penn State</p>
        </div>
        <div className="pillar-grid">
          {cards.map((card, index) => (
            <div className="pillar" key={card._uid || index} {...(card._uid ? storyblokEditable(card) : {})}>
              <span className="pillar-icon"><Icon name={['bolt', 'people', 'layers'].includes(card.icon) ? card.icon : 'layers'}/></span>
              <h3>{card.title || 'Chapter initiative'}</h3>
              <p>{card.description || ''}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="focus-wrap"><span>OUR TECHNICAL FOCUS</span>
        <div className="focus-list">{org.focus.map(f => <span key={f}>{f}</span>)}</div>
      </div>
    </div>
  </section>;
}
function EventCard({event}){const {openEvent}=useSite();return <button className="event-card" onClick={()=>openEvent(event)}><div className="event-card-date"><strong>{prettyDate(eventStart(event),{day:'numeric'})}</strong><span>{prettyDate(eventStart(event),{month:'short',year:'numeric'})}</span></div><div className="event-card-content"><span className="card-overline">IEEE EPS / UPCOMING</span><h3>{event.summary||'Chapter event'}</h3><p><Icon name="clock" size={15}/> {displayEventDate(event)}</p>{event.location&&<p><Icon name="pin" size={15}/> {event.location}</p>}</div><span className="event-card-arrow"><Icon name="arrow" size={18}/></span></button>}
function CalendarBody({events,mode,cursor,sem,openEvent}){
  const today=nyDateKey(new Date());
  if(mode==='month'){
    const [y,m]=cursor.split('-').map(Number);const first=new Date(y,m-1,1),last=new Date(y,m,0);const firstWeek=(first.getDay()+6)%7;const boxes=Array.from({length:Math.ceil((firstWeek+last.getDate())/7)*7},(_,i)=>i-firstWeek+1);
    return <div className="calendar-month"><div className="weekday-headers">{['MON','TUE','WED','THU','FRI','SAT','SUN'].map(x=><span key={x}>{x}</span>)}</div><div className="month-grid">{boxes.map((day,i)=>{const inMonth=day>0&&day<=last.getDate();const key=inMonth?`${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`:'';const es=inMonth?events.filter(e=>eventDateKey(e)===key):[];return <div key={i} className={'calendar-day '+(!inMonth?'outside':'')+(key===today?' today':'')}><span className="day-number">{inMonth?day:''}</span>{es.slice(0,2).map(e=><button key={e.id} className="month-event" title={e.summary} onClick={()=>openEvent(e)}>{e.summary}</button>)}{es.length>2&&<small>+{es.length-2} more</small>}</div>})}</div></div>
  }
  const weekStart=mondayKey(cursor);
  if(mode==='week')return <div className="week-grid">{Array.from({length:7},(_,i)=>{const key=shiftDateKey(weekStart,i),d=dateForKey(key),es=events.filter(e=>eventDateKey(e)===key);return <div key={key} className={'week-column '+(key===today?'active':'')}><div className="week-header"><small>{['MON','TUE','WED','THU','FRI','SAT','SUN'][i]}</small><strong>{d.getDate()}</strong></div>{es.length?es.map(e=><button className="week-event" key={e.id} onClick={()=>openEvent(e)}><span>{e.summary}</span><small>{e.start?.date?'All day':prettyTime(eventStart(e))}</small></button>):<span className="no-week-events">—</span>}</div>})}</div>;
  const {start,end}=semesterBounds(sem),filtered=events.filter(e=>{const key=eventDateKey(e);return key>=start&&key<=end});return <div className="semester-list">{filtered.length?filtered.map(e=><button className="semester-row" key={e.id} onClick={()=>openEvent(e)}><span className="semester-date"><strong>{prettyDate(eventStart(e),{day:'2-digit'})}</strong><small>{prettyDate(eventStart(e),{month:'short'})}</small></span><span className="semester-info"><strong>{e.summary}</strong><small>{displayEventDate(e)} {e.location?` · ${e.location}`:''}</small></span><Icon name="chevron" size={17}/></button>):<div className="calendar-empty">No events have been published for {sem.term} {sem.year}.</div>}</div>
}
function EventCalendar({items}){const [mode,setMode]=useState('month');const [cursor,setCursor]=useState(()=>nyDateKey(new Date()));const [sem,setSem]=useState(()=>initialSemester());const {openEvent}=useSite();const today=nyDateKey(new Date());const [y,m]=cursor.split('-').map(Number);const label=mode==='month'?new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(new Date(y,m-1,1)):mode==='week'?`${prettyDate(dateForKey(mondayKey(cursor)))} – ${prettyDate(dateForKey(shiftDateKey(mondayKey(cursor),6)),{year:'numeric'})}`:`${sem.term} ${sem.year}`;
 const shift=n=>{if(mode==='semester')setSem(s=>moveSemester(s,n));else if(mode==='week')setCursor(c=>shiftDateKey(c,7*n));else{let date=new Date(y,m-1+n,1);setCursor(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-01`)}};
 return <div className="calendar-container"><div className="calendar-toolbar"><div className="calendar-title"><Icon name="calendar" size={18}/><strong>{label}</strong></div><div className="calendar-toolbar-actions"><div className="calendar-switch" role="group" aria-label="Calendar view">{['semester','month','week'].map(v=><button key={v} className={mode===v?'selected':''} onClick={()=>setMode(v)} aria-pressed={mode===v}>{v[0].toUpperCase()+v.slice(1)}</button>)}</div><div className="calendar-move"><button aria-label="Previous period" onClick={()=>shift(-1)}>‹</button><button className="today-button" onClick={()=>{setCursor(today);setSem(initialSemester(today))}}>Today</button><button aria-label="Next period" onClick={()=>shift(1)}>›</button></div></div></div><CalendarBody events={items} mode={mode} cursor={cursor} sem={sem} openEvent={openEvent}/><div className="calendar-footer"><span><span className="legend-dot"/> Chapter events · Times in Eastern Time</span>{calendarPublicUrl&&<a href={calendarPublicUrl} target="_blank" rel="noreferrer">Open in Google Calendar <Icon name="external" size={14}/></a>}</div></div>
}
export function EventsBlock({title='Something is always in motion.'}){const {items,loading,error}=useEventData();const now=Date.now();const upcoming=items.filter(e=>eventEnd(e).getTime()>now).slice(0,3);return <section className="section events-section" id="events"><div className="container"><SectionHeading tag="02 / EVENTS HUB" title={title} description="Discover what’s happening, connect with the community, and never miss a chapter event." right={calendarPublicUrl?<a href={calendarPublicUrl} target="_blank" rel="noreferrer" className="text-link">Subscribe to calendar <Icon name="external" size={16}/></a>:null}/><div className="section-subtitle"><h3>Coming up</h3><span>UPCOMING EVENTS</span></div><div className="upcoming-grid">{loading?<div className="empty-events"><Icon name="clock" size={24}/><strong>Loading the latest events…</strong></div>:error?<div className="empty-events"><Icon name="calendar" size={24}/><strong>Calendar connection unavailable</strong><p>{error}. Please check the API configuration.</p></div>:upcoming.length?upcoming.map(e=><EventCard key={e.id} event={e}/>):<div className="empty-events"><span className="empty-icon"><Icon name="calendar" size={24}/></span><strong>No upcoming events announced yet</strong><p>New seminars, workshops, and networking opportunities will appear here automatically once published.</p><a href={org.linkedin} target="_blank" rel="noreferrer" className="text-link">Stay updated on LinkedIn <Icon name="arrow" size={15}/></a></div>}</div><div className="section-subtitle calendar-label"><h3>Chapter calendar</h3><span>YOUR SCHEDULE AT A GLANCE</span></div><EventCalendar items={items}/></div></section>}
export function HighlightsBlock({title='Moments that move us forward.',items=verifiedHighlights}){return <section className="section highlights-section" id="highlights"><div className="container"><SectionHeading tag="03 / COMMUNITY & MOMENTS" title={title} description="A growing record of seminars, workshops, collaborations, and chapter milestones."/>{items?.length?<div className="highlights-grid">{items.map((x,i)=><article key={i} className="highlight-card"><div className="highlight-image">{x.image?<img src={x.image} alt={x.title} loading="lazy"/>:<Icon name="layers" size={35}/>}</div><div className="highlight-copy"><span>{x.date||'CHAPTER EVENT'}</span><h3>{x.title}</h3><p>{x.description}</p>{x.link&&<a href={x.link} target="_blank" rel="noreferrer">View album <Icon name="external" size={14}/></a>}</div></article>)}</div>:<div className="empty-highlight"><div className="highlight-symbol"><Icon name="layers" size={30}/></div><div><h3>Our story is just beginning.</h3><p>As our chapter hosts events and initiatives, verified photos and highlights will appear in this space.</p></div><a href={org.linkedin} target="_blank" rel="noreferrer" className="text-link">Follow our progress <Icon name="arrow" size={16}/></a></div>}</div></section>}
export function ArchiveBlock({title='Chapter event archive.'}) {
 const {items}=useEventData(); const {openEvent}=useSite();
 const [search,setSearch]=useState(''), [year,setYear]=useState('All');
 const history=useMemo(()=>items.filter(e=>eventEnd(e).getTime()<Date.now()).sort((a,b)=>eventStart(b)-eventStart(a)),[items]);
 const years=[...new Set(history.map(e=>nyDateKey(eventStart(e)).slice(0,4)))];
 const visible=history.filter(e=>(year==='All'||eventDateKey(e).startsWith(year)) && [e.summary,e.description,e.location].join(' ').toLowerCase().includes(search.toLowerCase()));
 return <section className="archive-section" id="archive"><div className="container"><div className="archive-heading"><div><span className="kicker"><span className="tiny-square"/>EVENT HISTORY</span><h3>{title}</h3></div><div className="archive-filters"><label className="sr-only" htmlFor="archive-search">Search past events</label><input id="archive-search" placeholder="Search events…" value={search} onChange={e=>setSearch(e.target.value)}/><label className="sr-only" htmlFor="archive-year">Filter event year</label><select id="archive-year" value={year} onChange={e=>setYear(e.target.value)}><option>All</option>{years.map(y=><option key={y}>{y}</option>)}</select></div></div>{visible.length?<div className="archive-rows">{visible.slice(0,25).map(e=><button key={e.id} className="archive-row" onClick={()=>openEvent(e)}><span className="archive-row-date">{prettyDate(eventStart(e),{month:'short',day:'numeric',year:'numeric'})}</span><strong>{e.summary}</strong><span>Details <Icon name="arrow" size={14}/></span></button>)}{visible.length>25&&<div className="archive-more">Showing 25 of {visible.length} matching past events. Refine the search to find more.</div>}</div>:<div className="archive-empty">{items.length?'No past events match the selected filters.':'The archive will grow as the chapter hosts its first events.'}</div>}</div></section>
}
export function PartnersBlock({title='Build the future with us.',partners=confirmedPartners}){const {openForm}=useSite();return <section className="section partners-section" id="partners"><div className="container"><div className="partner-panel"><div className="partner-panel-copy"><span className="kicker kicker-light"><span className="tiny-square"/>04 / PARTNERS & INDUSTRY</span><h2>{title}</h2><p>Partner with emerging engineering talent through technical talks, workshops, sponsorship, and shared opportunities to connect academia and industry.</p><div className="partner-chips">{['Event sponsorship','Industry talks','Workshops','Research connections'].map(x=><span key={x}>{x}</span>)}</div><button className="button button-white" onClick={()=>openForm('sponsor')}>Explore collaboration <Icon name="arrow" size={18}/></button></div><div className="partner-feature"><span className="partner-plus">+</span><div className="partner-feature-inner"><span>COLLABORATION / 01</span><div className="partner-feature-visual"><div/><div/><div/><div/></div><strong>Better together.</strong><small>From classroom ideas to industry impact.</small></div></div></div>{partners?.length?<div className="partner-logo-panel"><span>OUR PARTNERS & SUPPORTERS</span><div className="partner-logos">{partners.map((p,i)=><a key={i} href={p.website} target="_blank" rel="noreferrer">{p.logo?<img src={p.logo} alt={p.name} loading="lazy"/>:p.name}</a>)}</div></div>:<div className="partners-empty"><span>Interested in supporting the chapter?</span><button onClick={()=>openForm('sponsor')}>Start a conversation <Icon name="arrow" size={15}/></button></div>}</div></section>}
function Initials({name}){return <span className="portrait-initials">{name.split(' ').filter(x=>!['Md.','Hasan'].includes(x)).slice(0,2).map(x=>x[0]).join('')}</span>}
export function TeamBlock({title='The people building our chapter.',people=leadership}){return <section className="section team-section" id="team"><div className="container"><SectionHeading tag="05 / OUR TEAM" title={title} description="Student leadership dedicated to launching an inclusive, forward-thinking technical community."/><div className="advisor-bar"><div className="advisor-mark"><Icon name="layers" size={24}/></div><div><span>FACULTY ADVISOR</span><strong>{org.advisor}</strong></div><span className="advisor-badge">Penn State</span></div><div className="team-grid">{people?.map((p,i)=><div className="team-card" key={i}><div className="team-avatar">{p.photo?<img src={p.photo} alt={p.name} loading="lazy"/>:<Initials name={p.name}/>}</div><div className="team-text"><h3>{p.name}</h3><p>{p.role}</p></div>{p.linkedin&&<a href={p.linkedin} target="_blank" rel="noreferrer" className="team-link" aria-label={`${p.name} on LinkedIn`}><Icon name="linkedin" size={17}/></a>}</div>)}</div><p className="team-note">Interim founding leadership facilitates the chapter's initial activities pending the formal election process.</p></div></section>}
export function JoinCalloutBlock({title='Find your place in what’s next.',description='Whether you are curious about advanced packaging or already working at its frontier, there is room for you here.'}){const {openForm}=useSite();return <div className="container"><div className="join-callout"><div><span className="kicker kicker-light">THE NEXT GENERATION STARTS HERE</span><h2>{title}</h2><p>{description}</p></div><button className="button button-white" onClick={()=>openForm('join')}>Join the community <Icon name="arrow" size={17}/></button></div></div>}
export function ContactBlock({title='Let’s connect.'}){const {openForm}=useSite();const [expanded,setExpanded]=useState(-1);return <section className="section contact-section" id="contact"><div className="container"><SectionHeading tag="06 / GET IN TOUCH" title={title} description="Questions, new ideas, speaking opportunities, partnerships—we'd love to hear from you."/><div className="contact-layout"><div className="contact-panel"><span className="contact-small">REACH THE CHAPTER</span><a className="contact-email" href={`mailto:${org.email}`}>{org.email} <Icon name="arrow" size={19}/></a><p>IEEE EPS Penn State Student Chapter<br/>The Pennsylvania State University<br/>University Park, PA</p><div className="contact-actions"><button className="button" onClick={()=>openForm('contact')}>Send a message <Icon name="arrow" size={16}/></button><a href={org.linkedin} className="button button-soft" target="_blank" rel="noreferrer"><Icon name="linkedin" size={17}/> LinkedIn</a></div></div><div className="faq-panel"><div className="faq-heading"><h3>Frequently asked</h3><span>FAQ</span></div>{faqs.map(([q,a],i)=><div className="faq-item" key={i}><button onClick={()=>setExpanded(v=>v===i?-1:i)} aria-expanded={expanded===i}><span>{q}</span><Icon name={expanded===i?'minus':'plus'} size={18}/></button>{expanded===i&&<p>{a}</p>}</div>)}</div></div></div></section>}
function Footer(){return <footer className="footer"><div className="container footer-main"><Brand compact/><div className="footer-nav">{links.map(x=><a href={'#'+x.id} key={x.id}>{x.label}</a>)}</div><a className="footer-up" href="#home" aria-label="Back to top">↑</a></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} IEEE EPS Penn State Student Chapter. Established September 28, 2026.</span><span>Independent student chapter website · University Park, PA</span></div></footer>}
function Modal({kind,event,onClose}){const [status,setStatus]=useState({type:'',message:''}),[submitting,setSubmitting]=useState(false);useEffect(()=>{const onKey=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',onKey);document.body.classList.add('modal-open');return()=>{document.body.classList.remove('modal-open');window.removeEventListener('keydown',onKey)}},[onClose]);
 const names={contact:'Send us a message',sponsor:'Explore a partnership',join:'Join the community'};const desc={contact:'General inquiries, event suggestions, or questions about the chapter.',sponsor:'Tell us a little about the opportunity you have in mind.',join:'Express your interest in IEEE EPS Penn State activities.'};const ids={contact:import.meta.env.VITE_FORMSPREE_CONTACT_ID,sponsor:import.meta.env.VITE_FORMSPREE_SPONSOR_ID,join:import.meta.env.VITE_FORMSPREE_JOIN_ID};const id=ids[kind];
 async function submit(e){e.preventDefault();if(!id){setStatus({type:'error',message:'This form is not connected yet. Please email the chapter directly.'});return}setSubmitting(true);setStatus({type:'',message:''});try{const response=await fetch(`https://formspree.io/f/${encodeURIComponent(id)}`,{method:'POST',body:new FormData(e.currentTarget),headers:{Accept:'application/json'}});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.errors?.map(e=>e.message).join(' ')||'Submission failed');e.currentTarget.reset();setStatus({type:'success',message:'Thanks! Your message has been submitted successfully.'})}catch(e){setStatus({type:'error',message:e.message||'Something went wrong. Please try again.'})}finally{setSubmitting(false)}}
 if(event)return <div className="modal-backdrop" onClick={onClose}><div className="dialog" role="dialog" aria-modal="true" aria-label="Event details" onClick={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={onClose}><Icon name="close"/></button><span className="kicker"><span className="tiny-square"/>CHAPTER EVENT</span><h2>{event.summary||'Chapter event'}</h2><div className="event-detail-row"><Icon name="calendar"/> {displayEventDate(event)}</div>{event.location&&<div className="event-detail-row"><Icon name="pin"/> {event.location}</div>}{event.description&&<p className="modal-description">{event.description.replace(/<[^>]*>/g,'').slice(0,2500)}</p>}<div className="modal-actions">{event.htmlLink&&<a className="button" href={event.htmlLink} target="_blank" rel="noreferrer">Open calendar event <Icon name="external" size={16}/></a>}<button className="button button-soft" onClick={onClose}>Close</button></div></div></div>;
 return <div className="modal-backdrop" onClick={onClose}><div className="dialog" role="dialog" aria-modal="true" aria-label={names[kind]} onClick={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={onClose}><Icon name="close"/></button><span className="kicker"><span className="tiny-square"/>CONNECT WITH IEEE EPS</span><h2>{names[kind]}</h2><p className="modal-intro">{desc[kind]}</p>{status.type==='success'?<div className="status-message success"><Icon name="checkcircle"/> {status.message}</div>:<form className="chapter-form" onSubmit={submit}><label>Full name<input required name="name" placeholder="Your name" autoComplete="name"/></label><label>Email address<input required name="email" type="email" placeholder="name@example.com" autoComplete="email"/></label>{kind==='sponsor'&&<><label>Organization<input required name="organization" placeholder="Company or institution"/></label><label>Inquiry type<select name="inquiry_type" defaultValue="Industry collaboration"><option>Industry collaboration</option><option>Event sponsorship</option><option>Technical talk / speaker</option><option>Workshop</option><option>Other</option></select></label></>}{kind==='join'&&<><label>Academic program<input name="academic_program" placeholder="e.g. PhD Electrical Engineering"/></label><label>Technical interests<input name="interests" placeholder="Packaging, photonics, reliability…"/></label></>}{kind==='contact'&&<label>Subject<input required name="subject" placeholder="How can we help?"/></label>}{kind!=='join'&&<label>Message<textarea required name="message" rows="4" placeholder="Share a few details…"/></label>}<input type="hidden" name="source" value="IEEE EPS Penn State website"/><button className="button submit-button" disabled={submitting} type="submit">{submitting?'Sending…':'Submit inquiry'} <Icon name="arrow" size={16}/></button>{kind==='join'&&<small>Expressing interest does not create or replace official IEEE membership.</small>}{!id&&<p className="form-setup-note">Online submissions are awaiting Formspree connection. For now, contact <a href={`mailto:${org.email}`}>{org.email}</a>.</p>}{status.type==='error'&&<div role="alert" className="status-message error">{status.message}</div>}</form>}</div></div>;
}
// The rest of the site remains the original working design, independently of Storyblok.
function FallbackHome() {
  return <><HomepageSections /><EventsBlock /><HighlightsBlock /><ArchiveBlock />
    <PartnersBlock /><TeamBlock /><JoinCalloutBlock /><ContactBlock /></>;
}
function App() {
  const [overlay, setOverlay] = useState(null);
  const eventData = useEvents();
  const context = useMemo(() => ({
    openForm: kind => setOverlay({ kind }),
    openEvent: event => setOverlay({ event }),
  }), []);
  return <SiteContext.Provider value={context}>
    <EventContext.Provider value={eventData}>
      <a className="skip-link" href="#main">Skip to main content</a>
      <Header />
      <main id="main"><FallbackHome /></main>
      <Footer />
      {overlay && <Modal key={overlay.kind || overlay.event?.id}
        kind={overlay.kind} event={overlay.event} onClose={() => setOverlay(null)} />}
    </EventContext.Provider>
  </SiteContext.Provider>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
