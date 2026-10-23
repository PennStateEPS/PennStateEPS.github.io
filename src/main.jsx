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
const DEFAULT_SITE_SETTINGS = {
  email: org.email, linkedin: org.linkedin,
  logo:'', logoMode:'mark', favicon:'', logoAlt:'IEEE EPS Penn State chapter logo',
  brandTitle:'', brandSubtitle:'STUDENT CHAPTER',
  headerTopLeft:'IEEE Electronics Packaging Society · Penn State',
  headerTopRight:'Established 2026', headerJoinText:'Join the chapter',
  navLabels:{},
  footerPrimary:'© {year} IEEE EPS Penn State Student Chapter. Established September 28, 2026.',
  footerSecondary:'Independent student chapter website · University Park, PA',
  nextLabel:'NEXT ON THE CALENDAR', nextEmptyTitle:'The next chapter event is on its way.',
  nextEmptyDescription:'Follow us for new events and announcements.',
  nextUnconfiguredDescription:'Our Google Calendar can be connected when the site goes live.',
  nextLoadingTitle:'Loading chapter events…', nextErrorTitle:'Calendar temporarily unavailable',
  nextStayConnected:'STAY CONNECTED', nextProgressLabel:'EVENT IN PROGRESS',
  nextDetailsLabel:'Event details', nextFollowLabel:'Follow our updates',
};
const SiteConfigContext = createContext(DEFAULT_SITE_SETTINGS);
const useConfig = () => useContext(SiteConfigContext);


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
function Brand({compact=false}){
 const config=useConfig();
 const logo=config.logo;
 const full=Boolean(logo && config.logoMode==='full');
 return <a className={'brand '+(full?'brand-has-full-logo':'')} href="#home" aria-label="IEEE EPS Penn State, homepage">
  {full ? <img className="brand-logo-full" src={logo} alt={config.logoAlt} />
   : <>
     {logo ? <img className="brand-logo-mark" src={logo} alt={config.logoAlt} />
       : <span className="brand-emblem" aria-hidden="true"><span className="brand-circuit"/></span>}
     <span className="brand-copy"><strong>{config.brandTitle || <>IEEE <b>EPS</b> <span>PENN STATE</span></>}</strong>
       {!compact && <small>{config.brandSubtitle || 'STUDENT CHAPTER'}</small>}</span>
   </>}
 </a>;
}
function Header(){
 const [opened,setOpened]=useState(false);const {openForm}=useSite();const config=useConfig();
 const nav=links.map(x=>({...x,label:config.navLabels?.[x.id]||x.label}));
 const joinText=config.headerJoinText||'Join the chapter';
 return <><div className="topline"><div className="container topline-inner"><span><span className="top-dot"/> {config.headerTopLeft}</span><span>{config.headerTopRight} <span className="topline-arrow">↗</span></span></div></div>
 <header className="site-header"><div className="container header-inner"><Brand/>
  <nav className={'nav '+(opened?'nav-open':'')} aria-label="Main navigation">
   {nav.map(x=><a key={x.id} href={'#'+x.id} onClick={()=>setOpened(false)}>{x.label}</a>)}
   <button className="button button-small nav-mobile-join" onClick={()=>{setOpened(false);openForm('join')}}>{joinText} <Icon name="arrow" size={16}/></button>
  </nav><div className="header-end"><button className="button button-small nav-desktop-join" onClick={()=>openForm('join')}>{joinText} <Icon name="arrow" size={16}/></button>
   <button className="menu-toggle" aria-label={opened?'Close menu':'Open menu'} aria-expanded={opened} onClick={()=>setOpened(v=>!v)}><Icon name={opened?'close':'menu'} size={23}/></button>
  </div></div></header></>;
}
function CircuitArt({labels={}}){
 const label=(key,fallback)=>typeof labels[key]==='string'?labels[key]:fallback;
 return <div className="art-outer" aria-label="Abstract semiconductor packaging and photonic interconnect illustration" role="img"><div className="art-orbit orbit-1"/><div className="art-orbit orbit-2"/>
 <div className="art-panel"><div className="art-panel-top"><span>{label('art_panel_title','ADVANCED PACKAGING')}</span><span>{label('art_panel_subtitle','PSU / EPS')}</span></div>
 <div className="art-grid"><div className="trace trace-1"/><div className="trace trace-2"/><div className="trace trace-3"/><div className="trace trace-4"/><div className="trace trace-5"/>
 <div className="chip-assembly"><div className="chip chip-a"><span>{label('art_chip_one','PHOTONICS')}</span></div><div className="chip chip-b"><span>{label('art_chip_two','CHIPLETS')}</span></div><div className="chip chip-c"><span>{label('art_chip_three','INTEGRATION')}</span></div><div className="chip-core"><div className="core-lines"/><span>{label('art_chip_center','EPS')}</span></div></div>
 <div className="grid-point p1"/><div className="grid-point p2"/><div className="grid-point p3"/><div className="grid-point p4"/></div>
 <div className="art-panel-foot"><span>{label('art_panel_footer','INTERCONNECT THE FUTURE')}</span><span className="art-signal">● &nbsp; {label('art_panel_status','ACTIVE NETWORK')}</span></div></div>
 <div className="art-caption top-right"><span>{label('art_caption_one_label','01 / SYSTEMS')}</span><strong>{label('art_caption_one_title','Packaging innovation')}</strong></div>
 <div className="art-caption bottom-left"><span>{label('art_caption_two_label','02 / COMMUNITY')}</span><strong>{label('art_caption_two_title','Ideas into impact')}</strong></div>
 </div>;
}
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
  eyebrow='IEEE ELECTRONICS PACKAGING SOCIETY',
  headline='Engineering', highlight='what’s next.',
  description='Connecting the next generation of engineers, researchers, and industry leaders to advance semiconductor packaging and microelectronics.',
  primary_button_text='Explore events', primary_button_url='#events',
  secondary_button_text='Get involved', secondary_button_url='#join',
  hero_image='', illustration_mode='circuit',show_next_event=true,
  badge_text='OFFICIALLY EST. 09.28.2026',location_text='University Park, Pennsylvania',
  art_labels={},
}) {
  const imageMode=illustration_mode === 'image' && hero_image;
  const hasVisual=illustration_mode !== 'none';
  return <>
    <section className="hero" id="home">
      <div className={'container hero-grid '+(!hasVisual?'hero-grid-single':'')}>
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" />{eyebrow}</div>
          <h1>{headline}{highlight ? <><br/><em>{highlight}</em></> : null}</h1>
          <p>{description}</p>
          <div className="hero-actions">
            {primary_button_text && <HeroAction label={primary_button_text} href={primary_button_url} />}
            {secondary_button_text && <HeroAction label={secondary_button_text} href={secondary_button_url} secondary/>}
          </div>
          <div className="hero-line">
            {badge_text && <span className="hero-pill"><span className="live-dot"/>{badge_text}</span>}
            {location_text && <span>{location_text}</span>}
          </div>
        </div>
        {imageMode ? <div className="cms-hero-picture"><img src={hero_image} alt="Advanced packaging chapter illustration" loading="eager"/></div>
          : hasVisual ? <CircuitArt labels={art_labels}/> : null}
      </div>
    </section>
    {show_next_event!==false && <NextEventBanner/>}
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
// Every Storyblok section is a reusable, reorderable page block. Unknown blocks are skipped.
// Once full_cms_layout is published, the Body order defines the page layout.
const HOME_ORDER = ['hero','about_section','events_section','highlights_section','archive_section',
  'partners_section','team_section','join_section','contact_section'];
function safeAsset(value) {
  const candidate = typeof value === 'string' ? value : value?.filename;
  return typeof candidate === 'string' && /^https:\/\//i.test(candidate) ? candidate : '';
}
function safeExternal(value) {
  const url = typeof value === 'string' ? value : value?.url;
  return typeof url === 'string' && /^https:\/\//i.test(url.trim()) ? url.trim() : '';
}
function nestedItems(source, name) { return Array.isArray(source) ? source.filter(x=>x?.component===name) : []; }
function cmsBlock(b) {
  if (!b || b.visible === false) return null;
  const tone=['default','light','white','dark'].includes(b.tone) ? b.tone : 'default';
  const spacing=['compact','standard','spacious'].includes(b.spacing) ? b.spacing : 'standard';
  const align=b.heading_alignment==='center'?'center':'left';
  const layout=['auto','two','three','list'].includes(b.layout) ? b.layout : 'auto';
  const attrs={
    key:b._uid || b.component,
    ...storyblokEditable(b),
    className:`cms-section cms-tone-${tone} cms-space-${spacing} cms-align-${align} cms-layout-${layout}`
  };
  let component = null;
  switch (b.component) {
    case 'hero':
      component=<HeroBlock eyebrow={b.eyebrow ?? undefined} headline={b.headline ?? undefined}
        highlight={b.highlight ?? undefined} description={b.description ?? undefined}
        primary_button_text={b.primary_button_text ?? undefined}
        primary_button_url={b.primary_button_url ?? undefined}
        secondary_button_text={b.secondary_button_text ?? undefined}
        secondary_button_url={b.secondary_button_url ?? undefined}
        hero_image={safeAsset(b.hero_image)} illustration_mode={b.illustration_mode ?? 'circuit'}
        badge_text={b.badge_text ?? undefined} location_text={b.location_text ?? undefined}
        show_next_event={b.show_next_event !== false} art_labels={b}/>;
      break;
    case 'about_section':
      component=<AboutBlock blok={b} eyebrow={b.eyebrow ?? undefined} heading={b.heading ?? undefined}
        description={b.description ?? undefined} pillars={b.pillars}
        statementHeading={b.statement_heading ?? undefined} statementHighlight={b.statement_highlight ?? undefined}
        statementCaption={b.statement_caption ?? undefined} focusTitle={b.focus_title ?? undefined}
        focusTags={nestedItems(b.focus_tags,'focus_tag')}
        showStatement={b.show_statement !== false} showFocus={b.show_focus !== false}/>;
      break;
    case 'events_section':
      component=<EventsBlock title={b.title ?? undefined} description={b.description ?? undefined}
        eyebrow={b.eyebrow ?? undefined} upcomingTitle={b.upcoming_title ?? undefined}
        calendarTitle={b.calendar_title ?? undefined} upcomingCount={Number(b.upcoming_count)||3}
        initialView={b.initial_view || 'month'} showUpcoming={b.show_upcoming !== false}
        showCalendar={b.show_calendar !== false}/>;
      break;
    case 'highlights_section':
      component=<HighlightsBlock title={b.title ?? undefined} description={b.description ?? undefined}
        eyebrow={b.eyebrow ?? undefined} emptyTitle={b.empty_title ?? undefined}
        emptyDescription={b.empty_description ?? undefined}
        items={nestedItems(b.items,'highlight_item').map(x=>({...x,image:safeAsset(x.image),link:safeExternal(x.link)}))}/>;
      break;
    case 'archive_section':
      component=<ArchiveBlock title={b.title ?? undefined} eyebrow={b.eyebrow ?? undefined}
        emptyDescription={b.empty_description ?? undefined} maxItems={Number(b.max_items)||25}
        showSearch={b.show_search !== false}/>;
      break;
    case 'partners_section':
      component=<PartnersBlock title={b.title ?? undefined} description={b.description ?? undefined}
        eyebrow={b.eyebrow ?? undefined} buttonText={b.button_text ?? undefined}
        featureHeading={b.feature_heading ?? undefined} featureCaption={b.feature_caption ?? undefined}
        offers={nestedItems(b.offers,'partner_offer')}
        showVisual={b.show_visual !== false}
        partners={nestedItems(b.partners,'partner_item').map(x=>({...x, logo:safeAsset(x.logo),website:safeExternal(x.website)}))}/>;
      break;
    case 'team_section':
      component=<TeamBlock title={b.title ?? undefined} description={b.description ?? undefined}
        eyebrow={b.eyebrow ?? undefined} advisor={b.advisor ?? undefined}
        advisorLabel={b.advisor_label ?? undefined} interimNote={b.interim_note ?? undefined}
        people={nestedItems(b.people,'team_member').map(x=>({...x,photo:safeAsset(x.photo),linkedin:safeExternal(x.linkedin)}))}/>;
      break;
    case 'join_section':
      component=<JoinCalloutBlock title={b.title ?? undefined} description={b.description ?? undefined}
        eyebrow={b.eyebrow ?? undefined} buttonText={b.button_text ?? undefined}
        showButton={b.show_button !== false}/>;
      break;
    case 'contact_section':
      component=<ContactBlock title={b.title ?? undefined} description={b.description ?? undefined}
        eyebrow={b.eyebrow ?? undefined} email={b.email} address={b.address}
        linkedin={safeExternal(b.linkedin)} contactButtonText={b.contact_button_text}
        faqHeading={b.faq_heading} showFaq={b.show_faq !== false}
        items={nestedItems(b.faqs,'faq_item')}/>;
      break;
    default: return null;
  }
  return <div {...attrs}>{component}</div>;
}

function DefaultSections({override=[]}) {
  const lookup = new Map(override.filter(b=>HOME_ORDER.includes(b.component)).map(b=>[b.component,b]));
  return <>{HOME_ORDER.map(name => {
    const block = lookup.get(name) || {component:name, _uid:'default-'+name};
    // Don't replace existing local content with empty arrays before the CMS is fully populated.
    if (name==='team_section' && !Array.isArray(block.people)) block.people=leadership.map(p=>({component:'team_member',...p}));
    if (name==='contact_section' && !Array.isArray(block.faqs)) block.faqs=faqs.map(([question,answer])=>({component:'faq_item',question,answer}));
    return cmsBlock(block);
  })}</>;
}
function EditableHomepage({ initialStory, onSettingsChange }) {
  const [editingStory, setEditingStory] = useState(initialStory);
  useEffect(() => setEditingStory(initialStory), [initialStory]);
  useStoryblokBridge(initialStory.id, updatedStory => {
    if (updatedStory?.content) setEditingStory(updatedStory);
  });
  useEffect(() => {
    const content=editingStory?.content;
    if (!content) return;
    const root=document.documentElement;
    root.dataset.cmsTheme=['ieee','navy','teal','slate'].includes(content.site_theme)?content.site_theme:'ieee';
    root.dataset.cmsDensity=['compact','standard','spacious'].includes(content.site_density)?content.site_density:'compact';
    root.dataset.cmsWidth=content.site_width==='wide'?'wide':'standard';
    const email=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(content.contact_email||'') ? content.contact_email : org.email;
    const strings = {
      brandTitle:'brand_title',brandSubtitle:'brand_subtitle',logoAlt:'chapter_logo_alt',
      headerTopLeft:'topline_left',headerTopRight:'topline_right',headerJoinText:'header_join_text',
      footerPrimary:'footer_primary',footerSecondary:'footer_secondary',
      nextLabel:'next_event_label',nextEmptyTitle:'next_event_empty_title',
      nextEmptyDescription:'next_event_empty_description',
      nextUnconfiguredDescription:'next_event_unconfigured_description',
      nextLoadingTitle:'next_event_loading_title',nextErrorTitle:'next_event_error_title',
      nextStayConnected:'next_event_stay_label',nextProgressLabel:'next_event_live_label',
      nextDetailsLabel:'next_event_details_label',nextFollowLabel:'next_event_follow_label'
    };
    const settings={...DEFAULT_SITE_SETTINGS,email,linkedin:safeExternal(content.linkedin_url)||org.linkedin,
      logo:safeAsset(content.chapter_logo), favicon:safeAsset(content.site_favicon),
      logoMode:content.logo_display_mode==='full'?'full':'mark'};
    for(const [key,field] of Object.entries(strings)){
      if(typeof content[field]==='string' && content[field].trim()) settings[key]=content[field];
    }
    settings.navLabels={};
    for(const link of links){
      const label=content['nav_'+link.id];
      if(typeof label==='string' && label.trim())settings.navLabels[link.id]=label;
    }
    onSettingsChange?.(settings);
  },[editingStory?.content, onSettingsChange]);
  const body = editingStory?.content?.body || [];
  const fullLayout = editingStory?.content?.full_cms_layout === true;
  // Maintain full old site until the complete Storyblok schema and page are published.
  return fullLayout ? <>{body.map(cmsBlock)}</> : <DefaultSections override={body}/>;
}
function CmsHomepage({onSettingsChange}) {
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
        if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + (data?.error || data?.message || 'Delivery API request failed'));
        if (!data.story?.content || !Array.isArray(data.story.content.body)) throw new Error('Home story has no body field');
        if (!data.story.content.body.some(x=>x?.component==='hero')) throw new Error('Home story has no hero block');
        if (active) setResult({status:'CONNECTED', message:'Published content loaded successfully', story:data.story});
      } catch (error) {
        if (active && error.name !== 'AbortError') {
          console.error('[IEEE EPS Storyblok]', error);
          setResult({status:'ERROR', message:String(error.message||error), story:null});
        }
      }
    }
    load();
    const refresh=()=>{controller.abort();controller=new AbortController();load();};
    const visibility=()=>{if(!document.hidden)refresh();};
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',visibility);
    return ()=>{active=false;controller.abort();window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',visibility)};
  }, []);
  const body=result.story?.content?.body;
  const hero=body?.find(x=>x.component==='hero');
  return <>{result.story ? <EditableHomepage initialStory={result.story} onSettingsChange={onSettingsChange}/> : <DefaultSections/>}
    <CmsDiagnostics status={result.status} message={result.message}
      components={body?.map(b=>b.component).join(', ')} value={hero?.description}/></>;
}
function HomepageSections({onSettingsChange}) {
  return storyblokToken ? <CmsHomepage onSettingsChange={onSettingsChange}/> : <><DefaultSections/>
    <CmsDiagnostics status="ERROR" message="VITE_STORYBLOK_PUBLIC_TOKEN missing from deployed build."/></>;
}

function useEvents(){ const [state,setState]=useState({items:[],loading:connectedCalendar,error:''});useEffect(()=>{if(!connectedCalendar)return;let controller=new AbortController();loadCalendarEvents(controller.signal).then(items=>setState({items,loading:false,error:''})).catch(e=>{if(!controller.signal.aborted)setState({items:[],loading:false,error:e.message})});return()=>controller.abort()},[]);return state;}
const EventContext=createContext({items:[],loading:false,error:''});
function useEventData(){return useContext(EventContext)}
function useClock(){const [now,setNow]=useState(()=>Date.now());useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[]);return now;}
function Countdown({to}){const now=useClock();const delta=Math.max(0,to-now), d=Math.floor(delta/86400000),h=Math.floor(delta/3600000)%24,m=Math.floor(delta/60000)%60,s=Math.floor(delta/1000)%60;return <div className="countdown" aria-label={`${d} days ${h} hours ${m} minutes ${s} seconds until the event`}>{[[d,'DAYS'],[h,'HRS'],[m,'MIN'],[s,'SEC']].map(([n,label],i)=><React.Fragment key={label}>{i>0&&<span className="count-colon">:</span>}<span className="count-cell"><strong>{String(n).padStart(2,'0')}</strong><small>{label}</small></span></React.Fragment>)}</div>}
function NextEventBanner(){const config=useConfig();const {items,loading,error}=useEventData();const {openEvent}=useSite();const now=useClock();const next=items.find(e=>eventEnd(e).getTime()>now);return <div className="container"><div className="next-banner"><div className="next-icon"><Icon name="calendar" size={24}/></div><div className="next-copy"><span className="mini-label">{config.nextLabel}</span>{next?<><h3>{next.summary||'Chapter event'}</h3><p>{displayEventDate(next)}{next.location?` · ${next.location}`:''}</p></>:<><h3>{loading?config.nextLoadingTitle:error?config.nextErrorTitle:config.nextEmptyTitle}</h3><p>{!connectedCalendar?config.nextUnconfiguredDescription:config.nextEmptyDescription}</p></>}</div><div className="next-right">{next&&!next.start?.date && eventStart(next).getTime()>now?<Countdown to={eventStart(next).getTime()}/>:next&&eventStart(next).getTime()<=now?<span className="event-live">{config.nextProgressLabel}</span>:<span className="next-coming">{config.nextStayConnected}</span>}{next?<button className="text-link" onClick={()=>openEvent(next)}>{config.nextDetailsLabel} <Icon name="arrow" size={16}/></button>:<a className="text-link" href={config.linkedin} target="_blank" rel="noreferrer">{config.nextFollowLabel} <Icon name="arrow" size={16}/></a>}</div></div></div>}
function SectionHeading({tag,title,description,right}){return <div className="section-heading"><div><span className="kicker"><span className="tiny-square"/>{tag}</span><h2>{title}</h2>{description&&<p>{description}</p>}</div>{right&&<div className="section-heading-right">{right}</div>}</div>}
const defaultMissionCards = [
  { title: 'Learn & innovate', description: 'Seminars, workshops, and exposure to research at the leading edge of microelectronics.', icon: 'bolt' },
  { title: 'Connect & collaborate', description: 'Build bridges between students, academic research, and the semiconductor industry.', icon: 'people' },
  { title: 'Grow & lead', description: 'Create opportunities for professional development and hands-on chapter leadership.', icon: 'layers' },
];
export function AboutBlock({
  blok, eyebrow='01 / ABOUT THE CHAPTER',heading='Where curiosity meets innovation.',description=org.mission,
  pillars,statementHeading='More than a student chapter.',statementHighlight='A launchpad for technical leadership.',
  statementCaption='Established September 28, 2026 · IEEE EPS · Penn State',
  focusTitle='OUR TECHNICAL FOCUS',focusTags,
  showStatement=true,showFocus=true,
}) {
  const cards=Array.isArray(pillars) ? pillars.filter(x=>x?.component==='mission_card') : defaultMissionCards;
  const labels=Array.isArray(focusTags) ? focusTags.map(x=>x.title).filter(Boolean) : org.focus;
  return <section className="section about-section" id="about" {...(blok?storyblokEditable(blok):{})}>
    <div className="container">
      <SectionHeading tag={eyebrow} title={heading} description={description}/>
      <div className={'about-layout '+(!showStatement?'about-no-quote':'')}>
        {showStatement && <div className="about-statement"><span className="quote-mark">“</span>
          <h3>{statementHeading} <span>{statementHighlight}</span></h3>
          <div className="about-rule"/><p>{statementCaption}</p>
        </div>}
        <div className="pillar-grid">
          {cards.map((card,index)=><div className="pillar" key={card._uid||index}
            {...(card._uid?storyblokEditable(card):{})}>
            <span className="pillar-icon"><Icon name={['bolt','people','layers','globe','calendar','checkcircle'].includes(card.icon)?card.icon:'layers'}/></span>
            <h3>{card.title||'Chapter initiative'}</h3><p>{card.description||''}</p>
          </div>)}
        </div>
      </div>
      {showFocus && <div className="focus-wrap"><span>{focusTitle}</span>
        <div className="focus-list">{labels.map((f,i)=><span key={i}>{f}</span>)}</div>
      </div>}
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
function EventCalendar({items,initialMode='month'}){const [mode,setMode]=useState(['month','week','semester'].includes(initialMode)?initialMode:'month');const [cursor,setCursor]=useState(()=>nyDateKey(new Date()));const [sem,setSem]=useState(()=>initialSemester());const {openEvent}=useSite();const today=nyDateKey(new Date());const [y,m]=cursor.split('-').map(Number);const label=mode==='month'?new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(new Date(y,m-1,1)):mode==='week'?`${prettyDate(dateForKey(mondayKey(cursor)))} – ${prettyDate(dateForKey(shiftDateKey(mondayKey(cursor),6)),{year:'numeric'})}`:`${sem.term} ${sem.year}`;
 const shift=n=>{if(mode==='semester')setSem(s=>moveSemester(s,n));else if(mode==='week')setCursor(c=>shiftDateKey(c,7*n));else{let date=new Date(y,m-1+n,1);setCursor(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-01`)}};
 return <div className="calendar-container"><div className="calendar-toolbar"><div className="calendar-title"><Icon name="calendar" size={18}/><strong>{label}</strong></div><div className="calendar-toolbar-actions"><div className="calendar-switch" role="group" aria-label="Calendar view">{['semester','month','week'].map(v=><button key={v} className={mode===v?'selected':''} onClick={()=>setMode(v)} aria-pressed={mode===v}>{v[0].toUpperCase()+v.slice(1)}</button>)}</div><div className="calendar-move"><button aria-label="Previous period" onClick={()=>shift(-1)}>‹</button><button className="today-button" onClick={()=>{setCursor(today);setSem(initialSemester(today))}}>Today</button><button aria-label="Next period" onClick={()=>shift(1)}>›</button></div></div></div><CalendarBody events={items} mode={mode} cursor={cursor} sem={sem} openEvent={openEvent}/><div className="calendar-footer"><span><span className="legend-dot"/> Chapter events · Times in Eastern Time</span>{calendarPublicUrl&&<a href={calendarPublicUrl} target="_blank" rel="noreferrer">Open in Google Calendar <Icon name="external" size={14}/></a>}</div></div>
}
export function EventsBlock({
  title='Something is always in motion.',description='Discover what’s happening, connect with the community, and never miss a chapter event.',
  eyebrow='02 / EVENTS HUB',upcomingTitle='Coming up',calendarTitle='Chapter calendar',
  upcomingCount=3,initialView='month',showUpcoming=true,showCalendar=true
}){
  const {items,loading,error}=useEventData();const config=useConfig();
  const upcoming=items.filter(e=>eventEnd(e).getTime()>Date.now()).slice(0,Math.min(6,Math.max(1,upcomingCount)));
  return <section className="section events-section" id="events"><div className="container">
    <SectionHeading tag={eyebrow} title={title} description={description}
      right={calendarPublicUrl?<a href={calendarPublicUrl} target="_blank" rel="noreferrer" className="text-link">Subscribe to calendar <Icon name="external" size={16}/></a>:null}/>
    {showUpcoming && <><div className="section-subtitle"><h3>{upcomingTitle}</h3><span>UPCOMING EVENTS</span></div>
      <div className="upcoming-grid">
        {loading?<div className="empty-events"><Icon name="clock" size={24}/><strong>Loading the latest events…</strong></div>:
        error?<div className="empty-events"><Icon name="calendar" size={24}/><strong>Calendar connection unavailable</strong><p>{error}</p></div>:
        upcoming.length?upcoming.map(e=><EventCard key={e.id} event={e}/>):
        <div className="empty-events"><span className="empty-icon"><Icon name="calendar" size={24}/></span>
          <strong>No upcoming events announced yet</strong>
          <p>New seminars, workshops, and networking opportunities will appear here automatically once published.</p>
          <a href={config.linkedin} target="_blank" rel="noreferrer" className="text-link">Stay updated on LinkedIn <Icon name="arrow" size={15}/></a>
        </div>}
      </div></>}
    {showCalendar && <><div className="section-subtitle calendar-label"><h3>{calendarTitle}</h3><span>YOUR SCHEDULE AT A GLANCE</span></div>
      <EventCalendar items={items} initialMode={initialView}/></>}
  </div></section>;
}

function HighlightsBlock({
  title='Moments that move us forward.',description='A growing record of seminars, workshops, collaborations, and chapter milestones.',
  eyebrow='03 / COMMUNITY & MOMENTS',emptyTitle='Our story is just beginning.',
  emptyDescription='As our chapter hosts events and initiatives, verified photos and highlights will appear in this space.',
  items=verifiedHighlights
}){
  const config=useConfig();
  const ordered=items; // Preserve Storyblok drag-and-drop card order.
  return <section className="section highlights-section" id="highlights"><div className="container">
    <SectionHeading tag={eyebrow} title={title} description={description}/>
    {ordered.length?<div className="highlights-grid">
      {ordered.map((x,i)=><article key={x._uid||i} {...(x._uid?storyblokEditable(x):{})} className="highlight-card">
        <div className="highlight-image">{x.image?<img src={x.image} alt={x.title||'Chapter event'} loading="lazy"/>:<Icon name="layers" size={35}/>}</div>
        <div className="highlight-copy"><span>{[x.featured?'FEATURED':null,x.category,x.date].filter(Boolean).join(' · ')||'CHAPTER EVENT'}</span>
          <h3>{x.title}</h3><p>{x.description}</p>
          {x.link&&<a href={x.link} target="_blank" rel="noreferrer">{x.link_text||'View album'} <Icon name="external" size={14}/></a>}
        </div>
      </article>)}
    </div>:<div className="empty-highlight"><div className="highlight-symbol"><Icon name="layers" size={30}/></div>
      <div><h3>{emptyTitle}</h3><p>{emptyDescription}</p></div>
      <a href={config.linkedin} target="_blank" rel="noreferrer" className="text-link">Follow our progress <Icon name="arrow" size={16}/></a>
    </div>}
  </div></section>;
}

function ArchiveBlock({title='Chapter event archive.',eyebrow='EVENT HISTORY',emptyDescription='The archive will grow as the chapter hosts its first events.',maxItems=25,showSearch=true}) {
 const {items}=useEventData(); const {openEvent}=useSite();
 const [search,setSearch]=useState(''), [year,setYear]=useState('All');
 const history=useMemo(()=>items.filter(e=>eventEnd(e).getTime()<Date.now()).sort((a,b)=>eventStart(b)-eventStart(a)),[items]);
 const years=[...new Set(history.map(e=>nyDateKey(eventStart(e)).slice(0,4)))];
 const visible=history.filter(e=>(year==='All'||eventDateKey(e).startsWith(year)) && [e.summary,e.description,e.location].join(' ').toLowerCase().includes(search.toLowerCase()));
 return <section className="archive-section" id="archive"><div className="container"><div className="archive-heading"><div><span className="kicker"><span className="tiny-square"/>{eyebrow}</span><h3>{title}</h3></div>{showSearch&&<div className="archive-filters"><label className="sr-only" htmlFor="archive-search">Search past events</label><input id="archive-search" placeholder="Search events…" value={search} onChange={e=>setSearch(e.target.value)}/><label className="sr-only" htmlFor="archive-year">Filter event year</label><select id="archive-year" value={year} onChange={e=>setYear(e.target.value)}><option>All</option>{years.map(y=><option key={y}>{y}</option>)}</select></div>}</div>{visible.length?<div className="archive-rows">{visible.slice(0,maxItems).map(e=><button key={e.id} className="archive-row" onClick={()=>openEvent(e)}><span className="archive-row-date">{prettyDate(eventStart(e),{month:'short',day:'numeric',year:'numeric'})}</span><strong>{e.summary}</strong><span>Details <Icon name="arrow" size={14}/></span></button>)}{visible.length>maxItems&&<div className="archive-more">Showing {maxItems} of {visible.length} matching past events. Refine the search to find more.</div>}</div>:<div className="archive-empty">{items.length?'No past events match the selected filters.':emptyDescription}</div>}</div></section>
}
export function PartnersBlock({
 title='Build the future with us.',description='Partner with emerging engineering talent through technical talks, workshops, sponsorship, and shared opportunities to connect academia and industry.',
 eyebrow='04 / PARTNERS & INDUSTRY',buttonText='Explore collaboration',
 featureHeading='Better together.',featureCaption='From classroom ideas to industry impact.',
 offers,showVisual=true,partners=confirmedPartners
}){
 const {openForm}=useSite();
 const chips=Array.isArray(offers)?offers.map(x=>x.title).filter(Boolean):['Event sponsorship','Industry talks','Workshops','Research connections'];
 return <section className="section partners-section" id="partners"><div className="container">
  <div className="partner-panel"><div className="partner-panel-copy">
    <span className="kicker kicker-light"><span className="tiny-square"/>{eyebrow}</span>
    <h2>{title}</h2><p>{description}</p><div className="partner-chips">{chips.map((x,i)=><span key={i}>{x}</span>)}</div>
    {buttonText&&<button className="button button-white" onClick={()=>openForm('sponsor')}>{buttonText} <Icon name="arrow" size={18}/></button>}
   </div>
   {showVisual&&<div className="partner-feature"><span className="partner-plus">+</span>
      <div className="partner-feature-inner"><span>COLLABORATION / 01</span><div className="partner-feature-visual"><div/><div/><div/><div/></div>
      <strong>{featureHeading}</strong><small>{featureCaption}</small></div></div>}
  </div>
  {partners?.length?<div className="partner-logo-panel"><span>OUR PARTNERS & SUPPORTERS</span><div className="partner-logos">
    {partners.map((p,i)=><a key={p._uid||i} {...(p._uid?storyblokEditable(p):{})}
      href={p.website || undefined} target="_blank" rel="noreferrer" title={p.description||p.name}>
      {p.logo?<img src={p.logo} alt={p.name} loading="lazy"/>:<strong>{p.name}</strong>}
      {p.category&&<small className="partner-type">{p.category==='academic'?'Academic collaborator':p.category==='industry'?'Industry collaborator':'Sponsor'}</small>}
    </a>)}
   </div></div>:<div className="partners-empty"><span>Interested in supporting the chapter?</span>
    <button onClick={()=>openForm('sponsor')}>Start a conversation <Icon name="arrow" size={15}/></button>
   </div>}
 </div></section>;
}

function Initials({name}){return <span className="portrait-initials">{name.split(' ').filter(x=>!['Md.','Hasan'].includes(x)).slice(0,2).map(x=>x[0]).join('')}</span>}
export function TeamBlock({
  title='The people building our chapter.',description='Student leadership dedicated to launching an inclusive, forward-thinking technical community.',
  eyebrow='05 / OUR TEAM',advisor=org.advisor,advisorLabel='FACULTY ADVISOR',
  interimNote="Interim founding leadership facilitates the chapter's initial activities pending the formal election process.",
  people=leadership
}){
  return <section className="section team-section" id="team"><div className="container">
    <SectionHeading tag={eyebrow} title={title} description={description}/>
    <div className="advisor-bar"><div className="advisor-mark"><Icon name="layers" size={24}/></div><div><span>{advisorLabel}</span><strong>{advisor}</strong></div><span className="advisor-badge">Penn State</span></div>
    <div className="team-grid">{people?.map((p,i)=><div className="team-card" key={p._uid||i} {...(p._uid?storyblokEditable(p):{})}>
      <div className="team-avatar">{p.photo?<img src={p.photo} alt={p.name} loading="lazy"/>:<Initials name={p.name}/>}</div>
      <div className="team-text"><h3>{p.name}</h3><p>{p.role}</p>
        {p.program&&<small className="team-program">{p.program}</small>}
        {p.biography&&<p className="team-bio">{p.biography}</p>}
      </div>{p.linkedin&&<a href={p.linkedin} target="_blank" rel="noreferrer" className="team-link" aria-label={`${p.name} on LinkedIn`}><Icon name="linkedin" size={17}/></a>}
    </div>)}</div>
    {interimNote&&<p className="team-note">{interimNote}</p>}
  </div></section>;
}

function JoinCalloutBlock({
 title='Find your place in what’s next.',description='Whether you are curious about advanced packaging or already working at its frontier, there is room for you here.',
 eyebrow='THE NEXT GENERATION STARTS HERE',buttonText='Join the community',showButton=true
}){
 const {openForm}=useSite();return <div className="container"><div className="join-callout"><div>
  <span className="kicker kicker-light">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>
  {showButton&&<button className="button button-white" onClick={()=>openForm('join')}>{buttonText} <Icon name="arrow" size={17}/></button>}
 </div></div>;
}

function ContactBlock({
  title='Let’s connect.',description="Questions, new ideas, speaking opportunities, partnerships—we'd love to hear from you.",
  eyebrow='06 / GET IN TOUCH',email,address,linkedin,contactButtonText='Send a message',
  faqHeading='Frequently asked',showFaq=true,
  items=faqs.map(([question,answer])=>({question,answer}))
}){
 const {openForm}=useSite();const [expanded,setExpanded]=useState(-1);const config=useConfig();
 const displayedEmail=email||config.email;
 const linkedIn=linkedin||config.linkedin;
 const contactAddress=address||'IEEE EPS Penn State Student Chapter\nThe Pennsylvania State University\nUniversity Park, PA';
 return <section className="section contact-section" id="contact"><div className="container">
  <SectionHeading tag={eyebrow} title={title} description={description}/>
  <div className="contact-layout"><div className="contact-panel"><span className="contact-small">REACH THE CHAPTER</span>
   <a className="contact-email" href={`mailto:${displayedEmail}`}>{displayedEmail} <Icon name="arrow" size={19}/></a>
   <p className="cms-preserve-lines">{contactAddress}</p>
   <div className="contact-actions"><button className="button" onClick={()=>openForm('contact')}>{contactButtonText} <Icon name="arrow" size={16}/></button>
     {linkedIn&&<a href={linkedIn} className="button button-soft" target="_blank" rel="noreferrer"><Icon name="linkedin" size={17}/> LinkedIn</a>}
   </div></div>
   {showFaq&&<div className="faq-panel"><div className="faq-heading"><h3>{faqHeading}</h3><span>FAQ</span></div>
     {items.map(({question:q,answer:a,_uid,component},i)=><div className="faq-item" key={_uid||i}
       {...(_uid?storyblokEditable({_uid,component:component||'faq_item'}):{})}>
       <button onClick={()=>setExpanded(v=>v===i?-1:i)} aria-expanded={expanded===i}><span>{q}</span><Icon name={expanded===i?'minus':'plus'} size={18}/></button>
       {expanded===i&&<p>{a}</p>}
     </div>)}
   </div>}
  </div>
 </div></section>;
}

function Footer(){const config=useConfig();const primary=(config.footerPrimary||DEFAULT_SITE_SETTINGS.footerPrimary).replaceAll('{year}',String(new Date().getFullYear()));return <footer className="footer"><div className="container footer-main"><Brand compact/><div className="footer-nav">{links.map(x=><a href={'#'+x.id} key={x.id}>{config.navLabels?.[x.id]||x.label}</a>)}</div><a className="footer-up" href="#home" aria-label="Back to top">↑</a></div><div className="container footer-bottom"><span>{primary}</span><span>{config.footerSecondary}</span></div></footer>}
function Modal({kind,event,onClose}){const config=useConfig();const [status,setStatus]=useState({type:'',message:''}),[submitting,setSubmitting]=useState(false);useEffect(()=>{const onKey=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',onKey);document.body.classList.add('modal-open');return()=>{document.body.classList.remove('modal-open');window.removeEventListener('keydown',onKey)}},[onClose]);
 const names={contact:'Send us a message',sponsor:'Explore a partnership',join:'Join the community'};const desc={contact:'General inquiries, event suggestions, or questions about the chapter.',sponsor:'Tell us a little about the opportunity you have in mind.',join:'Express your interest in IEEE EPS Penn State activities.'};const ids={contact:import.meta.env.VITE_FORMSPREE_CONTACT_ID,sponsor:import.meta.env.VITE_FORMSPREE_SPONSOR_ID,join:import.meta.env.VITE_FORMSPREE_JOIN_ID};const id=ids[kind];
 async function submit(e){e.preventDefault();const form=e.currentTarget;if(!id){setStatus({type:'error',message:'This form is not connected yet. Please email the chapter directly.'});return}setSubmitting(true);setStatus({type:'',message:''});try{const response=await fetch(`https://formspree.io/f/${encodeURIComponent(id)}`,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.errors?.map(e=>e.message).join(' ')||'Submission failed');form.reset();setStatus({type:'success',message:'Thanks! Your message has been submitted successfully.'})}catch(e){setStatus({type:'error',message:e.message||'Something went wrong. Please try again.'})}finally{setSubmitting(false)}}
 if(event)return <div className="modal-backdrop" onClick={onClose}><div className="dialog" role="dialog" aria-modal="true" aria-label="Event details" onClick={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={onClose}><Icon name="close"/></button><span className="kicker"><span className="tiny-square"/>CHAPTER EVENT</span><h2>{event.summary||'Chapter event'}</h2><div className="event-detail-row"><Icon name="calendar"/> {displayEventDate(event)}</div>{event.location&&<div className="event-detail-row"><Icon name="pin"/> {event.location}</div>}{event.description&&<p className="modal-description">{event.description.replace(/<[^>]*>/g,'').slice(0,2500)}</p>}<div className="modal-actions">{event.htmlLink&&<a className="button" href={event.htmlLink} target="_blank" rel="noreferrer">Open calendar event <Icon name="external" size={16}/></a>}<button className="button button-soft" onClick={onClose}>Close</button></div></div></div>;
 return <div className="modal-backdrop" onClick={onClose}><div className="dialog" role="dialog" aria-modal="true" aria-label={names[kind]} onClick={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close" onClick={onClose}><Icon name="close"/></button><span className="kicker"><span className="tiny-square"/>CONNECT WITH IEEE EPS</span><h2>{names[kind]}</h2><p className="modal-intro">{desc[kind]}</p>{status.type==='success'?<div className="status-message success"><Icon name="checkcircle"/> {status.message}</div>:<form className="chapter-form" onSubmit={submit}><label>Full name<input required name="name" placeholder="Your name" autoComplete="name"/></label><label>Email address<input required name="email" type="email" placeholder="name@example.com" autoComplete="email"/></label>{kind==='sponsor'&&<><label>Organization<input required name="organization" placeholder="Company or institution"/></label><label>Inquiry type<select name="inquiry_type" defaultValue="Industry collaboration"><option>Industry collaboration</option><option>Event sponsorship</option><option>Technical talk / speaker</option><option>Workshop</option><option>Other</option></select></label></>}{kind==='join'&&<><label>Academic program<input name="academic_program" placeholder="e.g. PhD Electrical Engineering"/></label><label>Technical interests<input name="interests" placeholder="Packaging, photonics, reliability…"/></label></>}{kind==='contact'&&<label>Subject<input required name="subject" placeholder="How can we help?"/></label>}{kind!=='join'&&<label>Message<textarea required name="message" rows="4" placeholder="Share a few details…"/></label>}<input type="hidden" name="source" value="IEEE EPS Penn State website"/><button className="button submit-button" disabled={submitting} type="submit">{submitting?'Sending…':'Submit inquiry'} <Icon name="arrow" size={16}/></button>{kind==='join'&&<small>Expressing interest does not create or replace official IEEE membership.</small>}{!id&&<p className="form-setup-note">Online submissions are awaiting Formspree connection. For now, contact <a href={`mailto:${config.email}`}>{config.email}</a>.</p>}{status.type==='error'&&<div role="alert" className="status-message error">{status.message}</div>}</form>}</div></div>;
}
// The rest of the site remains the original working design, independently of Storyblok.
function FallbackHome({onSettingsChange}) { return <HomepageSections onSettingsChange={onSettingsChange}/>; }
function App() {
  const [overlay, setOverlay] = useState(null);
  const [siteSettings,setSiteSettings]=useState(DEFAULT_SITE_SETTINGS);
  useEffect(() => {
    // Reflect the published favicon in the browser tab without editing public/favicon.svg.
    let icon=document.querySelector('link[rel="icon"]');
    if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon);}
    if(!icon.dataset.originalHref)icon.dataset.originalHref=icon.getAttribute('href') || '/favicon.svg';
    const source=siteSettings.favicon || icon.dataset.originalHref;
    if(icon.getAttribute('href')!==source)icon.setAttribute('href',source);
  }, [siteSettings.favicon]);
  const eventData = useEvents();
  const context = useMemo(() => ({
    openForm: kind => setOverlay({ kind }),
    openEvent: event => setOverlay({ event }),
  }), []);
  return <SiteConfigContext.Provider value={siteSettings}><SiteContext.Provider value={context}>
    <EventContext.Provider value={eventData}>
      <a className="skip-link" href="#main">Skip to main content</a>
      <Header />
      <main id="main"><FallbackHome onSettingsChange={setSiteSettings}/></main>
      <Footer />
      {overlay && <Modal key={overlay.kind || overlay.event?.id}
        kind={overlay.kind} event={overlay.event} onClose={() => setOverlay(null)} />}
    </EventContext.Provider>
  </SiteContext.Provider></SiteConfigContext.Provider>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
