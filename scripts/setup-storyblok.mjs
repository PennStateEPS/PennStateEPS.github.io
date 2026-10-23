/**
 * IEEE EPS Penn State – Visual CMS v5 non-destructive migration.
 * Triggered on push by .github/workflows/storyblok-v5.yml.
 * Requires GitHub Actions secret STORYBLOK_MANAGEMENT_TOKEN.
 * Updates schema (additive), enriches missing optional fields, and SAVES A DRAFT.
 * Never publishes. Existing story blocks, data, ordering and nested card contents
 * are preserved. Re-running is safe and idempotent.
 */
import { randomUUID } from 'node:crypto';
import { components, sectionNames } from './storyblok-schema.mjs';
import { organization, leadership, faqs } from '../src/content.js';

const token=process.env.STORYBLOK_MANAGEMENT_TOKEN;
const space=process.env.STORYBLOK_SPACE_ID || '296068433309933';
const home=process.env.STORYBLOK_HOME_STORY_ID || '233495306517377';
if (!token) throw Error('MISSING ACTIONS SECRET: STORYBLOK_MANAGEMENT_TOKEN. See README: Step 1.');
if (!/^\d+$/.test(space) || !/^\d+$/.test(home)) throw Error('Space ID and Home story ID must be numeric.');
const BASE=`https://mapi.storyblok.com/v1/spaces/${space}`;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function api(path,method='GET',data=null){
  for(let n=0;n<5;n++){
    const r=await fetch(BASE+path,{
      method,headers:{Authorization:token,'Content-Type':'application/json',Accept:'application/json'},
      body:data?JSON.stringify(data):undefined
    });
    const raw=await r.text();let j={};try{j=raw?JSON.parse(raw):{}}catch{}
    if(!r.ok){
      if(n<4 && (r.status===429||r.status>=500)){await pause(700*2**n);continue;}
      throw Error(`Storyblok ${method} ${path} failed: HTTP ${r.status}: ${String(j.error||j.message||raw).slice(0,300)}`);
    }
    await pause(350);
    return j;
  }
  throw Error('API retry exhausted');
}
const mk=(component,fields={})=>({_uid:randomUUID(),component,...fields});
const textItems=values=>values.map(title=>mk('focus_tag',{title}));
const offers=['Event sponsorship','Industry talks','Hands-on workshops','Research connections'].map(title=>mk('partner_offer',{title}));
const pillarDefaults=[
 mk('mission_card',{title:'Learn & innovate',description:'Seminars, workshops, and exposure to research at the leading edge of microelectronics.',icon:'bolt'}),
 mk('mission_card',{title:'Connect & collaborate',description:'Build bridges between students, academic research, and the semiconductor industry.',icon:'people'}),
 mk('mission_card',{title:'Grow & lead',description:'Create opportunities for professional development and hands-on chapter leadership.',icon:'layers'})
];
const defaultFields={
 hero:{
  eyebrow:'IEEE ELECTRONICS PACKAGING SOCIETY',headline:'Engineering',highlight:'what’s next.',
  description:'Connecting the next generation of engineers, researchers, and industry leaders to advance semiconductor packaging and microelectronics.',
  primary_button_text:'Explore events',primary_button_url:'#events',secondary_button_text:'Get involved',secondary_button_url:'#join',
  illustration_mode:'circuit',show_next_event:true,badge_text:'OFFICIALLY EST. 09.28.2026',location_text:'University Park, Pennsylvania',
  art_panel_title:'ADVANCED PACKAGING',art_panel_subtitle:'PSU / EPS',
  art_chip_one:'PHOTONICS',art_chip_two:'CHIPLETS',art_chip_three:'INTEGRATION',art_chip_center:'EPS',
  art_panel_footer:'INTERCONNECT THE FUTURE',art_panel_status:'ACTIVE NETWORK',
  art_caption_one_label:'01 / SYSTEMS',art_caption_one_title:'Packaging innovation',
  art_caption_two_label:'02 / COMMUNITY',art_caption_two_title:'Ideas into impact' 
 },
 about_section:{
  eyebrow:'01 / ABOUT THE CHAPTER',heading:'Where curiosity meets innovation.',description:organization.mission,
  pillars:pillarDefaults,statement_heading:'More than a student chapter.',statement_highlight:'A launchpad for technical leadership.',
  statement_caption:'Established September 28, 2026 · IEEE EPS · Penn State',focus_title:'OUR TECHNICAL FOCUS',
  focus_tags:textItems(organization.focus),show_statement:true,show_focus:true
 },
 events_section:{title:'Something is always in motion.',description:'Discover what’s happening, connect with the community, and never miss a chapter event.',eyebrow:'02 / EVENTS HUB',upcoming_title:'Coming up',calendar_title:'Chapter calendar',upcoming_count:'3',initial_view:'month',show_upcoming:true,show_calendar:true},
 highlights_section:{title:'Moments that move us forward.',description:'A growing record of seminars, workshops, collaborations, and chapter milestones.',eyebrow:'03 / COMMUNITY & MOMENTS',items:[],empty_title:'Our story is just beginning.',empty_description:'As our chapter hosts events and initiatives, verified photos and highlights will appear in this space.'},
 archive_section:{title:'Chapter event archive.',eyebrow:'EVENT HISTORY',empty_description:'The archive will grow as the chapter hosts its first events.',max_items:'25',show_search:true},
 partners_section:{title:'Build the future with us.',description:'Partner with emerging engineering talent through technical talks, workshops, sponsorship, and shared opportunities to connect academia and industry.',eyebrow:'04 / PARTNERS & INDUSTRY',button_text:'Explore collaboration',feature_heading:'Better together.',feature_caption:'From classroom ideas to industry impact.',offers,partners:[],show_visual:true},
 team_section:{title:'The people building our chapter.',description:'Student leadership dedicated to launching an inclusive, forward-thinking technical community.',eyebrow:'05 / OUR TEAM',advisor:organization.advisor,advisor_label:'FACULTY ADVISOR',interim_note:"Interim founding leadership facilitates the chapter's initial activities pending the formal election process.",people:leadership.map(p=>mk('team_member',{name:p.name,role:p.role}))},
 join_section:{title:'Find your place in what’s next.',description:'Whether you are curious about advanced packaging or already working at its frontier, there is room for you here.',eyebrow:'THE NEXT GENERATION STARTS HERE',button_text:'Join the community',show_button:true},
 contact_section:{title:'Let’s connect.',description:'Questions, new ideas, speaking opportunities, partnerships—we’d love to hear from you.',eyebrow:'06 / GET IN TOUCH',email:'',linkedin:'',address:'IEEE EPS Penn State Student Chapter\nThe Pennsylvania State University\nUniversity Park, PA',contact_button_text:'Send a message',faq_heading:'Frequently asked',faqs:faqs.map(([question,answer])=>mk('faq_item',{question,answer})),show_faq:true},
};
const appearance={visible:true,tone:'default',spacing:'standard',heading_alignment:'left',layout:'auto'};
function enrich(obj){
  const current={...obj};
  if(sectionNames.includes(current.component)) {
    for (const [key,val] of Object.entries({...defaultFields[current.component],...appearance})){
      // Missing fields only; never alter intentional blank strings, false booleans or empty collections.
      if(current[key]===undefined)current[key]=structuredClone(val);
    }
  }
  return current;
}
console.log('v5 migration: loading Storyblok component definitions');
const listing=await api('/components/');
const existing=new Map((listing.components||[]).map(c=>[c.name,c]));
for(const desired of components){
  const old=existing.get(desired.name);
  if(old){
    const schema={...old.schema};
    for(const [field,definition] of Object.entries(desired.schema)){
      if(!schema[field])schema[field]=definition;
      else if(definition.type==='bloks'){
        schema[field]={...schema[field],restrict_components:true,component_whitelist:definition.component_whitelist};
      } else if(definition.type==='option' && Array.isArray(schema[field].options)){
        const merged=[...schema[field].options];
        for(const next of definition.options||[]){if(!merged.some(old=>old.value===next.value))merged.push(next);}
        schema[field]={...schema[field],options:merged};
      }
      // Refresh editor-facing labels without changing any existing story data.
      schema[field]={...schema[field],display_name:definition.display_name||schema[field].display_name};
    }
    await api(`/components/${old.id}`,'PUT',{component:{id:old.id,name:old.name,
      display_name:desired.display_name,is_root:old.is_root,is_nestable:old.is_nestable,schema}});
    console.log('Extended:',desired.name);
  }else{
    await api('/components/','POST',{component:desired});
    console.log('Created:',desired.name);
  }
}
console.log('Loading existing Home draft and preserving block order and user content');
const j=await api(`/stories/${home}`);
const story=j.story;
if(story?.slug!=='home'||story?.content?.component!=='page'||!Array.isArray(story.content.body)){
  throw Error('The story is not the expected Home page. No story changes were written.');
}
const content=structuredClone(story.content);
const original=content.body;
const next=original.map(enrich);
for(const name of sectionNames){
  if(!next.some(b=>b.component===name))next.push(enrich(mk(name)));
}
content.body=next;
for(const [k,v] of Object.entries({
  full_cms_layout:true,site_theme:'ieee',site_density:'compact',site_width:'standard',
  contact_email:organization.email,linkedin_url:organization.linkedin,
  logo_display_mode:'mark',chapter_logo_alt:'IEEE EPS Penn State chapter logo',
  brand_title:'',brand_subtitle:'STUDENT CHAPTER',
  topline_left:'IEEE Electronics Packaging Society · Penn State',topline_right:'Established 2026',
  header_join_text:'Join the chapter',
  nav_about:'About',nav_events:'Events',nav_highlights:'Highlights',nav_partners:'Partners',nav_team:'Team',nav_contact:'Contact',
  footer_primary:'© {year} IEEE EPS Penn State Student Chapter. Established September 28, 2026.',
  footer_secondary:'Independent student chapter website · University Park, PA',
  next_event_label:'NEXT ON THE CALENDAR',next_event_empty_title:'The next chapter event is on its way.',
  next_event_empty_description:'Follow us for new events and announcements.',
  next_event_unconfigured_description:'Our Google Calendar can be connected when the site goes live.',
  next_event_loading_title:'Loading chapter events…',next_event_error_title:'Calendar temporarily unavailable',
  next_event_stay_label:'STAY CONNECTED',next_event_live_label:'EVENT IN PROGRESS',
  next_event_details_label:'Event details',next_event_follow_label:'Follow our updates' 
})) if(content[k]===undefined) content[k]=v;
// Explicitly save a DRAFT — do not change published homepage until editor reviews it.
await api(`/stories/${story.id}`,'PUT',{publish:false,story:{id:story.id,name:story.name,slug:story.slug,content}});
console.log(`SAVED DRAFT: ${next.length} sections, ${components.length} schemas; public website not published.`);
console.log('Open Storyblok → Content → Home → review, then Save → Publish.');
