// IEEE EPS Penn State – Visual CMS v5 schema.
// Every field is backed by a React visual or functional control.
const text=(pos,display_name,description='')=>({type:'text',pos,display_name,description});
const textarea=(pos,display_name)=>({type:'textarea',pos,display_name});
const asset=(pos,display_name)=>({type:'asset',pos,display_name,filetypes:['images']});
const boolean=(pos,display_name)=>({type:'boolean',pos,display_name});
const option=(pos,display_name,items)=>({type:'option',pos,display_name,options:items.map(([value,name])=>({value,name}))});
const blocks=(pos,display_name,whitelist)=>({type:'bloks',pos,display_name,restrict_components:true,component_whitelist:whitelist});
const nest=(name,display_name,schema)=>({name,display_name,is_root:false,is_nestable:true,schema});
const common=(start=50)=>({
  visible:boolean(start,'Appearance · Show section'),
  tone:option(start+1,'Appearance · Background', [['default','Website default'],['light','Light / cool'],['white','Clean white'],['dark','Deep navy']]),
  spacing:option(start+2,'Appearance · Vertical spacing', [['compact','Compact'],['standard','Standard'],['spacious','Spacious']]),
  heading_alignment:option(start+3,'Appearance · Heading alignment', [['left','Left aligned'],['center','Centered']]),
  layout:option(start+4,'Appearance · Grid layout', [['auto','Recommended'],['two','Two columns'],['three','Three columns'],['list','Single column']]),
});
export const sectionNames=['hero','about_section','events_section','highlights_section','archive_section','partners_section','team_section','join_section','contact_section'];
export const components=[
  {name:'page',display_name:'Homepage & site settings',is_root:true,is_nestable:false,schema:{
    body:blocks(0,'Website sections — drag to reorder',sectionNames),
    full_cms_layout:boolean(1,'Use editable section order'),
    site_theme:option(2,'Global · Color palette', [['ieee','IEEE Blue'],['navy','Deep Navy'],['teal','Photonic Teal'],['slate','Slate Monochrome']]),
    site_density:option(3,'Global · Spacing', [['compact','Compact'],['standard','Standard'],['spacious','Spacious']]),
    site_width:option(4,'Global · Content width', [['standard','Standard 1170px'],['wide','Wide 1320px']]),
    contact_email:text(5,'Global · Chapter email'),
    linkedin_url:text(6,'Global · LinkedIn URL'),
  }},
  nest('hero','Homepage Hero',{
    eyebrow:text(0,'Content · Eyebrow'), headline:text(1,'Content · Main headline'), highlight:text(2,'Content · Accent headline'),
    description:textarea(3,'Content · Supporting description'),
    primary_button_text:text(4,'Buttons · Primary label'),primary_button_url:text(5,'Buttons · Primary URL or #anchor'),
    secondary_button_text:text(6,'Buttons · Secondary label'),secondary_button_url:text(7,'Buttons · Secondary URL or #anchor'),
    hero_image:asset(8,'Media · Hero photograph (optional)'),
    illustration_mode:option(9,'Media · Hero visual', [['circuit','Interactive semiconductor artwork'],['image','Use uploaded image'],['none','No artwork']]),
    show_next_event:boolean(10,'Events · Show next-event banner'),
    badge_text:text(11,'Details · Founded badge text'), location_text:text(12,'Details · Location label'),
    ...common(),
  }),
  nest('mission_card','Mission / value card',{
    title:text(0,'Card title'), description:textarea(1,'Card description'),
    icon:option(2,'Card icon',[['bolt','Lightning / innovation'],['people','People / connection'],['layers','Layers / growth'],['globe','Globe'],['calendar','Calendar'],['checkcircle','Checkmark']])
  }),
  nest('focus_tag','Technical focus label',{title:text(0,'Technical area')}),
  nest('about_section','About the Chapter',{
    eyebrow:text(0,'Content · Eyebrow'), heading:text(1,'Content · Heading'),description:textarea(2,'Content · Description'),
    pillars:blocks(3,'Content · Mission cards (drag to reorder)',['mission_card']),
    statement_heading:text(4,'Feature quote · First line'),statement_highlight:text(5,'Feature quote · Accent line'),
    statement_caption:text(6,'Feature quote · Caption'),
    focus_title:text(7,'Focus · Label'), focus_tags:blocks(8,'Focus · Technical areas',['focus_tag']),
    show_statement:boolean(9,'Appearance · Show quote panel'), show_focus:boolean(10,'Appearance · Show focus tags'),
    ...common(),
  }),
  nest('events_section','Events & Calendar',{
    title:text(0,'Content · Heading'),description:textarea(1,'Content · Description'),
    eyebrow:text(2,'Content · Eyebrow'), upcoming_title:text(3,'Content · Upcoming heading'),
    calendar_title:text(4,'Content · Calendar heading'),
    upcoming_count:option(5,'Events · Maximum upcoming cards',[['2','2'],['3','3'],['4','4'],['6','6']]),
    initial_view:option(6,'Calendar · Initial view',[['month','Month'],['week','Week'],['semester','Semester']]),
    show_upcoming:boolean(7,'Appearance · Show event cards'), show_calendar:boolean(8,'Appearance · Show calendar'),
    ...common(),
  }),
  nest('highlight_item','Event highlight card',{
    title:text(0,'Title'),date:text(1,'Event date / label'),description:textarea(2,'Description'),
    image:asset(3,'Cover image'),link:text(4,'Public gallery / album URL'),
    category:text(5,'Category label'),link_text:text(6,'Link label'),featured:boolean(7,'Mark as featured')
  }),
  nest('highlights_section','Highlights & Photos',{
    title:text(0,'Content · Heading'),description:textarea(1,'Content · Description'),
    eyebrow:text(2,'Content · Eyebrow'), items:blocks(3,'Highlight cards (drag to reorder)',['highlight_item']),
    empty_title:text(4,'Empty state · Heading'),empty_description:textarea(5,'Empty state · Description'),
    ...common(),
  }),
  nest('archive_section','Past Events Archive',{
    title:text(0,'Content · Heading'),eyebrow:text(1,'Content · Eyebrow'),
    empty_description:textarea(2,'Content · No-events message'),
    max_items:option(3,'Display · Maximum entries',[['10','10'],['25','25'],['50','50']]),
    show_search:boolean(4,'Display · Show search and year filter'),
    ...common(),
  }),
  nest('partner_offer','Collaboration opportunity',{title:text(0,'Opportunity label')}),
  nest('partner_item','Sponsor / collaborator',{
    name:text(0,'Organization name'),website:text(1,'Organization website https://'),logo:asset(2,'Organization logo'),
    category:option(3,'Partner category',[['sponsor','Sponsor'],['industry','Industry collaborator'],['academic','Academic collaborator']]),
    description:textarea(4,'Optional description'),
  }),
  nest('partners_section','Sponsorship & Partners',{
    title:text(0,'Content · Heading'),description:textarea(1,'Content · Description'),
    eyebrow:text(2,'Content · Eyebrow'),button_text:text(3,'Buttons · Partnership inquiry'),
    feature_heading:text(4,'Artwork · Feature heading'),feature_caption:text(5,'Artwork · Feature caption'),
    offers:blocks(6,'Content · Opportunities',['partner_offer']),
    partners:blocks(7,'Content · Sponsors and collaborators',['partner_item']),
    show_visual:boolean(8,'Appearance · Show illustration'),
    ...common(),
  }),
  nest('team_member','Chapter officer / committee member',{
    name:text(0,'Full name'),role:text(1,'Committee role'),photo:asset(2,'Portrait'),linkedin:text(3,'LinkedIn URL https://'),
    biography:textarea(4,'Short biography (optional)'),program:text(5,'Academic program (optional)')
  }),
  nest('team_section','Leadership & Committee',{
    title:text(0,'Content · Heading'),description:textarea(1,'Content · Description'),
    eyebrow:text(2,'Content · Eyebrow'),advisor:text(3,'Advisor · Name'),advisor_label:text(4,'Advisor · Label'),
    interim_note:textarea(5,'Leadership · Interim committee disclosure'),
    people:blocks(6,'Officers and committee (drag to reorder)',['team_member']),
    ...common(),
  }),
  nest('join_section','Join the Chapter',{
    title:text(0,'Content · Heading'),description:textarea(1,'Content · Description'),
    eyebrow:text(2,'Content · Eyebrow'),button_text:text(3,'Buttons · Join label'),
    show_button:boolean(4,'Buttons · Show Join button'),
    ...common(),
  }),
  nest('faq_item','Frequently asked question',{question:text(0,'Question'),answer:textarea(1,'Answer')}),
  nest('contact_section','Contact & FAQ',{
    title:text(0,'Content · Heading'),description:textarea(1,'Content · Description'),
    eyebrow:text(2,'Content · Eyebrow'),
    email:text(3,'Contact · Email override (blank uses global)'),
    address:textarea(4,'Contact · Mailing address'),linkedin:text(5,'Contact · LinkedIn override (blank uses global)'),
    contact_button_text:text(6,'Buttons · Contact form label'),faq_heading:text(7,'FAQ · Heading'),
    faqs:blocks(8,'FAQ items (drag to reorder)',['faq_item']),
    show_faq:boolean(9,'Appearance · Show FAQs'),
    ...common(),
  })
];
