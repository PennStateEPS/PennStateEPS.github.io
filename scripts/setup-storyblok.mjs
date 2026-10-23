/**
 * ONE-TIME, NON-DESTRUCTIVE CMS setup for IEEE EPS Penn State.
 * GitHub Actions secret STORYBLOK_MANAGEMENT_TOKEN must be provided.
 * Does not publish; inspect the draft Home story in Storyblok before clicking Publish.
 */
import {randomUUID} from 'node:crypto';
import {components, sectionOrder} from './storyblok-schema.mjs';
import {organization, leadership, faqs} from '../src/content.js';

const token=process.env.STORYBLOK_MANAGEMENT_TOKEN;
const space=process.env.STORYBLOK_SPACE_ID || '296068433309933';
const storyId=process.env.STORYBLOK_HOME_STORY_ID || '233495306517377';
if (!token) throw new Error('Missing STORYBLOK_MANAGEMENT_TOKEN Actions secret.');
if (!/^\d+$/.test(space)||!/^\d+$/.test(storyId)) throw new Error('Storyblok Space ID/Story ID must be numeric.');
const base=`https://mapi.storyblok.com/v1/spaces/${space}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function request(path,{method='GET',data}={}){
  const url=base+path;
  for (let attempt=0;attempt<5;attempt++) {
    const response=await fetch(url,{method,headers:{Authorization:token,'Content-Type':'application/json',Accept:'application/json'},
      body:data?JSON.stringify(data):undefined});
    if (response.status===429 || response.status>=500) { if(attempt<4){await sleep(1000*Math.pow(2,attempt));continue;} }
    const raw=await response.text();let json={};try{json=raw?JSON.parse(raw):{};}catch{}
    if (!response.ok) throw new Error(`${method} ${path} failed (HTTP ${response.status}): ${String(json.error||json.message||raw).slice(0,380)}`);
    await sleep(370);
    return json;
  }
  throw new Error(`Storyblok API retry limit reached: ${path}`);
}
const uid=()=>randomUUID();
const block=(component,props={})=>({_uid:uid(),component,...props});
const defaults={
  hero:()=>block('hero',{
    eyebrow:'IEEE ELECTRONICS PACKAGING SOCIETY',headline:'Engineering',highlight:'what’s next.',
    description:'Connecting the next generation of engineers, researchers, and industry leaders to advance semiconductor packaging and microelectronics.',
    primary_button_text:'Explore events',primary_button_url:'#events',secondary_button_text:'Get involved',secondary_button_url:'#join'
  }),
  about_section:()=>block('about_section',{
    eyebrow:'01 / ABOUT THE CHAPTER',heading:'Where curiosity meets innovation.',description:organization.mission,
    pillars:[
      block('mission_card',{title:'Learn & innovate',description:'Seminars, workshops, and exposure to research at the leading edge of microelectronics.',icon:'bolt'}),
      block('mission_card',{title:'Connect & collaborate',description:'Build bridges between students, academic research, and the semiconductor industry.',icon:'people'}),
      block('mission_card',{title:'Grow & lead',description:'Create opportunities for professional development and hands-on chapter leadership.',icon:'layers'})
    ]
  }),
  events_section:()=>block('events_section',{title:'Something is always in motion.',description:'Discover what’s happening, connect with the community, and never miss a chapter event.'}),
  highlights_section:()=>block('highlights_section',{title:'Moments that move us forward.',description:'A growing record of seminars, workshops, collaborations, and chapter milestones.',items:[]}),
  archive_section:()=>block('archive_section',{title:'Chapter event archive.'}),
  partners_section:()=>block('partners_section',{title:'Build the future with us.',description:'Partner with emerging engineering talent through technical talks, workshops, sponsorship, and shared opportunities to connect academia and industry.',partners:[]}),
  team_section:()=>block('team_section',{
    title:'The people building our chapter.',description:'Student leadership dedicated to launching an inclusive, forward-thinking technical community.',
    advisor:organization.advisor,
    people:leadership.map(person=>block('team_member',{name:person.name,role:person.role,
      ...(person.photo?{photo:person.photo}:{}),...(person.linkedin?{linkedin:person.linkedin}:{})}))
  }),
  join_section:()=>block('join_section',{title:'Find your place in what’s next.',description:'Whether you are curious about advanced packaging or already working at its frontier, there is room for you here.',button_text:'Join the community'}),
  contact_section:()=>block('contact_section',{title:'Let’s connect.',description:'Questions, new ideas, speaking opportunities, partnerships—we’d love to hear from you.',faqs:faqs.map(([question,answer])=>block('faq_item',{question,answer}))})
};

console.log('Checking existing components and preserving existing schema fields…');
const listing=await request('/components/');
const existing=new Map((listing.components||[]).map(c=>[c.name,c]));
for (const desired of components){
  const curr=existing.get(desired.name);
  if(curr){
    const merged={...curr, schema:{...curr.schema}};
    // Merge missing fields and tighten the top-level/nested field allow-lists;
    // do not overwrite user-defined text, options, field display settings, or data.
    for(const [key,settings] of Object.entries(desired.schema)){
      if(!merged.schema[key]) merged.schema[key]=settings;
      else if(settings.type==='bloks') merged.schema[key]={...merged.schema[key],restrict_components:true,
        component_whitelist:settings.component_whitelist};
    }
    await request(`/components/${curr.id}`,{method:'PUT',data:{component:{
      name:curr.name,id:curr.id,display_name:curr.display_name||desired.display_name,
      is_root:curr.is_root,is_nestable:curr.is_nestable,schema:merged.schema
    }}});
    console.log('Updated fields (preserved existing):',desired.name);
  } else {
    await request('/components/',{method:'POST',data:{component:desired}});
    console.log('Created:',desired.name);
  }
}
console.log('Reading the existing Home story (draft) before appending new sections…');
const response=await request(`/stories/${storyId}`);
const story=response.story;
if(!story || story.slug!=='home' || story.content?.component!=='page'){
  throw new Error('This is not the Home story of content type page. Nothing was written to the story.');
}
const original=Array.isArray(story.content.body)?story.content.body:[];
const byType=new Map(original.map(b=>[b.component,b]));
const merged=sectionOrder.map(type=>{
  const present=byType.get(type);
  if(!present)return defaults[type]();
  if(type==='about_section' && !Array.isArray(present.pillars)) return {...present,pillars:defaults.about_section().pillars};
  if(type==='team_section' && !Array.isArray(present.people)) return {...present,people:defaults.team_section().people};
  if(type==='contact_section' && !Array.isArray(present.faqs)) return {...present,faqs:defaults.contact_section().faqs};
  if(type==='partners_section' && !Array.isArray(present.partners)) return {...present,partners:[]};
  if(type==='highlights_section' && !Array.isArray(present.items)) return {...present,items:[]};
  return present;
});
const additional=original.filter(b=>!sectionOrder.includes(b.component));
const next={...story.content,body:[...merged,...additional],full_cms_layout:true};
await request(`/stories/${story.id}`,{method:'PUT',data:{publish:false,story:{id:story.id,name:story.name,slug:story.slug,content:next}}});
console.log('Saved Storyblok Home DRAFT with sections:',merged.map(x=>x.component).join(', '));
console.log('DONE — Review Storyblok > Content > Home, verify leadership, then Publish when the new GitHub version is live.');
